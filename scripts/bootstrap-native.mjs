#!/usr/bin/env node
/** Build the pinned C dependencies privately; never install into system directories. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { nativeHome } from './native-home.mjs';

const root = resolve(import.meta.dirname, '..');
const lock = JSON.parse(readFileSync(join(import.meta.dirname, 'native-dependencies.lock.json'), 'utf8'));
const extractOnly = process.argv.includes('--extract-only');
const onlyIndex = process.argv.indexOf('--only');
const selected = onlyIndex >= 0 ? process.argv[onlyIndex + 1]?.split(',') : undefined;
if (onlyIndex >= 0 && (!extractOnly || !selected?.length || selected.some(name => !lock.dependencies.some(dependency => dependency.name === name))))
  throw new Error('--only requires --extract-only and comma-separated names from native-dependencies.lock.json.');
const directory = nativeHome(root);
const prefix = join(directory, 'prefix');
const downloads = join(directory, 'downloads');
const sources = join(directory, 'sources');
const logs = join(directory, 'logs');
for (const path of [prefix, downloads, sources, logs]) mkdirSync(path, { recursive: true });
if (!extractOnly && !lock.platforms.includes(process.platform)) throw new Error(`Full native bootstrap supports ${lock.platforms.join(' and ')}; this host is ${process.platform}. Use --extract-only --only minicoro,yyjson for portable source dependencies.`);

function run(command, args, cwd, label, env = process.env) {
  const path = join(logs, label + '.log');
  const descriptor = openSync(path, 'w');
  let result;
  try { result = spawnSync(command, args, { cwd, env, stdio: ['ignore', descriptor, descriptor] }); }
  finally { closeSync(descriptor); }
  if (result.error || result.status !== 0) throw new Error(`${label} failed: ${result.error?.message ?? result.status}. See ${path}\n` + readFileSync(path, 'utf8').split('\n').slice(-24).join('\n'));
}

const dependencies = lock.dependencies.filter(dependency => (!dependency.platforms || dependency.platforms.includes(process.platform)) && (!selected || selected.includes(dependency.name)));
if (selected?.some(name => !dependencies.some(dependency => dependency.name === name)))
  throw new Error(`One or more selected dependencies do not support ${process.platform}.`);
for (const dependency of dependencies) {
  const archive = join(downloads, dependency.archive);
  if (!existsSync(archive)) {
    process.stdout.write(`Downloading ${dependency.name} ${dependency.version}\n`);
    const response = await fetch(dependency.url);
    if (!response.ok) throw new Error(`${dependency.name}: HTTP ${response.status}`);
    writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  }
  const hash = createHash('sha256').update(readFileSync(archive)).digest('hex');
  if (hash !== dependency.sha256) throw new Error(`${dependency.name}: archive checksum mismatch`);
  const source = join(sources, dependency.name);
  if (!existsSync(join(source, '.archive-sha256'))) {
    mkdirSync(source, { recursive: true });
    run('/usr/bin/tar', ['-xf', archive, '-C', source, '--strip-components=1'], directory, 'extract-' + dependency.name);
    writeFileSync(join(source, '.archive-sha256'), hash + '\n');
  } else if (readFileSync(join(source, '.archive-sha256'), 'utf8').trim() !== hash) {
    throw new Error(`${dependency.name}: source tree differs from the dependency lock; choose a new build directory.`);
  }
}
if (extractOnly) process.exit(0);

const sdk = '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
const mac = process.platform === 'darwin';
const cc = process.env.CC ?? (mac ? '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang' : 'clang');
const sysroot = mac && existsSync(sdk) ? ' -isysroot ' + sdk : '';
const environment = { ...process.env, ...(mac ? { SDKROOT: sdk } : {}), CC: cc, CC_FOR_BUILD: cc, CXX: process.env.CXX ?? cc.replace(/clang$/, 'clang++'),
  CFLAGS: `-O2 -fPIC${sysroot}`,
  CXXFLAGS: `-O2 -fPIC${sysroot}`,
  CPPFLAGS: `-I${prefix}/include${sysroot}`, LDFLAGS: `-L${prefix}/lib -Wl,-rpath,${prefix}/lib`,
  PKG_CONFIG: join(prefix, 'bin', 'pkgconf'), PKG_CONFIG_PATH: join(prefix, 'lib', 'pkgconfig'),
  LD_LIBRARY_PATH: `${prefix}/lib${process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : ''}`,
  PATH: join(prefix, 'bin') + ':' + process.env.PATH,
};
const parallel = String(Math.min(8, availableParallelism()));
for (const name of ['pkgconf', 'gmp', 'nettle', 'gnutls']) {
  const marker = join(prefix, '.built-' + name);
  const checksum = lock.dependencies.find(dependency => dependency.name === name).sha256;
  if (existsSync(marker)) {
    if (readFileSync(marker, 'utf8').trim() !== checksum) throw new Error(`${name}: installed build differs from the dependency lock; choose a new build directory.`);
    continue;
  }
  const source = join(sources, name);
  const extra = name === 'gmp' ? ['--disable-cxx', '--with-pic'] : name === 'nettle' ? ['--disable-documentation'] : name === 'gnutls' ? [
    '--disable-doc', '--disable-tests', '--disable-tools', '--disable-cxx', '--disable-guile',
    '--disable-nls', '--disable-idn', '--without-p11-kit', '--without-brotli', '--without-zstd',
    '--with-included-libtasn1', '--with-included-unistring', '--disable-libdane',
  ] : [];
  // GnuTLS 3.8.13's audit header does not define this diagnostic-only macro
  // when Clang 14 reports __has_c_attribute but lacks [[maybe_unused]].
  const buildEnvironment = name === 'gnutls' && !mac ?
    {...environment, CFLAGS: environment.CFLAGS + ' -DCRAU_MAYBE_UNUSED='} : environment;
  process.stdout.write(`Building ${name}; logs: ${logs}\n`);
  run(join(source, 'configure'), ['--prefix=' + prefix, '--libdir=' + join(prefix, 'lib'), '--enable-shared', '--disable-static', ...extra], source, name + '-configure', buildEnvironment);
  run('/usr/bin/make', ['-j' + parallel], source, name + '-build', buildEnvironment);
  run('/usr/bin/make', ['install'], source, name + '-install', buildEnvironment);
  if (name === 'nettle') run(join(prefix, 'bin', 'pkgconf'), ['--modversion', 'nettle', 'hogweed'], root, 'nettle-pkgconf', environment);
  writeFileSync(marker, checksum + '\n');
}

const cmake = mac ? join(sources, 'cmake', 'CMake.app', 'Contents', 'bin', 'cmake') : 'cmake';
const build = join(directory, 'build-libwebsockets');
const webMarker = join(prefix, '.built-libwebsockets');
const webChecksum = lock.dependencies.find(dependency => dependency.name === 'libwebsockets').sha256;
if (existsSync(webMarker) && readFileSync(webMarker, 'utf8').trim() !== webChecksum)
  throw new Error('libwebsockets: installed build differs from the dependency lock; choose a new build directory.');
if (!existsSync(webMarker)) {
  process.stdout.write(`Building libwebsockets with GnuTLS, HTTP/2 and HTTP/3\n`);
  run(cmake, ['-S', join(sources, 'libwebsockets'), '-B', build,
    '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX=' + prefix, '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_PREFIX_PATH=' + prefix,
    '-DCMAKE_C_COMPILER=' + cc, ...(mac ? ['-DCMAKE_OSX_SYSROOT=' + sdk] : []),
    '-DLWS_GNUTLS_LIBRARIES=' + join(prefix, 'lib', mac ? 'libgnutls.dylib' : 'libgnutls.so'),
    '-DLWS_GNUTLS_INCLUDE_DIRS=' + join(prefix, 'include'),
    '-DLWS_WITH_GNUTLS=ON', '-DLWS_WITH_HTTP2=ON', '-DLWS_WITH_HTTP3=ON',
    '-DLWS_WITH_STATIC=ON', '-DLWS_WITH_SHARED=OFF', '-DLWS_WITHOUT_TESTAPPS=ON',
    '-DLWS_WITHOUT_TEST_SERVER=ON', '-DLWS_WITHOUT_TEST_CLIENT=ON',
    '-DLWS_WITH_LIBUV=OFF', '-DLWS_WITH_LIBEVENT=OFF', '-DLWS_WITH_LIBEV=OFF',
    '-DLWS_WITH_GLIB=OFF', '-DLWS_WITHOUT_EXTENSIONS=ON', '-DLWS_WITH_ZLIB=OFF',
  ], root, 'libwebsockets-configure', environment);
  run(cmake, ['--build', build, '--parallel', parallel], root, 'libwebsockets-build', environment);
  run(cmake, ['--install', build], root, 'libwebsockets-install', environment);
  writeFileSync(webMarker, webChecksum + '\n');
}
writeFileSync(join(prefix, 'aug-native-manifest.json'), JSON.stringify({ platform: process.platform, architecture: process.arch,
  dependencies: dependencies.map(({name, version, revision, sha256}) => ({name, version, revision, sha256})) }, null, 2) + '\n');
process.stdout.write(`Native dependencies ready at ${prefix}\n`);

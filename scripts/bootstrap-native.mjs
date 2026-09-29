#!/usr/bin/env node
/** Build the pinned C dependencies privately; never install into system directories. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { availableParallelism } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const lock = JSON.parse(readFileSync(join(import.meta.dirname, 'native-dependencies.lock.json'), 'utf8'));
const directory = resolve(process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native'));
const prefix = join(directory, 'prefix');
const downloads = join(directory, 'downloads');
const sources = join(directory, 'sources');
const logs = join(directory, 'logs');
for (const path of [prefix, downloads, sources, logs]) mkdirSync(path, { recursive: true });
if (process.platform !== lock.platform) throw new Error(`Native bootstrap lock currently targets ${lock.platform}; this host is ${process.platform}.`);

function run(command, args, cwd, label, env = process.env) {
  const path = join(logs, label + '.log');
  const descriptor = openSync(path, 'w');
  let result;
  try { result = spawnSync(command, args, { cwd, env, stdio: ['ignore', descriptor, descriptor] }); }
  finally { closeSync(descriptor); }
  if (result.error || result.status !== 0) throw new Error(`${label} failed: ${result.error?.message ?? result.status}. See ${path}\n` + readFileSync(path, 'utf8').split('\n').slice(-24).join('\n'));
}

for (const dependency of lock.dependencies) {
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
if (process.argv.includes('--extract-only')) process.exit(0);

const sdk = '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
const cc = process.env.CC ?? '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang';
const environment = { ...process.env, SDKROOT: sdk, CC: cc, CC_FOR_BUILD: cc, CXX: cc.replace(/clang$/, 'clang++'),
  CFLAGS: `-O2 -fPIC${existsSync(sdk) ? ' -isysroot ' + sdk : ''}`,
  CXXFLAGS: `-O2 -fPIC${existsSync(sdk) ? ' -isysroot ' + sdk : ''}`,
  CPPFLAGS: `-I${prefix}/include${existsSync(sdk) ? ' -isysroot ' + sdk : ''}`, LDFLAGS: `-L${prefix}/lib -Wl,-rpath,${prefix}/lib`,
  PKG_CONFIG: join(prefix, 'bin', 'pkgconf'), PKG_CONFIG_PATH: join(prefix, 'lib', 'pkgconfig'),
  PATH: join(prefix, 'bin') + ':' + process.env.PATH,
};
const parallel = String(Math.min(8, availableParallelism()));
for (const name of ['pkgconf', 'gmp', 'nettle', 'gnutls']) {
  const marker = join(prefix, '.built-' + name);
  if (existsSync(marker)) continue;
  const source = join(sources, name);
  const extra = name === 'gmp' ? ['--disable-cxx', '--with-pic'] : name === 'nettle' ? ['--disable-documentation'] : name === 'gnutls' ? [
    '--disable-doc', '--disable-tests', '--disable-tools', '--disable-cxx', '--disable-guile',
    '--disable-nls', '--disable-idn', '--without-p11-kit', '--without-brotli', '--without-zstd',
    '--with-included-libtasn1', '--with-included-unistring', '--disable-libdane',
  ] : [];
  process.stdout.write(`Building ${name}; logs: ${logs}\n`);
  run(join(source, 'configure'), ['--prefix=' + prefix, '--enable-shared', '--disable-static', ...extra], source, name + '-configure', environment);
  run('/usr/bin/make', ['-j' + parallel], source, name + '-build', environment);
  run('/usr/bin/make', ['install'], source, name + '-install', environment);
  writeFileSync(marker, lock.dependencies.find(dependency => dependency.name === name).sha256 + '\n');
}

const cmake = join(sources, 'cmake', 'CMake.app', 'Contents', 'bin', 'cmake');
const build = join(directory, 'build-libwebsockets');
if (!existsSync(join(prefix, '.built-libwebsockets'))) {
  process.stdout.write(`Building libwebsockets with GnuTLS, HTTP/2 and HTTP/3\n`);
  run(cmake, ['-S', join(sources, 'libwebsockets'), '-B', build,
    '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX=' + prefix, '-DCMAKE_PREFIX_PATH=' + prefix,
    '-DCMAKE_C_COMPILER=' + cc, '-DCMAKE_OSX_SYSROOT=' + sdk,
    '-DLWS_WITH_GNUTLS=ON', '-DLWS_WITH_HTTP2=ON', '-DLWS_WITH_HTTP3=ON',
    '-DLWS_WITH_STATIC=ON', '-DLWS_WITH_SHARED=OFF', '-DLWS_WITHOUT_TESTAPPS=ON',
    '-DLWS_WITHOUT_TEST_SERVER=ON', '-DLWS_WITHOUT_TEST_CLIENT=ON',
    '-DLWS_WITH_LIBUV=OFF', '-DLWS_WITH_LIBEVENT=OFF', '-DLWS_WITH_LIBEV=OFF',
    '-DLWS_WITH_GLIB=OFF', '-DLWS_WITHOUT_EXTENSIONS=ON', '-DLWS_WITH_ZLIB=OFF',
  ], root, 'libwebsockets-configure', environment);
  run(cmake, ['--build', build, '--parallel', parallel], root, 'libwebsockets-build', environment);
  run(cmake, ['--install', build], root, 'libwebsockets-install', environment);
  writeFileSync(join(prefix, '.built-libwebsockets'), lock.dependencies.find(dependency => dependency.name === 'libwebsockets').sha256 + '\n');
}
writeFileSync(join(prefix, 'aug-native-manifest.json'), JSON.stringify({ platform: process.platform, architecture: process.arch,
  dependencies: lock.dependencies.map(({name, version, revision, sha256}) => ({name, version, revision, sha256})) }, null, 2) + '\n');
process.stdout.write(`Native dependencies ready at ${prefix}\n`);

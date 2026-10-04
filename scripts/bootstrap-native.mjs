#!/usr/bin/env node
/** Build the pinned C dependencies privately; never install into system directories. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync, renameSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { nativeHome } from './native-home.mjs';
import { cCompiler, requireBuildTool } from './native-toolchain.mjs';
import { dependencyArtifacts, dependencyReady } from './native-setup.mjs';

async function setup() {
  if (Number(process.versions.node.split('.')[0]) < 24) throw new Error(`August native setup needs Node.js 24 or newer; this is ${process.versions.node}.`);
  if (process.argv.includes('--help')) {
    process.stdout.write('Usage: aug-native [--profile crypto|web] [--offline]\n       aug-native --extract-only [--only minicoro,yyjson] [--offline]\n\nNative commands prepare dependencies automatically. Use this command to prewarm a cache without running a program.\nAUG_NATIVE_HOME selects the cache; system build tools remain prerequisites.\n');
    return;
  }
  for (let index = 2; index < process.argv.length; index++) {
    const option = process.argv[index];
    if (['--only', '--profile'].includes(option)) {
      if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`${option} needs a value. See aug-native --help.`);
      index++;
    } else if (!['--extract-only', '--offline'].includes(option)) throw new Error(`Unknown option ${option}. See aug-native --help.`);
  }
  const root = resolve(import.meta.dirname, '..');
  const lock = JSON.parse(readFileSync(join(import.meta.dirname, 'native-dependencies.lock.json'), 'utf8'));
  const extractOnly = process.argv.includes('--extract-only');
  const onlyIndex = process.argv.indexOf('--only');
  const selected = onlyIndex >= 0 ? process.argv[onlyIndex + 1]?.split(',') : undefined;
  const profileIndex = process.argv.indexOf('--profile');
  const profile = profileIndex >= 0 ? process.argv[profileIndex + 1] : 'web';
  const offline = process.argv.includes('--offline');
  if (!['crypto', 'web'].includes(profile)) throw new Error('Use --profile crypto or --profile web.');
  if (onlyIndex >= 0 && (!extractOnly || !selected?.length || selected.some(name => !lock.dependencies.some(dependency => dependency.name === name))))
    throw new Error('--only requires --extract-only and comma-separated names from native-dependencies.lock.json.');
  const directory = nativeHome(root);
  const prefix = join(directory, 'prefix');
  const downloads = join(directory, 'downloads');
  const sources = join(directory, 'sources');
  const logs = join(directory, 'logs');
  for (const path of [prefix, downloads, sources, logs]) mkdirSync(path, { recursive: true });
  if (!extractOnly && !lock.platforms.includes(process.platform)) throw new Error(`Full native bootstrap supports ${lock.platforms.join(' and ')}; this host is ${process.platform}. Use --extract-only --only minicoro,yyjson for portable source dependencies.`);
  const cc = extractOnly ? undefined : cCompiler();
  requireBuildTool('tar');
  if (!extractOnly) { requireBuildTool('make'); requireBuildTool('m4'); if (profile === 'web' && process.platform !== 'darwin') requireBuildTool('cmake'); }
  const release = await acquireLock(directory);
  try {

    function run(command, args, cwd, label, env = process.env) {
      const path = join(logs, label + '.log');
      const descriptor = openSync(path, 'w');
      let result;
      try { result = spawnSync(command, args, { cwd, env, stdio: ['ignore', descriptor, descriptor] }); }
      finally { closeSync(descriptor); }
      if (result.error || result.status !== 0) throw new Error(`${label} failed: ${result.error?.message ?? result.status}. See ${path}\n` + readFileSync(path, 'utf8').split('\n').slice(-24).join('\n'));
    }

    const dependencies = lock.dependencies.filter(dependency => (!dependency.platforms || dependency.platforms.includes(process.platform)) &&
      (!selected || selected.includes(dependency.name)) && (extractOnly || profile === 'web' || ['pkgconf', 'gmp', 'nettle', 'gnutls'].includes(dependency.name)));
    if (selected?.some(name => !dependencies.some(dependency => dependency.name === name)))
      throw new Error(`One or more selected dependencies do not support ${process.platform}.`);
    for (const dependency of dependencies) {
      const archive = join(downloads, dependency.archive);
      if (!existsSync(archive)) {
        if (offline) throw new Error(`Offline setup cannot find the cached ${dependency.name} archive at ${archive}.\nRun aug run once with network access, then retry aug run --offline.`);
        process.stdout.write(`Downloading ${dependency.name} ${dependency.version}\n`);
        let bytes;
        try {
          const response = await fetch(dependency.url, { signal: AbortSignal.timeout(120000) });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          bytes = Buffer.from(await response.arrayBuffer());
        } catch (error) { throw new Error(`Could not download ${dependency.name}: ${error.message}.\nCheck your internet/proxy connection and retry aug run. URL: ${dependency.url}`); }
        if (createHash('sha256').update(bytes).digest('hex') !== dependency.sha256)
          throw new Error(`Downloaded ${dependency.name} failed its checksum. No files were installed. Check your connection and retry aug run.`);
        const temporary = archive + '.tmp';
        try { writeFileSync(temporary, bytes); renameSync(temporary, archive); }
        finally { rmSync(temporary, { force: true }); }
      }
      const hash = createHash('sha256').update(readFileSync(archive)).digest('hex');
      if (hash !== dependency.sha256) throw new Error(`${dependency.name}: cached archive checksum mismatch at ${archive}.\nRemove that archive and retry aug run to download the verified copy.`);
      const source = join(sources, dependency.name);
      if (existsSync(join(source, '.archive-sha256')) && readFileSync(join(source, '.archive-sha256'), 'utf8').trim() !== hash)
        throw new Error(`${dependency.name}: source tree differs from the dependency lock. Set AUG_NATIVE_HOME to an empty directory and retry aug run.`);
      if (!existsSync(join(source, '.archive-sha256')) || dependencyArtifacts(dependency.name).filter(file => file.startsWith('sources/')).some(file => !existsSync(join(directory, file)))) {
        mkdirSync(source, { recursive: true });
        run('tar', ['-xf', archive, '-C', source, '--strip-components=1'], directory, 'extract-' + dependency.name);
        writeFileSync(join(source, '.archive-sha256'), hash + '\n');
      }
    }
    if (extractOnly) return;

    const sdk = '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
    const mac = process.platform === 'darwin';
    const minimumOS = mac ? process.env.MACOSX_DEPLOYMENT_TARGET : undefined;
    if (minimumOS && !/^\d+\.\d+(?:\.\d+)?$/.test(minimumOS)) throw new Error('MACOSX_DEPLOYMENT_TARGET must be an OS version such as 14.0.');
    const sysroot = mac && existsSync(sdk) ? ' -isysroot ' + sdk : '';
    const environment = { ...process.env, ...(mac && existsSync(sdk) && !process.env.SDKROOT ? { SDKROOT: sdk } : {}), CC: cc, CC_FOR_BUILD: cc, CXX: process.env.CXX ?? cc.replace(/clang$/, 'clang++').replace(/gcc$/, 'g++').replace(/^cc$/, 'c++'),
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
        if (dependencyArtifacts(name).every(file => existsSync(join(directory, file)))) continue;
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
      // A relative invocation keeps Autoconf's srcdir local. An absolute alias (e.g. /var -> /private/var)
      // can make GnuTLS treat this as a VPATH build and replace GNUmakefile with a link to itself.
      run('./configure', ['--prefix=' + prefix, '--libdir=' + join(prefix, 'lib'), '--enable-shared', '--disable-static', ...extra], source, name + '-configure', buildEnvironment);
      run('make', ['-j' + parallel], source, name + '-build', buildEnvironment);
      run('make', ['install'], source, name + '-install', buildEnvironment);
      if (name === 'nettle') run(join(prefix, 'bin', 'pkgconf'), ['--modversion', 'nettle', 'hogweed'], root, 'nettle-pkgconf', environment);
      writeFileSync(marker, checksum + '\n');
    }

    if (profile === 'web') {
    const cmake = mac ? join(sources, 'cmake', 'CMake.app', 'Contents', 'bin', 'cmake') : 'cmake';
    const build = join(directory, 'build-libwebsockets');
    const webMarker = join(prefix, '.built-libwebsockets');
    const webChecksum = lock.dependencies.find(dependency => dependency.name === 'libwebsockets').sha256;
    if (existsSync(webMarker) && readFileSync(webMarker, 'utf8').trim() !== webChecksum)
      throw new Error('libwebsockets: installed build differs from the dependency lock; choose a new build directory.');
    if (!existsSync(webMarker) || !dependencyArtifacts('libwebsockets').every(file => existsSync(join(directory, file)))) {
      process.stdout.write(`Building libwebsockets with GnuTLS, HTTP/2 and HTTP/3\n`);
      run(cmake, ['-S', join(sources, 'libwebsockets'), '-B', build,
        '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX=' + prefix, '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_PREFIX_PATH=' + prefix,
        '-DCMAKE_C_COMPILER=' + cc, ...(mac && existsSync(sdk) && !process.env.SDKROOT ? ['-DCMAKE_OSX_SYSROOT=' + sdk] : []),
        ...(minimumOS ? ['-DCMAKE_OSX_DEPLOYMENT_TARGET=' + minimumOS] : []),
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
    }
    writeFileSync(join(prefix, 'aug-native-manifest.json'), JSON.stringify({ platform: process.platform, architecture: process.arch, ...(minimumOS ? {minimumOS} : {}),
      dependencies: lock.dependencies.filter(dependency => dependencyReady(directory, dependency)).map(({name, version, revision, sha256}) => ({name, version, revision, sha256})) }, null, 2) + '\n');
    process.stdout.write(`Native dependencies ready at ${prefix}\n`);
  } finally { release(); }
}

/** One writer per cache. An interrupted setup leaves a recoverable PID lock. */
async function acquireLock(directory) {
  const path = join(directory, '.setup-lock');
  const started = Date.now(); let announced = false;
  while (true) {
    try {
      const descriptor = openSync(path, 'wx');
      try { writeFileSync(descriptor, JSON.stringify({ pid: process.pid })); }
      finally { closeSync(descriptor); }
      return () => rmSync(path, { force: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        const owner = JSON.parse(readFileSync(path, 'utf8'));
        if (Number.isInteger(owner.pid) && owner.pid > 0) {
          try { process.kill(owner.pid, 0); }
          catch (error) { if (error.code === 'ESRCH') { rmSync(path, { force: true }); continue; } }
        } else if (Date.now() - statSync(path).mtimeMs > 30000) { rmSync(path, { force: true }); continue; }
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        if (error instanceof SyntaxError && Date.now() - statSync(path).mtimeMs > 30000) { rmSync(path, { force: true }); continue; }
      }
      if (!announced) { process.stdout.write('Waiting for another August process to prepare the native cache.\n'); announced = true; }
      if (Date.now() - started > 600000) throw new Error(`Another native setup still holds ${path}. Wait for it to finish, then retry aug run.`);
      await new Promise(accept => setTimeout(accept, 500));
    }
  }
}

try { await setup(); }
catch (error) {
  const permission = ['EACCES', 'EPERM', 'EROFS'].includes(error.code) ? '\nChoose a writable cache: set AUG_NATIVE_HOME to a directory you own and retry aug run.' : '';
  process.stderr.write(`Native setup: ${error.message}${permission}\n`);
  process.exitCode = 1;
}

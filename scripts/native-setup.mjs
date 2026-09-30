import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { nativeHome } from './native-home.mjs';
import { cCompiler } from './native-toolchain.mjs';

/** Inspect C identifiers, excluding comments and string literals. Shared with the linker. */
export function nativeRequirements(generated) {
  const code = generated.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g, ' ');
  const web = /\b(?:_?aug_http_|aug_headers_)\w*/.test(code);
  return { web, crypto: web || /\b_aug_crypto_\w*/.test(code),
    tasks: web || /\baug_task_\w*/.test(code), json: web || /\b_?aug_json_\w*/.test(code),
    html: web || /\baug_html_\w*/.test(code), time: /\b_aug_time_\w*/.test(code) };
}

const artifacts = {
  minicoro: ['sources/minicoro/minicoro.h'], yyjson: ['sources/yyjson/src/yyjson.c', 'sources/yyjson/src/yyjson.h'],
  pkgconf: ['prefix/bin/pkgconf'], gmp: ['prefix/include/gmp.h'],
  nettle: ['prefix/include/nettle/nettle-types.h'], gnutls: ['prefix/include/gnutls/gnutls.h'],
  libwebsockets: ['prefix/lib/libwebsockets.a', 'prefix/include/libwebsockets.h'],
};
export function dependencyArtifacts(name) {
  const library = { gmp: ['gmp'], nettle: ['nettle', 'hogweed'], gnutls: ['gnutls'] }[name] ?? [];
  return [...(artifacts[name] ?? []), ...library.map(item => `prefix/lib/lib${item}.${process.platform === 'darwin' ? 'dylib' : 'so'}`)];
}

export function dependencyReady(directory, dependency) {
  const marker = join(directory, ['minicoro', 'yyjson'].includes(dependency.name) ?
    `sources/${dependency.name}/.archive-sha256` : `prefix/.built-${dependency.name}`);
  return existsSync(marker) && readFileSync(marker, 'utf8').trim() === dependency.sha256 &&
    dependencyArtifacts(dependency.name).every(file => existsSync(join(directory, file)));
}

/** Prepare the precise native capabilities emitted by the compiler, keeping stdout for the program. */
export async function prepareNativeDependencies(generated, { offline = false, progress = message => process.stderr.write(message) } = {}) {
  const needs = nativeRequirements(generated);
  cCompiler(); // Fail before downloading when the host cannot compile the application.
  if (!needs.json && !needs.tasks && !needs.crypto) return;
  const root = resolve(import.meta.dirname, '..'), directory = nativeHome(root);
  const lock = JSON.parse(readFileSync(join(import.meta.dirname, 'native-dependencies.lock.json'), 'utf8'));
  const names = [...(needs.json ? ['yyjson'] : []), ...(needs.tasks ? ['minicoro'] : []),
    ...(needs.crypto ? ['pkgconf', 'gmp', 'nettle', 'gnutls'] : []), ...(needs.web ? ['libwebsockets'] : [])];
  const required = lock.dependencies.filter(item => names.includes(item.name));
  const manifestPath = join(directory, 'prefix/aug-native-manifest.json');
  let manifest;
  if (needs.crypto && existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (!manifest || typeof manifest.platform !== 'string' || typeof manifest.architecture !== 'string' || !Array.isArray(manifest.dependencies))
        throw new Error('Invalid metadata');
    }
    catch { throw new Error(`Native cache metadata is unreadable: ${manifestPath}\nSet AUG_NATIVE_HOME to an empty directory and retry aug run.`); }
    if (manifest.platform !== process.platform || manifest.architecture !== process.arch)
      throw new Error(`Native cache targets ${manifest.platform}/${manifest.architecture}; this computer is ${process.platform}/${process.arch}.\nSet AUG_NATIVE_HOME to a cache built on this computer, or unset it and retry aug run.`);
  }
  const libraries = required.filter(item => !['yyjson', 'minicoro'].includes(item.name));
  const manifestReady = !needs.crypto || libraries.every(item => manifest?.dependencies?.some(entry => entry.name === item.name && entry.sha256 === item.sha256));
  if (manifestReady && required.every(item => dependencyReady(directory, item))) return;
  const capabilities = [needs.json && 'JSON', needs.tasks && 'tasks', needs.crypto && 'crypto', needs.web && 'HTTP'].filter(Boolean).join(', ');
  progress(`Preparing native dependencies for ${capabilities} (cached at ${directory}). First use may take a few minutes.\n`);
  const args = needs.crypto ? ['--profile', needs.web ? 'web' : 'crypto'] : ['--extract-only', '--only', names.join(',')];
  if (offline) args.push('--offline');
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, [join(import.meta.dirname, 'bootstrap-native.mjs'), ...args], {
      stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
    let detail = '', interrupted;
    const stop = signal => {
      interrupted = signal;
      try { if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, signal); else child.kill(signal); }
      catch (error) { if (error.code !== 'ESRCH') child.kill(signal); }
    };
    const interrupt = () => stop('SIGINT'), terminate = () => stop('SIGTERM');
    process.once('SIGINT', interrupt); process.once('SIGTERM', terminate);
    const cleanup = () => { process.off('SIGINT', interrupt); process.off('SIGTERM', terminate); };
    child.stdout.on('data', data => progress(data.toString()));
    child.stderr.on('data', data => { detail = (detail + data.toString()).slice(-12000); progress(data.toString()); });
    child.on('error', error => { cleanup(); reject(new Error(`Cannot start native dependency setup: ${error.message}\nRetry aug run after checking your Node installation.`)); });
    child.on('close', (status, signal) => {
      cleanup();
      if (interrupted) {
        const error = new Error(`Native setup cancelled by ${interrupted}. Retry aug run to resume using the completed dependencies.`);
        error.exitCode = interrupted === 'SIGINT' ? 130 : 143; reject(error);
      } else if (status === 0) accept();
      else reject(new Error(`Native dependency setup ${signal ? `stopped by ${signal}` : `failed (exit ${status})`}. ${detail ? 'See the error above.' : `Check the setup logs in ${join(directory, 'logs')}.`}\nRetry aug run after addressing it; completed dependencies will be reused.`));
    });
  });
  if (!required.every(item => dependencyReady(directory, item)))
    throw new Error(`Native setup finished without all required files in ${directory}.\nSet AUG_NATIVE_HOME to an empty writable directory and retry aug run.`);
}

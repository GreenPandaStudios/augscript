import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

/** Source checkouts use a local build; installations use a writable, versioned cache. */
export function nativeHome(compilerRoot) {
  if (process.env.AUG_NATIVE_HOME) return resolve(process.env.AUG_NATIVE_HOME);
  const manifest = JSON.parse(readFileSync(join(compilerRoot, 'package.json'), 'utf8'));
  return manifest.private ? join(compilerRoot, '.aug-native') :
    join(homedir(), '.cache', 'augscript', 'native', manifest.version, `${process.platform}-${process.arch}`);
}

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

export interface StandardLibraries {
  root: string;
  modules: Map<string, string>;
}

/** The checked-in sources and installed packages expose the same August module paths. */
export function standardLibraries(): StandardLibraries {
  const bundled = join(import.meta.dirname, 'stdlib');
  if (existsSync(bundled)) return { root: bundled, modules: new Map() };
  const require = createRequire(import.meta.url);
  const version = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')).version;
  const load = (name: string): string => {
    const file = require.resolve(`@greenpandastudios/aug-${name}/aug-package.json`);
    const manifest = JSON.parse(readFileSync(file, 'utf8'));
    if (manifest.format !== 1 || manifest.version !== version || manifest.compiler !== version)
      throw new Error(`August ${name} must match compiler ${version}; reinstall the CLI and its pinned libraries.`);
    return join(dirname(file), manifest.source);
  };
  return { root: load('stdlib'), modules: new Map([['web', load('web')], ['crypto', load('crypto')]]) };
}

export function libraryChild(libraries: StandardLibraries, folder: string, name: string): string {
  return folder === libraries.root ? libraries.modules.get(name) ?? join(folder, name) : join(folder, name);
}

/** Stable identities and import suggestions are independent of npm's disk layout. */
export function libraryRelative(libraries: StandardLibraries, file: string): string {
  for (const [name, folder] of libraries.modules) {
    const path = relative(folder, file);
    if (path === '' || (!path.startsWith('..') && !path.startsWith('/'))) return join(name, path);
  }
  return relative(libraries.root, file);
}

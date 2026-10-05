import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { x as extract } from 'tar';

const root = resolve(import.meta.dirname, '..');
const target = join(import.meta.dirname, 'compiler');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
if (process.env.AUG_EXTENSION_COMPILER_ARCHIVE) {
  const file = resolve(process.env.AUG_EXTENSION_COMPILER_ARCHIVE);
  const listing = spawnSync('tar', ['-tzf', file], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(listing.status, 0, 'Cannot read released compiler archive');
  for (const path of listing.stdout.trim().split(/\r?\n/))
    assert.ok(path.startsWith('package/') && !path.includes('\\') && !path.split('/').includes('..'), 'Unsafe compiler archive path');
  extract({ file, cwd: target, strip: 1, sync: true, strict: true, preservePaths: false });
  const stdlib = process.env.AUG_EXTENSION_STDLIB_ARCHIVE;
  assert.ok(stdlib, 'Supply the verified matching standard-library archive');
  const dependency = join(target, 'node_modules/@greenpandastudios/aug-stdlib');
  mkdirSync(dependency, {recursive:true});
  extract({file:resolve(stdlib),cwd:dependency,strip:1,sync:true,strict:true,preservePaths:false});
  for (const name of ['tar', 'chownr', 'yallist', 'minipass', 'minizlib', '@isaacs/fs-minipass'])
    cpSync(join(root, 'node_modules', name), join(target, 'node_modules', name), {recursive:true});
  const editor = JSON.parse(readFileSync(join(import.meta.dirname, 'package.json'), 'utf8'));
  const compiler = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
  assert.equal(JSON.parse(readFileSync(join(dependency,'package.json'),'utf8')).version, editor.augustCompilerVersion, 'Released stdlib version mismatch');
  assert.equal(compiler.version, editor.augustCompilerVersion, 'Released compiler version differs from extension pin');
} else {
  for (const directory of ['bin', 'src', 'runtime', 'docs', 'native']) {
  const from = join(root, directory);
  cpSync(from, join(target, directory), { recursive: true,
    filter: source => !relative(from, source).split(/[\\/]/).some(part => part.startsWith('.') && part!=='.aug-spec') });
}
mkdirSync(join(target, 'scripts'));
for (const file of ['bootstrap-native.mjs', 'native-home.mjs', 'native-home.d.mts', 'native-setup.mjs', 'native-setup.d.mts', 'native-toolchain.mjs', 'native-toolchain.d.mts', 'native-dependencies.lock.json'])
  cpSync(join(root, 'scripts', file), join(target, 'scripts', file));
cpSync(join(root, 'examples'), join(target, 'examples'), { recursive: true,
  filter: source => !relative(join(root, 'examples'), source).split(/[\\/]/).some(part => part.startsWith('.') && part!=='.aug-spec') });
cpSync(join(root, 'README.md'), join(target, 'README.md'));
for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) cpSync(join(root, file), join(target, file));
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const dependency of ['tar', 'chownr', 'yallist', 'minipass', 'minizlib', '@isaacs/fs-minipass'])
  cpSync(join(root, 'node_modules', dependency), join(target, 'node_modules', dependency), { recursive: true });
writeFileSync(join(target, 'package.json'), JSON.stringify({ ...manifest, private: false }, null, 2) + '\n');

}

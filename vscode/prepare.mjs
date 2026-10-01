import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import '../scripts/generate-snippets.mjs';

const root = resolve(import.meta.dirname, '..');
const target = join(import.meta.dirname, 'compiler');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const directory of ['bin', 'src', 'runtime', 'docs']) {
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

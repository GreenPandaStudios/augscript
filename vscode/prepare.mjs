import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const target = join(import.meta.dirname, 'compiler');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const directory of ['bin', 'src', 'runtime', 'docs', 'scripts'])
  cpSync(join(root, directory), join(target, directory), { recursive: true });
cpSync(join(root, 'examples'), join(target, 'examples'), { recursive: true,
  filter: source => !source.split(/[\\/]/).includes('.aug-build') });
cpSync(join(root, 'README.md'), join(target, 'README.md'));
cpSync(join(root, 'package.json'), join(target, 'package.json'));

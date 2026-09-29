#!/usr/bin/env node
import { chmodSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist', 'packages');
const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Package preparation failed: ${args.join(' ')}`);
};
run(['scripts/version.mjs', '--check']);
run(['scripts/generate-docs.mjs', '--check']);
run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json']);
rmSync(output, { recursive: true, force: true });
const copy = (source, destination) => {
  const from = join(root, source);
  cpSync(from, destination, { recursive: true,
    filter: file => !relative(from, file).split(/[\\/]/).some(part => part.startsWith('.') || part === 'node_modules') });
};
for (const name of ['stdlib', 'web', 'crypto', 'cli']) {
  const target = join(output, name);
  mkdirSync(target, { recursive: true });
  for (const file of ['package.json', 'README.md']) copy(`packages/${name}/${file}`, join(target, file));
  copy('LICENSE', join(target, 'LICENSE'));
  if (name === 'cli') {
    cpSync(join(root, '.aug-build/compiler-js'), join(target, 'src'), { recursive: true });
    mkdirSync(join(target, 'bin'));
    writeFileSync(join(target, 'bin/aug.mjs'), readFileSync(join(root, 'bin/aug.mjs'), 'utf8').replace('../src/cli.ts', '../src/cli.js'));
    chmodSync(join(target, 'bin/aug.mjs'), 0o755);
    for (const directory of ['runtime', 'docs', 'examples']) copy(directory, join(target, directory));
    mkdirSync(join(target, 'scripts'));
    for (const file of ['bootstrap-native.mjs', 'native-home.mjs', 'native-dependencies.lock.json']) copy(`scripts/${file}`, join(target, 'scripts', file));
    chmodSync(join(target, 'scripts/bootstrap-native.mjs'), 0o755);
  } else {
    copy(`packages/${name}/aug-package.json`, join(target, 'aug-package.json'));
    const modules = name === 'stdlib' ? ['io', 'json', 'memory', 'time'] : [name];
    for (const module of modules) {
      copy(`src/stdlib/${module}`, join(target, 'august', module));
      copy(`docs/api/${module}.md`, join(target, 'docs', `${module}.md`));
    }
    if (name === 'stdlib') copy('src/stdlib/export.aug', join(target, 'august/export.aug'));
    else for (const file of ['web.md', 'web-library-gaps.md']) copy(`docs/${file}`, join(target, 'docs', file));
  }
  if (name !== 'stdlib') copy('THIRD_PARTY_NOTICES.md', join(target, 'THIRD_PARTY_NOTICES.md'));
  process.stdout.write(`Prepared ${name}\n`);
}

#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const build = spawnSync(process.execPath, ['scripts/build-packages.mjs'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);
const artifacts = join(root, 'dist', 'release');
rmSync(artifacts, { recursive: true, force: true });
mkdirSync(artifacts, { recursive: true });
const packages = [];
for (const name of ['stdlib', 'web', 'crypto', 'cli']) {
  const result = spawnSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', artifacts],
    { cwd: join(root, 'dist/packages', name), encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'npm pack failed');
  const packed = JSON.parse(result.stdout)[0];
  packages.push({ directory: name, name: packed.name, version: packed.version, filename: packed.filename,
    sha256: createHash('sha256').update(readFileSync(join(artifacts, packed.filename))).digest('hex'), integrity: packed.integrity });
  process.stdout.write(`${packed.filename}\n`);
}
writeFileSync(join(artifacts, 'packages.json'), JSON.stringify(packages, null, 2) + '\n');
writeFileSync(join(artifacts, 'SHA256SUMS'), packages.map(pkg => `${pkg.sha256}  ${pkg.filename}`).join('\n') + '\n');

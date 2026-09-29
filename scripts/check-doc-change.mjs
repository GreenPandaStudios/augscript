#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const base = process.argv[2];
if (!base) throw new Error('Provide the pull request base commit');
const result = spawnSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const files = result.stdout.trim().split('\n');
const behavior = files.some(file => /^(src\/|runtime\/|bin\/|vscode\/.*\.(?:cjs|json)$|scripts\/bootstrap-native|packages\/)/.test(file));
const documented = files.some(file => file === 'README.md' || file === 'CHANGELOG.md' || file === 'vscode/CHANGELOG.md' ||
  /^docs\/(?!api\/|language-constructs\.md)[^/]+\.md$/.test(file));
if (behavior && !documented) throw new Error('Language/tooling changes need a handwritten guide or changelog update. See docs/maintaining-docs.md.');
process.stdout.write('Documentation change policy passed\n');

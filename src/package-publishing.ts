import {createHash} from 'node:crypto';
import {existsSync, readFileSync, mkdirSync, lstatSync, writeFileSync, realpathSync} from 'node:fs';
import {homedir} from 'node:os';
import {join, relative, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {compilerVersion, readPackage, readPackageLock, sourcePaths} from './package-manager.ts';
import {packageReadiness, packageSurface} from './package-inspection.ts';
import {checkedProjectWithTests} from './refactoring.ts';
import {contractFacts} from './contract-facts.ts';
import {publicContract} from './public-contracts.ts';
import {semanticGraph} from './symbols.ts';
import {updateSpecs, generateSpecs} from './spec.ts';
import {nativePackageSelections, nativeTargetKey, nativeSelectionIdentity, validateNativeComponents, verifyNativeArtifact} from './native-artifacts.ts';
import {nativeHostTarget, nativeTarget, selectNativeArtifact} from './native-contracts.ts';

const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const localPath = (root: string, file: string) => relative(root, file).replaceAll('\\', '/');

function git(root: string, args: string[]): string {
  const result = spawnSync(process.env.AUG_GIT ?? 'git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 4 * 1024 * 1024,
    env: {...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0'}
  });
  if (result.error) throw new Error('PACKAGE_RELEASE: Git is required for tag validation. ' + result.error.message);
  if (result.status !== 0) throw new Error('PACKAGE_RELEASE: ' + result.stderr.trim());
  return result.stdout.trim();
}

/** Verify a local release tag and emit compiler evidence. Tests, downloads and publication remain separate actions. */
export function packageRelease(directory: string, tag: string) {
  const root = realpathSync(resolve(directory)), {manifest, sourceRoot} = readPackage(root);
  const expected = 'v' + manifest.version;
  if (tag !== expected) throw new Error(`PACKAGE_RELEASE: Expected tag ${expected} for ${manifest.name}@${manifest.version}; received ${tag}.`);
  const commit = git(root, ['rev-parse', '--verify', 'HEAD^{commit}']);
  if (git(root, ['rev-parse', '--verify', 'refs/tags/' + tag + '^{commit}']) !== commit)
    throw new Error('PACKAGE_RELEASE: The release tag must point to the checked HEAD commit.');
  const clean = () => {
    if (git(root, ['status', '--porcelain', '--untracked-files=all']))
      throw new Error('PACKAGE_RELEASE: Commit or remove uncommitted files before reviewing a release.');
  };
  clean();
  const lockPath = join(root, 'aug.lock.json');
  if (!existsSync(lockPath)) throw new Error('PACKAGE_RELEASE: Commit aug.lock.json after running aug install and aug test.');
  const lockBytes = readFileSync(lockPath, 'utf8'), lock = readPackageLock(lockPath);
  const metadata = ['aug-package.json', 'package.json', 'main.yaml', 'aug.lock.json', 'LICENSE', 'LICENSE.md', 'LICENSE.txt', 'THIRD_PARTY_NOTICES.md'];
  if (manifest.native) metadata.push(manifest.native.bindings);
  const inventory = () => [...new Set([...metadata.map(file => join(root, file)).filter(existsSync), ...sourcePaths(sourceRoot)])].sort();
  const inputs = inventory();
  const missingMetadata = metadata.filter(file => !existsSync(join(root, file)));
  const checkInventory = () => {
    if (JSON.stringify(inventory()) !== JSON.stringify(inputs) || missingMetadata.some(file => existsSync(join(root, file))))
      throw new Error('PACKAGE_RELEASE_STALE: The source or metadata inventory changed during release review.');
  };
  for (const file of inputs) if (!lstatSync(file).isFile() || lstatSync(file).isSymbolicLink())
    throw new Error('PACKAGE_RELEASE: Release inputs must be regular files: ' + localPath(root, file));
  for (const file of inputs) git(root, ['ls-files', '--error-unmatch', '--', localPath(root, file)]);
  const files = inputs.map(file => ({file: localPath(root, file), sha256: digest(readFileSync(file))}));
  const readiness = packageReadiness(root), checked = checkedProjectWithTests(root, new Map());
  checkInventory();
  const facts = new Map(contractFacts(checked).map(fact => [fact.id, fact]));
  const contracts = checked.diagnostics.some(issue => issue.severity !== 'warning') ? [] :
    packageSurface(checked).map(entry => ({name: entry.name, contract: publicContract(checked, entry.fact, facts)}));
  const staleSpecs = contracts.length ? updateSpecs(checked, true).stale : [];
  const generated = contracts.length ? [...generateSpecs(checked).map(output => output.path), join(root, '.aug-spec/manifest.json')] : [];
  for (const file of generated.filter(existsSync)) {
    if (!lstatSync(file).isFile() || lstatSync(file).isSymbolicLink())
      throw new Error('PACKAGE_RELEASE: Generated release inputs must be regular files: ' + localPath(root, file));
    if (files.some(input => input.file === localPath(root, file))) continue;
    git(root, ['ls-files', '--error-unmatch', '--', localPath(root, file)]);
    files.push({file: localPath(root, file), sha256: digest(readFileSync(file))});
  }
  files.sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0);
  const checks = [...readiness.checks, {id: 'specifications', status: staleSpecs.length ? 'error' as const : 'ok' as const,
    message: staleSpecs.length ? 'Stale specifications: ' + staleSpecs.join(', ') : 'Adjacent specifications match checked source.',
    ...(staleSpecs.length ? {recovery: 'Run aug spec, review and commit its output, then tag that commit.'} : {})}];
  const cache = resolve(process.env.AUG_NATIVE_ARTIFACT_CACHE ?? join(homedir(), '.cache/augscript/native-artifacts'));
  const target = nativeHostTarget(), selections = nativePackageSelections(root, lock, join(root, '.aug-packages'), target);
  validateNativeComponents(selections);
  const nativeLock = lock.native?.targets[nativeTargetKey(target)];
  if (selections.length && (!nativeLock || nativeSelectionIdentity(nativeLock.packages) !== nativeSelectionIdentity(selections)))
    checks.push({id: 'native-lock', status: 'error', message: 'The committed native host lock differs from selected package contracts.',
      recovery: 'Run aug install on this host after aug spec, review and commit the lock, then tag that commit.'});
  else checks.push({id: 'native-lock', status: 'ok', message: selections.length ? 'Committed host selections match checked native contracts.' : 'No native library selections are required.'});
  const native = selections.map(selection => {
    const path = join(cache, selection.artifact.sha256);
    let status: 'verified' | 'missing' | 'invalid' = 'missing', error: string | undefined;
    if (existsSync(path)) try {verifyNativeArtifact(path, selection.artifact); status = 'verified';}
    catch (issue) {status = 'invalid'; error = (issue as Error).message;}
    if (status !== 'verified') checks.push({id: 'native-bytes:' + selection.sourcePackage, status: 'error',
      message: error ?? 'Native artifact is not cached: ' + selection.artifact.id,
      recovery: status === 'missing' ? 'Run aug install on this supported host before reviewing the release.' : 'Inspect the artifact integrity failure before publishing.'});
    return {...selection, status, ...(error ? {error} : {})};
  });
  checkInventory();
  for (const source of checked.project.files.values()) if (!source.builtin && !source.package) {
    const original = files.find(file => file.file === localPath(root, source.path));
    if (!original || original.sha256 !== digest(source.source))
      throw new Error('PACKAGE_RELEASE_STALE: The checked source differs from the reviewed release inputs.');
  }
  for (const file of files) if (!existsSync(join(root, file.file)) || digest(readFileSync(join(root, file.file))) !== file.sha256)
    throw new Error('PACKAGE_RELEASE_STALE: A checked source or metadata file changed during release review.');
  if (git(root, ['rev-parse', '--verify', 'HEAD^{commit}']) !== commit ||
      git(root, ['rev-parse', '--verify', 'refs/tags/' + tag + '^{commit}']) !== commit ||
      readFileSync(lockPath, 'utf8') !== lockBytes)
    throw new Error('PACKAGE_RELEASE_STALE: The source/tag/dependency revision changed during release review.');
  clean();
  return {format: 1, name: manifest.name, version: manifest.version, compiler: compilerVersion(), compilerRequirement: manifest.compiler,
    ready: checks.every(check => check.status !== 'error'), checks,
    source: {tag, commit, folder: git(root, ['rev-parse', '--show-prefix']), revision: semanticGraph(checked, true).revision, files},
    lock: {sha256: digest(lockBytes), compiler: lock.compiler, git: lock.git ?? [], packages: lock.packages},
    contracts, native: {host: target, locked: nativeLock ?? null, selections: native, declared: manifest.native ?? null},
    evidence: {compiler: readiness.evidence.compiler, specifications: staleSpecs.length ? 'stale' : 'checked',
      behavior: 'not-run', artifacts: native.every(entry => entry.status === 'verified') ? 'host-cached-bytes-verified' : 'incomplete',
      otherPlatforms: 'not-qualified', publication: 'not-run'}};
}

const runners: Record<string, string> = {
  'aarch64-apple-darwin': 'macos-15',
  'x86_64-unknown-linux-gnu': 'ubuntu-24.04',
  'aarch64-unknown-linux-gnu': 'ubuntu-24.04-arm'
};

/** Generate consumer CI for repository-root libraries. Native artifact production stays in the maintainer's build workflow. */
export function packageWorkflow(directory: string) {
  const root = resolve(directory), {manifest} = readPackage(root), compiler = compilerVersion();
  const staged = compiler === '0.23.0';
  if (existsSync(join(root, '.git')) === false) {
    const prefix = spawnSync(process.env.AUG_GIT ?? 'git', ['rev-parse', '--show-prefix'], {cwd: root, encoding: 'utf8'});
    if (prefix.status === 0 && prefix.stdout.trim()) throw new Error('PACKAGE_WORKFLOW: This template requires the package at its repository root. Maintain an explicit working-directory workflow for a monorepo member.');
  }
  const targets = [...new Set(manifest.native?.artifacts.map(artifact => artifact.target.triple) ?? ['x86_64-unknown-linux-gnu'])].sort();
  const jobs = targets.map(target => {
    const runner = runners[target];
    if (!runner) throw new Error('PACKAGE_WORKFLOW: No qualified hosted runner template for ' + target + '. Maintain an explicit runner workflow for that target.');
    const host = nativeTarget(target, '15.0');
    if (host.os === 'linux') host.minimumLibc = '2.36';
    if (manifest.native) {
      try {
        const artifact = selectNativeArtifact(manifest.native.artifacts, host);
        if (artifact.target.features?.length) throw new Error('Explicit hardware/runtime features require a maintainer-written runner.');
      } catch (issue) {
        throw new Error('PACKAGE_WORKFLOW: ' + runner + ' template cannot qualify these native requirements: ' + (issue as Error).message);
      }
    }
    return {target, runner};
  });
  const workflow = `${staged ? '# STAGED: published August 0.23.0 lacks these maintainer commands.\n# Regenerate this workflow with the next released compiler before enabling CI.\n' : ''}# Generated by August ${compiler}. Review this file before committing it.
# This validates consumption of published artifacts; it never builds or publishes them.
name: August package
on:
  pull_request:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: august-package-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    strategy:
      fail-fast: false
      matrix:
        include:
${jobs.map(job => '          - target: ' + job.target + '\n            runner: ' + job.runner).join('\n')}
    runs-on: \${{ matrix.runner }}
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: '24'
          package-manager-cache: false
      - name: Install the exact compiler
        run: npm install --global --ignore-scripts --no-audit --no-fund @greenpandastudios/aug-cli@${compiler}
      - name: Require the containing compiler release
        run: |
          aug --help > "$RUNNER_TEMP/august-help.txt"
          node --input-type=module <<'JS'
          import {readFileSync} from 'node:fs';
          import {join} from 'node:path';
          const help = readFileSync(join(process.env.RUNNER_TEMP, 'august-help.txt'), 'utf8');
          if (!help.includes('aug package release')) {
            console.error('This workflow needs a published compiler containing package release. Regenerate it after that release; public 0.23.0 cannot run it.');
            process.exit(1);
          }
          JS
      - name: Restore the accepted source and native selections
        run: aug install --frozen
      - run: aug package check
      - run: aug spec --check
      - name: Review the tagged source before execution
        if: github.ref_type == 'tag'
        env:
          RELEASE_TAG: \${{ github.ref_name }}
        run: |
          mkdir -p .aug-build/qualification
          aug package release --tag "$RELEASE_TAG" --json > .aug-build/qualification/release.json
      - name: Prepare an isolated test copy
        run: |
          node --input-type=module <<'JS'
          import {cpSync} from 'node:fs';
          import {join, resolve} from 'node:path';
          const root = process.cwd();
          const excluded = new Set(['.git', '.aug-build', 'node_modules']);
          cpSync(root, join(process.env.RUNNER_TEMP, 'august-check'), {
            recursive: true,
            filter: file => !excluded.has(resolve(file).slice(root.length + 1).split('/')[0])
          });
          JS
      - name: Run independent same-file tests through LLVM
        run: |
          mkdir -p .aug-build/qualification
          aug test "$RUNNER_TEMP/august-check" --backend llvm --json > .aug-build/qualification/tests.json
      - name: Retain review and concrete test results
        if: always()
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7
        with:
          name: august-\${{ matrix.target }}
          path: .aug-build/qualification/
          if-no-files-found: error
`;
  return {format: 1, compiler, package: manifest.name, backend: 'llvm', jobs, workflow,
    availability: staged ? 'requires-next-compiler-release' : 'requires-containing-published-release',
    artifacts: 'published-consumer-inputs', sourceBuild: 'not-run', publication: 'not-run'};
}

/** Create a workflow only in a real directory; existing maintainer files are never overwritten. */
export function writePackageWorkflow(directory: string, workflow: string): string {
  const root = realpathSync(resolve(directory));
  let parent = root;
  for (const folder of ['.github', 'workflows']) {
    parent = join(parent, folder);
    if (existsSync(parent) && (!lstatSync(parent).isDirectory() || lstatSync(parent).isSymbolicLink()))
      throw new Error('PACKAGE_WORKFLOW: Workflow parents must be real directories: ' + parent);
    mkdirSync(parent, {recursive: true});
  }
  const destination = join(parent, 'august.yml');
  if (existsSync(destination)) throw new Error('PACKAGE_WORKFLOW: Workflow already exists: ' + destination + '. Review the printed template and merge it manually.');
  writeFileSync(destination, workflow, {flag: 'wx'});
  return destination;
}

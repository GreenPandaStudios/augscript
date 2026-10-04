import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {fileURLToPath} from 'node:url';
import { withPackageLock } from './package-locking.ts';

export interface GitSource { request: string; repository: string; revision: string; folder: string; commit: string }
export const isGitSource = (value: string): boolean => /^(?:https:\/\/|git\+(?:https|file):\/\/)/.test(value);
export const sourceAlias = (value: string): string => 'url_' + createHash('sha256').update(value).digest('hex').slice(0, 20);
export const importSource = (parts: string[]): string => (isGitSource(parts[0]) ? JSON.stringify(parts[0]) : parts[0]) + parts.slice(1).map(part => '.' + part).join('');

/** A repository URL can select a tag and, on GitHub, a folder within the repository. */
export function gitReference(request: string): Omit<GitSource, 'commit'> {
  try {
    if (decodeURIComponent(request.split('#')[0]).split(/[\\/]/).some(part => part === '.' || part === '..'))
      throw new Error('Repository URLs cannot contain path traversal.');
  } catch { throw new Error('Invalid repository URL or path traversal.'); }
  let url: URL;
  try { url = new URL(request.replace(/^git\+/, '')); } catch { throw new Error(`Invalid package repository URL: ${request}`); }
  if (!['https:', 'file:'].includes(url.protocol) || url.username || url.password || url.search ||
      url.protocol === 'file:' && !request.startsWith('git+file:'))
    throw new Error('Use a public HTTPS repository URL without credentials, or git+file:///PATH for a local Git repository.');
  const revision = decodeURIComponent(url.hash.slice(1)) || 'HEAD';
  url.hash = '';
  let folder = '', ref = revision;
  if (url.hostname === 'github.com') {
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    if (parts.length < 2) throw new Error('A GitHub package URL needs an owner and repository.');
    if (parts[2] === 'tree') {
      if (!parts[3] || revision !== 'HEAD') throw new Error('Choose the revision with /tree/TAG/FOLDER or #TAG, not both.');
      ref = parts[3]; folder = parts.slice(4).join('/');
    } else folder = parts.slice(2).join('/');
    url.pathname = '/' + parts.slice(0, 2).join('/').replace(/\.git$/, '') + '.git';
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._/+-]*$/.test(ref) || ref.includes('..') || ref.endsWith('/'))
    throw new Error('Package revision must be a commit, tag, or branch name.');
  if (folder.split('/').some(part => part === '..' || part === '.' || part.startsWith('_')) || folder.includes('\\'))
    throw new Error('Package folders must stay inside the repository and cannot be private.');
  return { request, repository: url.href, revision: ref, folder };
}

function git(args: string[], cwd?: string): Buffer {
  const result = spawnSync(process.env.AUG_GIT ?? 'git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd, timeout: 120000, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  });
  if (result.error) throw new Error(`Cannot read a Git package: ${result.error.message}. Install Git or set AUG_GIT to its executable.`);
  if (result.status !== 0) throw new Error(`Cannot read a Git package: ${result.stderr.toString().trim()}. Check the repository URL and revision; private repositories are outside this workflow.`);
  return result.stdout;
}

/** Read source blobs without checking out files, executing hooks, or following repository symlinks. */
export function materializeGit(request: string, destination: string, offline: boolean, locked?: GitSource): GitSource {
  const reference = gitReference(request);
  if (locked && (locked.repository !== reference.repository || locked.folder !== reference.folder || locked.revision !== reference.revision ||
      !/^[a-f0-9]{40,64}$/.test(locked.commit))) throw new Error('Git package lock has an invalid repository, folder, or commit.');
  if(new URL(reference.repository).hostname==='github.com'&&!process.env.AUG_GIT){
    const transport=new URL(import.meta.url.endsWith('.ts')?'./git-http.ts':'./git-http.js',import.meta.url);
    const result=spawnSync(process.execPath,[fileURLToPath(transport),'--materialize',JSON.stringify({request,destination,offline,locked})],{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
    if(result.status!==0)throw new Error(result.stderr.trim()||result.error?.message||'GitHub source installation failed');
    return JSON.parse(result.stdout);
  }
  const cache = resolve(process.env.AUG_PACKAGE_CACHE ?? join(homedir(), '.cache', 'augscript', 'packages'));
  const repository = join(cache, sourceAlias(reference.repository));
  mkdirSync(cache, { recursive: true });
  return withPackageLock(repository + '.lock', () => {
  if (!existsSync(repository)) {
    if (offline) throw new Error(`Git package is not cached: ${request}. Run aug run online once before using --offline.`);
    git(['init', '--bare', repository]);
  }
  let commit = locked?.commit;
  const objectExists = commit && spawnSync(process.env.AUG_GIT ?? 'git', ['--git-dir', repository, 'cat-file', '-e', commit + '^{commit}']).status === 0;
  if (!objectExists) {
    if (offline) throw new Error(`Git revision is not cached: ${commit ?? request}. Restore the package cache or run aug run online.`);
    git(['--git-dir', repository, 'fetch', '--no-tags', '--depth=1', '--', reference.repository, commit ?? reference.revision]);
    commit = git(['--git-dir', repository, 'rev-parse', 'FETCH_HEAD^{commit}']).toString().trim();
  }
  const result: GitSource = { ...reference, commit: commit! };
  const prefix = reference.folder ? reference.folder + '/' : '';
  const listing = git(['--git-dir', repository, 'ls-tree', '-rz', '--full-tree', result.commit, '--', prefix || '.']).toString();
  let bytes = 0, count = 0;
  for (const entry of listing.split('\0').filter(Boolean)) {
    const match = /^(\d+) blob ([a-f0-9]+)\t([\s\S]+)$/.exec(entry);
    if (!match || !match[3].startsWith(prefix)) continue;
    const file = match[3].slice(prefix.length);
    if (!file.endsWith('.aug') && !['aug-package.json', 'package.json', 'main.yaml', 'README.md', 'LICENSE','native.abi.json','THIRD_PARTY_NOTICES.md'].includes(file)) continue;
    if (!['100644', '100755'].includes(match[1]) || file.includes('\\') || file.split('/').some(part => !part || part === '..' || part.startsWith('.')))
      throw new Error(`Git package source must be regular files inside its folder: ${file}`);
    const contents = git(['--git-dir', repository, 'cat-file', 'blob', match[2]]);
    bytes += contents.length;
    if (++count > 10000 || bytes > 32 * 1024 * 1024) throw new Error('Git source package exceeds 10,000 files or 32 MiB.');
    const path = join(destination, file); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, contents);
  }
  if (!count) throw new Error(`No August source at ${request}. Choose the folder containing export.aug or aug-package.json.`);
  return result;
  });
}

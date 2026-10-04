import {mkdtempSync, readdirSync, readFileSync, renameSync, rmdirSync, unlinkSync, writeFileSync, rmSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {randomUUID} from 'node:crypto';

const code = (error: unknown): string | undefined => error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;

/** Publish an initialized owner directory atomically. Stale recovery removes only the observed owner. */
function acquire(path: string): (() => void) | undefined {
  const stage = mkdtempSync(join(dirname(path), '.aug-lock-'));
  const owner = 'owner-' + randomUUID();
  try {
    writeFileSync(join(stage, owner), String(process.pid));
    renameSync(stage, path);
    return () => {
      // A competing recovery can never remove a new owner's unique file.
      try { unlinkSync(join(path, owner)); }
      catch (error) { if (code(error)!=='ENOENT') throw error; }
      try { rmdirSync(path); }
      catch (error) {
        // The successor can replace our empty directory before this cleanup.
        if (!['ENOENT','ENOTEMPTY'].includes(code(error)??'')) throw error;
      }
    };
  } catch (error) {
    if (!['EEXIST', 'ENOTEMPTY'].includes(code(error) ?? '')) throw error;
    try {
      const owners = readdirSync(path);
      if (owners.length === 0) { rmdirSync(path); return undefined; }
      // Read older releases' pid locks too. A new lock is never published empty.
      if (owners.length !== 1 || owners[0] !== 'pid' && !/^owner-[a-f0-9-]{36}$/.test(owners[0])) throw new Error('PACKAGE_LOCK: Unrecognized installer lock at ' + path);
      const file = join(path, owners[0]), pid = Number(readFileSync(file, 'utf8'));
      if (!Number.isSafeInteger(pid) || pid < 1) throw new Error('PACKAGE_LOCK: Invalid installer lock owner at ' + path);
      try { process.kill(pid, 0); }
      catch (error) { if (code(error) === 'ESRCH') { unlinkSync(file); rmdirSync(path); } }
    } catch (error) {
      if (!['ENOENT', 'ENOTEMPTY'].includes(code(error) ?? '')) throw error;
    }
    return undefined;
  } finally { rmSync(stage, {recursive: true, force: true}); }
}
const timeout = (path: string): Error => new Error('PACKAGE_LOCK: Another August installation is still running. Let it finish, then retry. Lock: ' + path);

/** Serialize source writers and recover a terminated writer without deleting another owner's lock. */
export function withPackageLock<T>(path: string, action: () => T): T {
  const deadline = Date.now() + 30000;
  while (true) {
    const release = acquire(path);
    if (release) { try { return action(); } finally { release(); } }
    if (Date.now() >= deadline) throw timeout(path);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
}

/** Hold the same writer lock across downloads and asynchronous verification. */
export async function withPackageLockAsync<T>(path: string, action: () => Promise<T>): Promise<T> {
  const deadline = Date.now() + 30000;
  while (true) {
    const release = acquire(path);
    if (release) { try { return await action(); } finally { release(); } }
    if (Date.now() >= deadline) throw timeout(path);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

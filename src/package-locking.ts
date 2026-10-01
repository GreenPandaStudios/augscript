import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Serialize writers while allowing independent projects to share immutable cached Git objects. */
export function withPackageLock<T>(path: string, action: () => T): T {
  const deadline = Date.now() + 30000;
  while (true) {
    try { mkdirSync(path); break; }
    catch (error) {
      if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'EEXIST') throw error;
      let stale = false;
      try {
        const pid = Number(readFileSync(join(path, 'pid'), 'utf8'));
        if (!Number.isSafeInteger(pid) || pid < 1) throw new Error('Invalid lock owner');
        try { process.kill(pid, 0); }
        catch (error) { stale = !!error && typeof error === 'object' && 'code' in error && error.code === 'ESRCH'; }
      } catch { stale = existsSync(path) && Date.now() - statSync(path).mtimeMs > 180000; }
      if (stale) { rmSync(path, { recursive: true, force: true }); continue; }
      if (Date.now() >= deadline) throw new Error('Another August package installation is still running. Let it finish, then retry. Lock: ' + path);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
  try { writeFileSync(join(path, 'pid'), String(process.pid)); return action(); }
  finally { rmSync(path, { recursive: true, force: true }); }
}

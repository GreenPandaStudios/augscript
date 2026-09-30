import test from 'node:test';
import assert from 'node:assert/strict';
import { registryMatches, verifyRelease } from '../scripts/publish-release.mjs';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('publication retry skips only identical published archives and fails closed on registry errors', () => {
  const result = (status, value) => ({ status, stdout: JSON.stringify(value), stderr: 'registry failure' });
  assert.equal(registryMatches(result(0, 'sha512-verified'), 'sha512-verified'), true);
  assert.throws(() => registryMatches(result(0, 'sha512-different'), 'sha512-verified'), /differs/);
  assert.equal(registryMatches(result(1, { error: { code: 'E404' } }), 'sha512-verified'), false);
  for (const code of ['E401', 'E403', 'E500', 'ETIMEDOUT'])
    assert.throws(() => registryMatches(result(1, { error: { code } }), 'sha512-verified'), /lookup failed/);
});

test('release verifier rejects metadata path traversal before reading archives', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aug-release-invalid-'));
  try {
    const packages = ['stdlib', 'web', 'crypto', 'cli'].map(name => ({directory:name,name:`@greenpandastudios/aug-${name}`,version:JSON.parse(readFileSync('package.json','utf8')).version,filename:'../outside.tgz'}));
    writeFileSync(join(directory,'packages.json'), JSON.stringify(packages));
    writeFileSync(join(directory,'SHA256SUMS'), '0'.repeat(64)+'  outside.tgz\n');
    assert.throws(() => verifyRelease(directory), /outside.tgz/);
  } finally { rmSync(directory, {recursive:true,force:true}); }
});

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('one-click release verifier accepts the package version shipped by this source tree', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-one-click-release.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  assert.equal(
    result.status,
    0,
    `release verifier failed:\n${result.stdout}${result.stderr}`
  );
});

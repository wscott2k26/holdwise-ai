import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');

test('native ready handshake is not blocked on requestAnimationFrame', () => {
  const reporter = source.match(/function BootReadyReporter\(\)[\s\S]*?return null\n}/)?.[0] || '';
  assert.ok(reporter.includes('reportNativeBootReady()'), 'BootReadyReporter must report ready');
  assert.equal(reporter.includes('requestAnimationFrame'), false, 'native readiness must not depend on the simulator GPU producing an animation frame');
});

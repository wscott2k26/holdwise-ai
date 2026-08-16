import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function withWindow(value, fn) {
  const previous = globalThis.window;
  globalThis.window = value;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (previous === undefined) delete globalThis.window;
      else globalThis.window = previous;
    });
}

test('reportNativeBootReady posts a ready message to the native bridge', async () => {
  const messages = [];
  await withWindow({
    webkit: {
      messageHandlers: {
        holdwiseBoot: {
          postMessage(message) { messages.push(message); },
        },
      },
    },
  }, async () => {
    const { reportNativeBootReady } = await import(`../src/lib/nativeBoot.js?ready=${Date.now()}`);
    reportNativeBootReady();
  });
  assert.deepEqual(messages, [{ type: 'ready' }]);
});

test('native boot reporting is safe when the native bridge is unavailable', async () => {
  await withWindow({}, async () => {
    const { reportNativeBootReady } = await import(`../src/lib/nativeBoot.js?missing=${Date.now()}`);
    assert.doesNotThrow(() => reportNativeBootReady());
  });
});

test('startup error forwarding preserves browser error location and rejection stacks', async () => {
  const listeners = new Map();
  const messages = [];
  await withWindow({
    webkit: {
      messageHandlers: {
        holdwiseBoot: {
          postMessage(message) { messages.push(message); },
        },
      },
    },
    addEventListener(name, handler) { listeners.set(name, handler); },
  }, async () => {
    const { installNativeBootErrorForwarding } = await import(`../src/lib/nativeBoot.js?errors=${Date.now()}`);
    installNativeBootErrorForwarding();
    listeners.get('error')?.({
      message: 'Script error.',
      filename: 'file:///app/www/index.html',
      lineno: 47,
      colno: 19,
    });
    listeners.get('unhandledrejection')?.({ reason: new Error('startup boom') });
  });

  assert.deepEqual(messages[0], {
    type: 'error', name: 'Error', message: 'Script error.',
    source: 'file:///app/www/index.html', line: 47, column: 19, stack: '',
  });
  assert.equal(messages[1].stack.includes('startup boom'), true);
});

test('normalizeBootError produces a complete safe diagnostic payload', async () => {
  const { normalizeBootError } = await import(`../src/lib/nativeBoot.js?normalize=${Date.now()}`);

  assert.deepEqual(
    normalizeBootError(
      { name: 'TypeError', message: 'boom', stack: 42 },
      'fallback',
      { source: 12, line: '7', column: null },
    ),
    { name: 'TypeError', message: 'boom', source: '', line: 0, column: 0, stack: '' },
  );
});

test('native entry inspection reports the inlined module source map and rejects every external primary entry form', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'holdwise-native-entry-'));
  const indexPath = path.join(root, 'index.html');
  const script = path.resolve('scripts/inspect-native-entry.mjs');
  const inlineModule = [
    '<div id="root"></div>',
    '<script type="module" data-holdwise-native-inline>',
    'console.log("boot");',
    '//# sourceMappingURL=assets/index-abc123.js.map',
    '</script>',
  ].join('\n');

  try {
    fs.writeFileSync(indexPath, inlineModule);
    const valid = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(valid.stdout, /assets\/index-abc123\.js\.map/);

    fs.writeFileSync(indexPath, '<script type="module" data-holdwise-native-inline>console.log("boot");</script>');
    const malformed = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
    assert.notEqual(malformed.status, 0);

    for (const src of ['assets/index-abc123.js', '/assets/index-abc123.js', './assets/index-abc123.js?v=1']) {
      fs.writeFileSync(indexPath, `${inlineModule}\n<script type="module" src="${src}"></script>`);
      const external = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
      assert.notEqual(external.status, 0, `external primary entry must fail: ${src}`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

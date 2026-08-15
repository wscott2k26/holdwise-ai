import test from 'node:test';
import assert from 'node:assert/strict';

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

test('startup error forwarding sends only safe error name and message strings', async () => {
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
    listeners.get('error')?.({ error: { name: 'TypeError', message: 'boom', secret: 'do-not-send' }, message: 'fallback' });
    listeners.get('unhandledrejection')?.({ reason: new Error('promise boom') });
  });

  assert.deepEqual(messages, [
    { type: 'error', name: 'TypeError', message: 'boom' },
    { type: 'error', name: 'Error', message: 'promise boom' },
  ]);
  assert.equal(JSON.stringify(messages).includes('do-not-send'), false);
});

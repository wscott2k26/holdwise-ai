import test from 'node:test';
import assert from 'node:assert/strict';

function makeWindow(href) {
  const url = new URL(href);
  const calls = [];
  return {
    location: {
      href: url.href,
      search: url.search,
      pathname: url.pathname,
      hash: url.hash,
    },
    localStorage: {
      values: new Map(),
      getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
      setItem(key, value) { this.values.set(key, String(value)); },
      removeItem(key) { this.values.delete(key); },
    },
    history: {
      replaceState(...args) { calls.push(args); },
    },
    __replaceCalls: calls,
  };
}

async function importWithWindow(href, suffix) {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const fake = makeWindow(href);
  globalThis.window = fake;
  globalThis.document = { title: 'HoldWise' };
  try {
    await import(`../src/lib/app-params.js?${suffix}-${Date.now()}-${Math.random()}`);
    return fake;
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
}

test('clean native file URL does not mutate browser history', async () => {
  const fake = await importWithWindow('file:///HoldWise%20AI.app/www/index.html', 'file');
  assert.equal(fake.__replaceCalls.length, 0);
});

test('access_token is removed from a normal web URL when present', async () => {
  const fake = await importWithWindow('https://holdwise.example/app?access_token=secret&mode=trainer#practice', 'web');
  assert.equal(fake.__replaceCalls.length, 1);
  assert.equal(fake.__replaceCalls[0][2], '/app?mode=trainer#practice');
});

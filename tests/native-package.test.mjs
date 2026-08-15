import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

test('native preview HTML self-contains first-paint CSS and JavaScript', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /<style[^>]*data-holdwise-inline/);
  assert.match(html, /<script[^>]*data-holdwise-inline/);
  assert.doesNotMatch(html, /src=["']\.\/assets\/index-[^"']+\.js/);
  assert.doesNotMatch(html, /href=["']\.\/assets\/index-[^"']+\.css/);
  assert.doesNotMatch(html, /href=["']\/manifest\.json/);
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  assert.equal(assets.some((name) => /strategyWorker.*\.js$/.test(name)), true);
});

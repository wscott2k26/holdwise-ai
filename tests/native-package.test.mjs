import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

test('native preview packaging receipt proves first-paint CSS and JavaScript were inlined', () => {
  const receipt = JSON.parse(readFileSync(join(root, '.holdwise-native-bootstrap.json'), 'utf8'));
  console.log('NATIVE_BOOTSTRAP_RECEIPT', JSON.stringify(receipt));
  assert.equal(receipt.version, 1);
  assert.match(receipt.inlinedScript, /^\.\/assets\/index-.+\.js$/);
  assert.match(receipt.inlinedStyle, /^\.\/assets\/index-.+\.css$/);
  assert.equal(receipt.scriptTagRemoved, true, 'original primary JavaScript tag was not removed');
  assert.equal(receipt.styleTagRemoved, true, 'original primary stylesheet tag was not removed');
  assert.equal(receipt.manifestRemoved, true, 'root manifest link remains');
  assert.equal(receipt.inlineScriptMarker, true, 'inline JavaScript marker is missing');
  assert.equal(receipt.inlineStyleMarker, true, 'inline CSS marker is missing');
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  const workers = assets.filter((name) => /strategyWorker.*\.js$/.test(name));
  console.log('NATIVE_WORKER_EVIDENCE', JSON.stringify({ workers, assetCount: assets.length }));
  assert.equal(workers.length > 0, true, 'exact-strategy worker asset is missing');
});

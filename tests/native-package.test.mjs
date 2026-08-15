import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

test('native preview HTML self-contains first-paint CSS and JavaScript', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const evidence = {
    inlineStyle: /<style[^>]*data-holdwise-inline/.test(html),
    inlineScript: /<script[^>]*data-holdwise-inline/.test(html),
    externalPrimaryScript: /src=["']\.\/assets\/index-[^"']+\.js/.test(html),
    externalPrimaryStyle: /href=["']\.\/assets\/index-[^"']+\.css/.test(html),
    rootManifest: /href=["']\/manifest\.json/.test(html),
    htmlBytes: Buffer.byteLength(html),
  };
  console.log('NATIVE_BOOTSTRAP_EVIDENCE', JSON.stringify(evidence));
  assert.equal(evidence.inlineStyle, true, 'primary CSS was not inlined');
  assert.equal(evidence.inlineScript, true, 'primary JavaScript was not inlined');
  assert.equal(evidence.externalPrimaryScript, false, 'external primary JavaScript reference remains');
  assert.equal(evidence.externalPrimaryStyle, false, 'external primary stylesheet reference remains');
  assert.equal(evidence.rootManifest, false, 'root manifest reference remains');
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  const workers = assets.filter((name) => /strategyWorker.*\.js$/.test(name));
  console.log('NATIVE_WORKER_EVIDENCE', JSON.stringify({ workers, assetCount: assets.length }));
  assert.equal(workers.length > 0, true, 'exact-strategy worker asset is missing');
});

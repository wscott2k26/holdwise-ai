import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

test('native preview HTML self-contains first-paint CSS and JavaScript', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const shell = html.replace(
    /<script\b[^>]*data-holdwise-inline[^>]*>[\s\S]*?<\/script>/i,
    '<script data-holdwise-inline></script>'
  );
  const evidence = {
    inlineStyle: /<style\b[^>]*data-holdwise-inline/.test(html),
    inlineScript: /<script\b[^>]*data-holdwise-inline/.test(html),
    externalPrimaryScript: /<script\b[^>]*\bsrc=["']\.\/assets\/index-[^"']+\.js["'][^>]*>/i.test(shell),
    externalPrimaryStyle: /<link\b[^>]*\bhref=["']\.\/assets\/index-[^"']+\.css["'][^>]*>/i.test(shell),
    rootManifest: /<link\b[^>]*\bhref=["']\/manifest\.json["'][^>]*>/i.test(shell),
    htmlBytes: Buffer.byteLength(html),
  };
  console.log('NATIVE_BOOTSTRAP_EVIDENCE', JSON.stringify(evidence));
  assert.equal(evidence.inlineStyle, true, 'primary CSS was not inlined');
  assert.equal(evidence.inlineScript, true, 'primary JavaScript was not inlined');
  assert.equal(evidence.externalPrimaryScript, false, 'external primary JavaScript tag remains outside the inline bundle');
  assert.equal(evidence.externalPrimaryStyle, false, 'external primary stylesheet tag remains');
  assert.equal(evidence.rootManifest, false, 'root manifest link remains');
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  const workers = assets.filter((name) => /strategyWorker.*\.js$/.test(name));
  console.log('NATIVE_WORKER_EVIDENCE', JSON.stringify({ workers, assetCount: assets.length }));
  assert.equal(workers.length > 0, true, 'exact-strategy worker asset is missing');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

function openingScriptTags(html) {
  const lower = html.toLowerCase();
  const tags = [];
  let cursor = 0;
  while (cursor < html.length) {
    const start = lower.indexOf('<script', cursor);
    if (start < 0) break;
    const openEnd = html.indexOf('>', start);
    if (openEnd < 0) break;
    tags.push(html.slice(start, openEnd + 1));
    const close = lower.indexOf('</script>', openEnd + 1);
    cursor = close < 0 ? openEnd + 1 : close + '</script>'.length;
  }
  return tags;
}

test('native preview HTML self-contains first-paint CSS and JavaScript', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const scripts = openingScriptTags(html);
  const evidence = {
    inlineStyle: /<style\b[^>]*data-holdwise-inline/.test(html),
    inlineScript: scripts.some((tag) => /data-holdwise-inline/i.test(tag)),
    externalPrimaryScript: scripts.some((tag) => /\bsrc=["']\.\/assets\/index-[^"']+\.js["']/i.test(tag)),
    externalPrimaryStyle: /<link\b[^>]*\bhref=["']\.\/assets\/index-[^"']+\.css["'][^>]*>/i.test(html),
    rootManifest: /<link\b[^>]*\bhref=["']\/manifest\.json["'][^>]*>/i.test(html),
    scriptTags: scripts,
    htmlBytes: Buffer.byteLength(html),
  };
  console.log('NATIVE_BOOTSTRAP_EVIDENCE', JSON.stringify(evidence));
  assert.equal(evidence.inlineStyle, true, 'primary CSS was not inlined');
  assert.equal(evidence.inlineScript, true, 'primary JavaScript was not inlined');
  assert.equal(evidence.externalPrimaryScript, false, 'external primary JavaScript tag remains');
  assert.equal(evidence.externalPrimaryStyle, false, 'external primary stylesheet tag remains');
  assert.equal(evidence.rootManifest, false, 'root manifest link remains');
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  const workers = assets.filter((name) => /strategyWorker.*\.js$/.test(name));
  console.log('NATIVE_WORKER_EVIDENCE', JSON.stringify({ workers, assetCount: assets.length }));
  assert.equal(workers.length > 0, true, 'exact-strategy worker asset is missing');
});

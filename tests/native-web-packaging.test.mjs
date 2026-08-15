import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'holdwise-native-web-'));
  const assets = path.join(root, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  fs.writeFileSync(path.join(assets, 'index-abc.js'), 'console.log("boot"); import("./CoachAcePanel-def.js"); new URL("strategyWorker-ghi.js", import.meta.url);');
  fs.writeFileSync(path.join(assets, 'index-abc.css'), 'body{background:#07131f}');
  fs.writeFileSync(path.join(assets, 'CoachAcePanel-def.js'), 'export default 1;');
  fs.writeFileSync(path.join(assets, 'strategyWorker-ghi.js'), 'self.onmessage=()=>{};');
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><html><head>
<link rel="icon" href="https://base44.com/logo_v2.svg">
<link rel="manifest" href="/manifest.json">
<script type="module" crossorigin src="./assets/index-abc.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-abc.css">
</head><body><div id="root"></div></body></html>`);
  return root;
}

test('native transform inlines first-paint assets and preserves lazy/worker resolution', () => {
  const root = fixture();
  const result = spawnSync(process.execPath, ['scripts/inline-native-web.mjs', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /<style[^>]*data-holdwise-native-inline/);
  assert.match(html, /<script type="module"[^>]*data-holdwise-native-inline/);
  assert.doesNotMatch(html, /src="\.\/assets\/index-[^"]+\.js"/);
  assert.doesNotMatch(html, /href="\.\/assets\/index-[^"]+\.css"/);
  assert.doesNotMatch(html, /base44\.com\/logo_v2\.svg/);
  assert.doesNotMatch(html, /\/manifest\.json/);
  assert.match(html, /import\("\.\/assets\/CoachAcePanel-def\.js"\)/);
  assert.match(html, /new URL\("\.\/assets\/strategyWorker-ghi\.js", import\.meta\.url\)/);
  assert.equal(fs.existsSync(path.join(root, 'assets', 'strategyWorker-ghi.js')), true);
});

test('native verifier rejects a bundle that still has external primary boot assets', () => {
  const root = fixture();
  const result = spawnSync(process.execPath, ['scripts/verify-native-web.mjs', root], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const bootPath = 'native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift';
const controllerPath = 'native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift';

test('Storm And Me boot view keeps company-first branding and product subtitle support', () => {
  assert.equal(fs.existsSync(bootPath), true, 'StormAndMeBootView.swift must exist');
  const source = fs.readFileSync(bootPath, 'utf8');
  assert.match(source, /STORM AND ME/);
  assert.match(source, /productName/);
  assert.match(source, /UIAccessibility\.isReduceMotionEnabled/);
  assert.match(source, /showFailure/);
  assert.match(source, /dismissReady/);
});

test('native controller waits for web ready and surfaces startup failures', () => {
  const source = fs.readFileSync(controllerPath, 'utf8');
  assert.match(source, /holdwiseBoot/);
  assert.match(source, /HOLDWISE_BOOT_READY/);
  assert.match(source, /case "ready"/);
  assert.match(source, /case "error"/);
  assert.match(source, /webViewWebContentProcessDidTerminate/);
  assert.match(source, /retry/);
});

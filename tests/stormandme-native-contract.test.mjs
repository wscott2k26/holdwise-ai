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

test('native controller exposes deterministic simulator ready and error marker files', () => {
  const source = fs.readFileSync(controllerPath, 'utf8');
  assert.match(source, /holdwise-boot-ready/);
  assert.match(source, /holdwise-boot-error\.txt/);
  assert.match(source, /Library\/Caches|cachesDirectory/);
  assert.match(source, /writeBootReadyMarker/);
  assert.match(source, /writeBootErrorMarker/);
  assert.match(source, /clearBootMarkers/);
});

test('Storm And Me intro remains visibly branded for at least 1.5 seconds before ready handoff', () => {
  const source = fs.readFileSync(controllerPath, 'utf8');
  assert.match(source, /minimumIntroDuration\s*:\s*TimeInterval\s*=\s*1\.5/);
  assert.match(source, /bootExperienceStartedAt/);
  assert.match(source, /dismissBootAfterMinimumDuration/);
  assert.match(source, /ProcessInfo\.processInfo\.systemUptime/);
  assert.match(source, /minimumIntroDuration\s*-\s*elapsed/);
  assert.doesNotMatch(source, /case "ready":[\s\S]{0,300}bootView\.dismissReady\(\)/, 'ready should schedule the branded handoff instead of dismissing the intro immediately');
});

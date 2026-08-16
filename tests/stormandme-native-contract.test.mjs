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

test('native controller persists complete startup diagnostics and catches errors after ready', () => {
  const source = fs.readFileSync(controllerPath, 'utf8');
  const readyBranch = source.match(/case "ready":([\s\S]*?)(?=\n\s*case "error":)/)?.[1] || '';
  const errorBranch = source.match(/case "error":([\s\S]*?)(?=\n\s*default:)/)?.[1] || '';
  const failureHandler = source.match(/private func showBootFailure\([\s\S]*?(?=\n\s*func webView\()/)?.[0] || '';

  assert.match(source, /payload\["source"\]/);
  assert.match(source, /payload\["line"\]/);
  assert.match(source, /payload\["column"\]/);
  assert.match(source, /payload\["stack"\]/);
  assert.match(source, /source:\s*\\\(source\)/);
  assert.match(source, /line:\s*\\\(line\)/);
  assert.match(source, /column:\s*\\\(column\)/);
  assert.match(source, /stack:\s*\\\(stack\)/);
  assert.match(source, /postReadyVerificationDuration\s*:\s*TimeInterval\s*=\s*5/);
  assert.match(readyBranch, /beginPostReadyVerification\(\)/, 'ready must begin the late-error verification window');
  assert.match(errorBranch, /if isVerifyingBootAfterReady/, 'error must inspect the post-ready verification state');
  assert.match(errorBranch, /HOLDWISE_BOOT_LATE_ERROR/, 'error during verification must be marked as late');
  assert.match(errorBranch, /showBootFailure\([\s\S]*?marker:\s*diagnostic/, 'error must surface failure with the complete marker');
  assert.match(failureHandler, /isVerifyingBootAfterReady\s*=\s*false/, 'handling an error must invalidate ready verification');
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

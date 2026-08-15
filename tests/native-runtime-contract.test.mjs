import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const controller = readFileSync('native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift', 'utf8');
const workflow = readFileSync('.github/workflows/appetize-simulator.yml', 'utf8');

test('native shell records web navigation and JavaScript startup failures', () => {
  assert.match(controller, /HOLDWISE_NAV_FINISHED/);
  assert.match(controller, /HOLDWISE_NAV_ERROR/);
  assert.match(controller, /window\.addEventListener\(['"]error['"]/);
  assert.match(controller, /window\.addEventListener\(['"]unhandledrejection['"]/);
  assert.match(controller, /holdwiseBoot/);
  assert.match(controller, /HOLDWISE_DOM_STATE/);
  assert.match(controller, /NSLog/);
});

test('CI boots the built simulator app and captures logs plus a screenshot', () => {
  assert.match(workflow, /Runtime smoke test/);
  assert.match(workflow, /simctl boot/);
  assert.match(workflow, /simctl install/);
  assert.match(workflow, /simctl launch/);
  assert.match(workflow, /log stream/);
  assert.match(workflow, /simctl io/);
  assert.match(workflow, /screenshot/);
  assert.match(workflow, /HOLDWISE_/);
});

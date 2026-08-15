import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const controller = readFileSync('native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift', 'utf8');
const workflow = readFileSync('.github/workflows/appetize-simulator.yml', 'utf8');

test('native shell records boot state and persists runtime diagnostics', () => {
  assert.match(controller, /HOLDWISE_NAV_FINISHED/);
  assert.match(controller, /HOLDWISE_NAV_ERROR/);
  assert.match(controller, /window\.addEventListener\(['"]error['"]/);
  assert.match(controller, /window\.addEventListener\(['"]unhandledrejection['"]/);
  assert.match(controller, /holdwiseBoot/);
  assert.match(controller, /HOLDWISE_DOM_STATE/);
  assert.match(controller, /holdwise-runtime\.log/);
  assert.match(controller, /FileHandle/);
});

test('CI pulls app-owned diagnostics and captures a simulator screenshot', () => {
  assert.match(workflow, /Runtime smoke test/);
  assert.match(workflow, /simctl boot/);
  assert.match(workflow, /simctl install/);
  assert.match(workflow, /simctl launch/);
  assert.match(workflow, /get_app_container/);
  assert.match(workflow, /holdwise-runtime\.log/);
  assert.match(workflow, /simctl io/);
  assert.match(workflow, /screenshot/);
});

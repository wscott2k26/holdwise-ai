import test from "node:test";
import assert from "node:assert/strict";
import { hapticPulse } from "../src/lib/haptics.js";

test("haptics are disabled without touching native or browser transports", () => {
  let nativeCalls = 0;
  let vibrateCalls = 0;
  const scope = {
    webkit: { messageHandlers: { holdwiseHaptics: { postMessage: () => { nativeCalls += 1; } } } },
    navigator: { vibrate: () => { vibrateCalls += 1; return true; } },
  };
  assert.equal(hapticPulse(false, 14, "selection", scope), false);
  assert.equal(nativeCalls, 0);
  assert.equal(vibrateCalls, 0);
});

test("native iOS haptic bridge wins over browser vibration", () => {
  const messages = [];
  let vibrateCalls = 0;
  const scope = {
    webkit: { messageHandlers: { holdwiseHaptics: { postMessage: (value) => messages.push(value) } } },
    navigator: { vibrate: () => { vibrateCalls += 1; return true; } },
  };
  assert.equal(hapticPulse(true, 14, "success", scope), true);
  assert.deepEqual(messages, ["success"]);
  assert.equal(vibrateCalls, 0);
});

test("browser vibration is the fallback transport", () => {
  const patterns = [];
  const scope = { navigator: { vibrate: (pattern) => { patterns.push(pattern); return true; } } };
  assert.equal(hapticPulse(true, 22, "warning", scope), true);
  assert.deepEqual(patterns, [22]);
});

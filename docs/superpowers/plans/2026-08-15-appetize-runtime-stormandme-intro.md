# Appetize Runtime + StormAndMe Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the iOS Simulator/Appetize package reliably boot the HoldWise AI trainer, show a short premium Storm And Me cloud/lightning intro, and replace silent blank-screen failures with actionable diagnostics.

**Architecture:** Keep the existing lightweight WKWebView wrapper and production code isolated from this preview fix. First add boot instrumentation and a simulator smoke test to identify the exact failing runtime boundary. Then apply the smallest proven native-preview packaging/startup fix, add a native StormAndMe overlay controlled by an explicit React-to-native ready/error handshake, and only publish the ZIP after gameplay, packaging, iOS build, and simulator runtime verification pass.

**Tech Stack:** React 18, Vite 6, WKWebView/UIKit, Swift, XcodeGen, Node `node:test`, GitHub Actions macOS runner, iOS Simulator.

## Global Constraints

- Work only on the isolated `appetize-runtime-fix` branch until verification is complete; production `main` remains untouched.
- Preserve the existing exact-strategy engine, paytables, 34 Academy games, 60 lessons, and exhaustive 2,598,960-hand audit.
- Do not add a third-party splash/animation dependency.
- Storm And Me is company-first; `HoldWise AI` is secondary.
- Normal intro target is approximately 1.2–1.6 seconds, but it remains visible until the web app reports `ready`.
- Respect iOS Reduce Motion.
- A startup failure must show a branded diagnostic/retry screen, never an unexplained dark rectangle.
- Native preview packaging may differ from the normal web build; do not regress normal web paths.

---

### Task 1: Add diagnostic-first simulator boot evidence

**Files:**
- Create: `tests/native-runtime-contract.test.mjs`
- Modify: `.github/workflows/appetize-simulator.yml`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`

**Interfaces:**
- Consumes: existing `HoldWiseWebViewController`, existing `www/index.html` bundle.
- Produces: native console markers `HOLDWISE_NAV_FINISHED`, `HOLDWISE_NAV_ERROR:<message>`, `HOLDWISE_WEB_ERROR:<message>`, plus a GitHub Actions simulator-smoke step that captures the current failure before a packaging fix is attempted.

- [ ] **Step 1: Write the failing contract test**

Create `tests/native-runtime-contract.test.mjs`:

```js
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
});

test('CI boots the built simulator app and collects HoldWise runtime markers', () => {
  assert.match(workflow, /Runtime smoke test/);
  assert.match(workflow, /simctl boot/);
  assert.match(workflow, /simctl install/);
  assert.match(workflow, /simctl launch/);
  assert.match(workflow, /HOLDWISE_/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run in CI:

```bash
node --test tests/native-runtime-contract.test.mjs
```

Expected: FAIL because the current controller and workflow do not contain the runtime markers/simulator smoke step.

- [ ] **Step 3: Add diagnostic-only native instrumentation**

Add a `holdwiseBoot` script-message handler and a document-start diagnostic script to `HoldWiseWebViewController.swift`. The script must only report errors at this stage; it must not alter routing, asset paths, or packaging.

Core injected JavaScript:

```js
window.addEventListener('error', function(event) {
  window.webkit?.messageHandlers?.holdwiseBoot?.postMessage({
    type: 'error',
    message: String(event?.message || 'Unknown JavaScript error')
  });
});
window.addEventListener('unhandledrejection', function(event) {
  window.webkit?.messageHandlers?.holdwiseBoot?.postMessage({
    type: 'error',
    message: String(event?.reason?.message || event?.reason || 'Unhandled promise rejection')
  });
});
```

Native logging contract:

```swift
print("HOLDWISE_NAV_FINISHED")
print("HOLDWISE_NAV_ERROR:\(error.localizedDescription)")
print("HOLDWISE_WEB_ERROR:\(message)")
```

- [ ] **Step 4: Add CI simulator smoke collection**

Extend workflow branch triggers to include `appetize-runtime-fix`. After the Xcode build, select an available iPhone simulator runtime, boot it, install `$APP`, launch `com.willywill.holdwiseai`, wait up to 20 seconds, then collect relevant simulator logs into `$RUNNER_TEMP/holdwise-runtime.log`. At this diagnostic stage, upload or print the log even if no ready marker exists; do not yet fail solely for missing `ready`.

- [ ] **Step 5: Run CI and identify the exact failing boundary**

Expected evidence is one of:
- JavaScript/module/subresource error -> continue to Task 2 packaging hardening.
- Native navigation failure -> fix native bundle URL/read-access boundary in Task 2 instead.
- App process crash -> stop and re-plan around crash stack before Task 2.

Commit diagnostic evidence changes:

```bash
git add tests/native-runtime-contract.test.mjs .github/workflows/appetize-simulator.yml native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift
git commit -m "test: capture Appetize runtime boot failure"
```

---

### Task 2: Harden native-preview startup at the proven failing boundary

**Files:**
- Create: `tests/native-package.test.mjs`
- Modify: `native/ios/HoldWiseAI/Scripts/prepare_web.sh`
- Modify: `src/lib/app-params.js` only if Task 1 evidence shows file-scheme history mutation participates in the failure.
- Modify: `.github/workflows/appetize-simulator.yml`

**Interfaces:**
- Consumes: Vite `dist/index.html`, generated primary `assets/index-*.js`, generated primary `assets/index-*.css`.
- Produces: `native/ios/HoldWiseAI/Resources/www/index.html` whose first-paint app JS/CSS are self-contained for WKWebView startup; lazy chunks and `strategyWorker` remain separate assets.

- [ ] **Step 1: Write the failing native package verifier**

Create `tests/native-package.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'native/ios/HoldWiseAI/Resources/www';

test('native preview HTML has self-contained first-paint CSS and JavaScript', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /<style[^>]*data-holdwise-inline/);
  assert.match(html, /<script[^>]*data-holdwise-inline/);
  assert.doesNotMatch(html, /src=["']\.\/assets\/index-[^"']+\.js/);
  assert.doesNotMatch(html, /href=["']\.\/assets\/index-[^"']+\.css/);
  assert.doesNotMatch(html, /href=["']\/manifest\.json/);
});

test('native preview still packages an exact-strategy worker asset', () => {
  const assets = readdirSync(join(root, 'assets'));
  assert.equal(assets.some((name) => /strategyWorker.*\.js$/.test(name)), true);
});
```

- [ ] **Step 2: Run the native build plus verifier and verify RED**

Run:

```bash
npm run build:native
bash native/ios/HoldWiseAI/Scripts/prepare_web.sh
node --test tests/native-package.test.mjs
```

Expected: FAIL because current native HTML references the generated primary index JS/CSS externally.

- [ ] **Step 3: Implement the smallest evidence-backed packaging fix**

Update `prepare_web.sh` to copy `dist` as it does today, then use a deterministic Node transform (embedded heredoc is acceptable) that:
- Finds exactly one primary module script matching `./assets/index-*.js` in `www/index.html`.
- Finds exactly one primary stylesheet matching `./assets/index-*.css`.
- Reads both files.
- Escapes `</script` in the JS payload as `<\\/script` before embedding.
- Replaces the stylesheet tag with `<style data-holdwise-inline>...</style>`.
- Replaces the module-script tag with `<script type="module" data-holdwise-inline>...</script>`.
- Removes the root `/manifest.json` link and remote Base44 favicon from only the native copy.
- Exits non-zero if either primary asset cannot be identified exactly once.

Do not inline lazy chunks or `strategyWorker`.

- [ ] **Step 4: Add the package verifier to CI and verify GREEN**

Run:

```bash
node --test tests/native-package.test.mjs
```

Expected: PASS after `prepare_web.sh` runs.

- [ ] **Step 5: Re-run simulator diagnostics**

Expected: React should now advance farther. If it still emits a startup error, use the new diagnostic marker to make one additional minimal evidence-backed correction. Do not stack unrelated fixes.

Commit:

```bash
git add tests/native-package.test.mjs native/ios/HoldWiseAI/Scripts/prepare_web.sh src/lib/app-params.js .github/workflows/appetize-simulator.yml
git commit -m "fix: harden iOS preview web bootstrap"
```

---

### Task 3: Add the Storm And Me native intro and boot handshake

**Files:**
- Create: `src/lib/nativeBoot.js`
- Create: `tests/native-boot.test.mjs`
- Create: `native/ios/HoldWiseAI/Sources/StormAndMeIntroView.swift`
- Modify: `src/main.jsx`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`
- Modify: `tests/native-runtime-contract.test.mjs`

**Interfaces:**
- Produces JS `notifyNativeBootReady(): void` and `notifyNativeBootError(error: unknown): void`.
- Native receives dictionaries on `holdwiseBoot` with `type` equal to `ready` or `error` and optional `message`.
- `StormAndMeIntroView` exposes `dismiss(animated: Bool, completion: (() -> Void)?)`.

- [ ] **Step 1: Write failing web handshake tests**

Create `tests/native-boot.test.mjs` that imports `src/lib/nativeBoot.js` and supplies a fake `globalThis.window.webkit.messageHandlers.holdwiseBoot.postMessage`. Assert:
- `notifyNativeBootReady()` posts `{ type: 'ready' }`.
- `notifyNativeBootError(new Error('boom'))` posts `{ type: 'error', message: 'boom' }`.
- Error serialization is capped at 500 characters and contains no stack trace.
- Calls are no-ops when the native handler is unavailable.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test tests/native-boot.test.mjs
```

Expected: FAIL because `src/lib/nativeBoot.js` does not exist.

- [ ] **Step 3: Implement minimal boot helper and main mount signal**

`src/lib/nativeBoot.js` public behavior:

```js
function bridge() {
  return globalThis?.window?.webkit?.messageHandlers?.holdwiseBoot;
}
export function notifyNativeBootReady() {
  bridge()?.postMessage({ type: 'ready' });
}
export function notifyNativeBootError(error) {
  const raw = error instanceof Error ? error.message : String(error ?? 'Unknown startup error');
  bridge()?.postMessage({ type: 'error', message: raw.slice(0, 500) });
}
```

In `src/main.jsx`, render normally and schedule `notifyNativeBootReady` with `requestAnimationFrame` immediately after `root.render(...)` so native removes the overlay only after React has mounted and a frame is scheduled.

- [ ] **Step 4: Run tests and verify GREEN**

```bash
node --test tests/native-boot.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Implement native StormAndMe intro**

Create `StormAndMeIntroView.swift` using UIKit/CoreAnimation only:
- Background `#07131F` equivalent.
- Vector cloud made from `CAShapeLayer`/Bezier curves.
- Center lightning bolt vector with champagne-gold core and restrained teal glow.
- Labels `STORM AND ME` then `HoldWise AI`.
- Two short opacity/glow pulses; no looping animation.
- `UIAccessibility.isReduceMotionEnabled` uses opacity-only fade.
- Accessibility label: `"Storm And Me. HoldWise AI."`.

- [ ] **Step 6: Gate the overlay on the boot handshake**

In `HoldWiseWebViewController`:
- Root view becomes a container containing WKWebView + intro overlay.
- Register both `holdwiseHaptics` and `holdwiseBoot` handlers.
- On `ready`: print `HOLDWISE_BOOT_READY`, cancel timeout, dismiss overlay.
- On `error`: print `HOLDWISE_WEB_ERROR:<message>` and show diagnostic state.
- After 20 seconds without `ready`: show diagnostic state.
- Diagnostic view includes `HoldWise AI couldn’t finish loading`, a `Retry` button that restores the intro then calls `loadBundledApp()`, and DEBUG-only sanitized error detail.
- Remove both message handlers in `deinit`.

- [ ] **Step 7: Extend static native contract test and verify GREEN**

Require source to contain:
- `StormAndMeIntroView`
- `HOLDWISE_BOOT_READY`
- `HoldWise AI couldn’t finish loading`
- `UIAccessibility.isReduceMotionEnabled`
- `holdwiseBoot`

Run:

```bash
node --test tests/native-runtime-contract.test.mjs tests/native-boot.test.mjs
```

Expected: PASS.

Commit:

```bash
git add src/lib/nativeBoot.js src/main.jsx tests/native-boot.test.mjs tests/native-runtime-contract.test.mjs native/ios/HoldWiseAI/Sources/StormAndMeIntroView.swift native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift
git commit -m "feat: add StormAndMe native launch intro"
```

---

### Task 4: Turn diagnostics into a hard runtime release gate

**Files:**
- Modify: `.github/workflows/appetize-simulator.yml`
- Modify: `tests/native-runtime-contract.test.mjs`

**Interfaces:**
- Consumes: native marker `HOLDWISE_BOOT_READY`.
- Produces: final ZIP only when a compatible iOS Simulator actually launches the app and reaches the React ready handshake.

- [ ] **Step 1: Strengthen failing workflow contract test**

Add assertion:

```js
assert.match(workflow, /grep[^\n]+HOLDWISE_BOOT_READY/);
```

Run and verify RED before changing workflow.

- [ ] **Step 2: Make simulator smoke test fail without ready marker**

Workflow behavior:
- Boot an available compatible iPhone simulator if one exists.
- Install and launch built app.
- Capture logs for up to 30 seconds.
- Print all `HOLDWISE_` markers.
- `grep -q 'HOLDWISE_BOOT_READY' "$RUNNER_TEMP/holdwise-runtime.log"` when a simulator was available.
- If the macOS image has no usable runtime/device, emit `runtime_smoke=skipped-no-compatible-simulator` instead of inventing success; packaging/static gates still run.

- [ ] **Step 3: Run all preview tests**

```bash
node --test tests/*.test.mjs
npm run validate:content
npm run build
npm run audit:gameplay
```

Expected: all pass, including the 2,598,960-hand audit.

- [ ] **Step 4: Run full GitHub Actions workflow**

Required green stages:
- sealed course data SHA verification
- dependency install
- all preview tests
- normal Vite build
- exhaustive gameplay audit
- native packaging verifier
- XcodeGen generation
- iOS Simulator build
- simulator runtime `HOLDWISE_BOOT_READY` gate (or explicit no-compatible-runtime skip)
- `.app` bundle ID/architecture/web-index verification
- ZIP integrity
- artifact upload

- [ ] **Step 5: Commit and promote only after green**

Commit:

```bash
git add .github/workflows/appetize-simulator.yml tests/native-runtime-contract.test.mjs
git commit -m "ci: require HoldWise simulator boot readiness"
```

After final verification, fast-forward `appetize-preview` to the verified `appetize-runtime-fix` head. Do not merge to `main`.

---

### Task 5: Final package verification and handoff

**Files:**
- No source changes expected.
- Artifact output: `HoldWise-AI-Appetize-Simulator-v1.4.0.zip`

**Interfaces:**
- Produces one Appetize-ready ZIP containing `HoldWise AI.app`.

- [ ] **Step 1: Download the successful workflow artifact**

Extract the GitHub Actions wrapper and keep the inner `HoldWise-AI-Appetize-Simulator-v1.4.0.zip` as the user package.

- [ ] **Step 2: Verify locally before handoff**

Run:

```bash
unzip -t HoldWise-AI-Appetize-Simulator-v1.4.0.zip
```

Verify:
- `.app` exists.
- `www/index.html` exists.
- strategy worker exists.
- Info.plist bundle ID is `com.willywill.holdwiseai`.
- executable contains `arm64`.
- ZIP SHA-256 is recorded.

- [ ] **Step 3: Hand off only the verified inner ZIP**

Tell the user not to unzip before uploading to Appetize. Include the exact local sandbox link only after the file exists in `/mnt/data`.

## Plan self-review

- Spec coverage: diagnostic-first root cause investigation, packaging hardening, StormAndMe intro, ready/error handshake, Reduce Motion, branded failure state, simulator runtime gate, gameplay preservation, and final Appetize artifact are all mapped to tasks.
- Placeholder scan: no TBD/TODO/"implement later" steps remain.
- Type/interface consistency: `holdwiseBoot`, `ready`, `error`, `notifyNativeBootReady`, `notifyNativeBootError`, and `HOLDWISE_BOOT_READY` are named consistently across web/native/CI tasks.

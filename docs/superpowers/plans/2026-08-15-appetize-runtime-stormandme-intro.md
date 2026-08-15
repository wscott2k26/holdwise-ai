# Appetize Runtime + StormAndMe Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Appetize iOS Simulator build boot reliably into HoldWise AI, show a reusable Storm And Me cloud/lightning intro, and turn silent blank-screen failures into deterministic diagnostics.

**Architecture:** Keep the existing native WKWebView wrapper and preview-only branch. Harden the packaged native HTML so first paint does not depend on fragile external local boot assets, add a React↔native boot handshake, and add a native branded intro/error overlay that remains visible until the web app confirms readiness.

**Tech Stack:** React 18, Vite 6, WKWebView/UIKit, Bash packaging, XcodeGen, GitHub Actions, Node test runner.

## Global Constraints

- Production `main` remains untouched.
- Scope is the Appetize/iOS preview lane only unless explicitly promoted later.
- Company-first intro: `STORM AND ME` first, `HoldWise AI` secondary.
- No third-party splash/animation dependency.
- Existing premium/gameplay behavior and exact-strategy engine remain unchanged.
- Existing exhaustive 2,598,960-hand gameplay audit must continue passing.

---

### Task 1: Add a deterministic web boot bridge

**Files:**
- Create: `src/lib/nativeBoot.js`
- Modify: `src/main.jsx`
- Test: `tests/native-boot.test.mjs`

**Interfaces:**
- Produces: `reportNativeBootReady()` and `installNativeBootErrorForwarding()`.
- Native message contract: `window.webkit.messageHandlers.holdwiseBoot.postMessage({ type, message? })`.

- [ ] **Step 1: Write the failing test**

Create `tests/native-boot.test.mjs` that stubs `window.webkit.messageHandlers.holdwiseBoot.postMessage`, imports the helper, calls `reportNativeBootReady()`, and asserts `{ type: 'ready' }`. Add tests proving error forwarding serializes only safe `name`/`message` strings and never throws when the bridge is unavailable.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/native-boot.test.mjs`
Expected: FAIL because `src/lib/nativeBoot.js` does not exist.

- [ ] **Step 3: Implement the minimal helper**

Implement a tiny safe `post()` wrapper, `reportNativeBootReady()`, and one-time `installNativeBootErrorForwarding()` listeners for `error` and `unhandledrejection`.

Update `src/main.jsx` to install forwarding before render and call `reportNativeBootReady()` from `requestAnimationFrame` immediately after `createRoot(...).render(<App />)`.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/native-boot.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add native web boot handshake`

---

### Task 2: Guard file-scheme URL cleanup

**Files:**
- Modify: `src/lib/app-params.js`
- Test: `tests/app-params-native.test.mjs`

**Interfaces:**
- Existing `appParams` export remains unchanged.

- [ ] **Step 1: Write the failing test**

Add a browser-environment test harness that imports `app-params.js` with a `file:///.../www/index.html` URL and a spy for `history.replaceState`. Assert a clean file URL triggers zero history writes. Add a second case showing an actual removable query parameter still cleans a normal HTTPS URL.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/app-params-native.test.mjs`
Expected: FAIL because cleanup currently calls `replaceState` whenever `removeFromUrl` is requested, even when the parameter is absent.

- [ ] **Step 3: Implement the minimal guard**

Only call `replaceState` when the removable parameter was actually present. Preserve all existing parameter/storage semantics.

- [ ] **Step 4: Re-run the focused test**

Run: `node --test tests/app-params-native.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `fix: avoid unnecessary file url history mutation`

---

### Task 3: Harden native HTML packaging

**Files:**
- Modify: `native/ios/HoldWiseAI/Scripts/prepare_web.sh`
- Create: `scripts/verify-native-web.mjs`
- Test: `tests/native-web-packaging.test.mjs`

**Interfaces:**
- `prepare_web.sh` still outputs `native/ios/HoldWiseAI/Resources/www`.
- `scripts/verify-native-web.mjs <www-dir>` exits non-zero on packaging violations.

- [ ] **Step 1: Write the failing packaging test**

Create a temp Vite-like directory with `index.html`, one `assets/index-*.js`, one `assets/index-*.css`, and a strategy worker. Assert the verifier rejects HTML that still references the primary external boot JS/CSS and accepts HTML where those two assets are inline while the worker remains present.

- [ ] **Step 2: Run the test**

Run: `node --test tests/native-web-packaging.test.mjs`
Expected: FAIL because verifier does not exist.

- [ ] **Step 3: Implement verifier and packaging transform**

Add `scripts/verify-native-web.mjs` using Node `fs`/`path` only. Update `prepare_web.sh` to build native, copy `dist`, inline the primary generated CSS and module JS into `index.html`, remove the now-unused primary files, remove the external Base44 favicon if present, remove root `/manifest.json` references, then run the verifier.

- [ ] **Step 4: Run packaging tests**

Run: `node --test tests/native-web-packaging.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `fix: harden native web boot packaging`

---

### Task 4: Add the native Storm And Me intro and failure overlay

**Files:**
- Create: `native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`
- Modify: `native/ios/HoldWiseAI/project.yml` only if source discovery requires it.

**Interfaces:**
- `StormAndMeBootView.showLoading(productName:)`
- `StormAndMeBootView.showFailure(message:details:retry:)`
- `StormAndMeBootView.dismissReady()`
- Native script handler name: `holdwiseBoot`.

- [ ] **Step 1: Add a static contract test**

Create `tests/stormandme-native-contract.test.mjs` that reads the Swift source and asserts the company wordmark, product subtitle hook, `holdwiseBoot` handler registration, `ready` handling, error handling, and retry path exist.

- [ ] **Step 2: Run the test**

Run: `node --test tests/stormandme-native-contract.test.mjs`
Expected: FAIL because the boot view does not exist and controller has no `holdwiseBoot` channel.

- [ ] **Step 3: Implement the native boot view**

Build a UIKit overlay with midnight background, vector cloud outline, vector lightning bolt, `STORM AND ME`, product subtitle, two restrained pulse flashes, Reduce Motion fallback, and branded failure state with Retry.

Update `HoldWiseWebViewController` to register/unregister `holdwiseBoot`, add the overlay above the web view, keep it visible until `{type:'ready'}`, log `HOLDWISE_BOOT_READY`, surface `{type:'error'}` and boot timeout as branded diagnostics, and handle web-content process termination/navigation failures.

- [ ] **Step 4: Run static contract + existing JS tests**

Run: `node --test tests/stormandme-native-contract.test.mjs tests/native-boot.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add Storm And Me native boot experience`

---

### Task 5: Strengthen CI and build a verified Appetize ZIP

**Files:**
- Modify: `.github/workflows/appetize-simulator.yml`

**Interfaces:**
- Artifact remains named `HoldWise-AI-Appetize-Simulator-v1.4.0`.

- [ ] **Step 1: Add CI verification commands**

Run the three new focused test files before the existing premium/gameplay suite. After `prepare_web.sh`, run `node scripts/verify-native-web.mjs native/ios/HoldWiseAI/Resources/www`.

- [ ] **Step 2: Add simulator runtime smoke check**

When a compatible simulator runtime is available on the runner: create/boot a simulator, install the built `.app`, stream/collect logs, launch the bundle ID, wait up to 30 seconds for `HOLDWISE_BOOT_READY`, and fail if the marker never appears. If no compatible runtime exists, print an explicit skip reason while preserving all packaging/build checks.

- [ ] **Step 3: Trigger workflow on the implementation branch**

Temporarily include `appetize-runtime-fix-v2` in the workflow push branches or use `workflow_dispatch` against that branch.

- [ ] **Step 4: Verify full CI**

Expected passes:
- new boot/packaging/contract tests
- existing premium/gameplay tests
- exhaustive gameplay audit
- native packaging verifier
- Xcode simulator build
- runtime smoke check when runtime exists
- ZIP integrity and artifact upload

- [ ] **Step 5: Commit**

Commit message: `ci: verify Appetize runtime boot`

---

### Task 6: Final verification and handoff

**Files:** none unless verification exposes a defect.

- [ ] **Step 1: Download the newest workflow artifact**

Extract the GitHub Actions wrapper and identify the inner Appetize ZIP.

- [ ] **Step 2: Verify locally**

Check `unzip -t`, `.app` presence, `www/index.html`, inline boot JS/CSS, strategy worker presence, bundle ID, and ARM64 simulator architecture.

- [ ] **Step 3: Compare implementation branch against `appetize-preview`**

Confirm only intended preview/runtime files changed and `main` was not touched.

- [ ] **Step 4: Hand the verified inner ZIP to the user**

Provide the exact downloadable file and tell the user to upload the ZIP to Appetize without unzipping it.

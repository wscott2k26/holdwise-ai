# HoldWise Light Premium Runtime and Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a bright premium HoldWise Card Academy build that starts on Appetize iOS 16.2, preserves all 21 games and tutorials, and provides verified sound and native haptic feedback.

**Architecture:** Keep the existing React/Vite web app and Swift WKWebView shell. Add a small compatibility boundary for cloning and startup diagnostics, a token-driven light theme shared by lobby and family surfaces, and isolated `soundEffects`/`feedback` services consumed by tactile controls and game events. Release CI must test the exact inlined native package and refuse readiness when any startup error marker appears.

**Tech Stack:** React 18, Vite 6, Tailwind CSS, Node test runner, Framer Motion, Swift/UIKit/WebKit, XcodeGen, GitHub Actions, Appetize iOS Simulator.

## Global Constraints

- Preserve all game rules, evaluator logic, pay tables, billing identifiers, entitlements, tutorial curriculum, and route counts.
- Preserve 21 full-play routes and 21 ten-stage tutorials.
- Default surfaces must be light and colorful; dark full-screen surfaces may not dominate the lobby or game shell.
- Sound effects are local, original or properly licensed, short, normalized, and non-blocking.
- Sound effects default on, music defaults off, and Sound/Music/Haptics have separate persisted toggles.
- Minimum supported iOS remains 15.0 unless the user separately approves a change.
- No package is called ready until Appetize iOS 16.2 opens the exact ZIP and the user approves the visual result.

---

## File Structure

- `src/lib/cloneValue.js`: compatibility-safe structured data cloning.
- `src/lib/nativeBoot.js`: startup error normalization and native reporting.
- `src/lib/soundEffects.js`: single sound loading, playback, rate limiting, and no-op failure boundary.
- `src/lib/feedback.js`: one combined semantic sound/haptic API.
- `src/lib/appContext.jsx`: persisted Sound/Music/Haptics defaults and migration.
- `src/index.css`: light premium tokens, surfaces, family themes, and celebrations.
- `src/pages/CardAcademyLobby.jsx`: bright lobby composition.
- `src/components/games/GameFamilyTile.jsx`: distinct family color treatment.
- `src/components/games/GameShell.jsx`: family-aware bright gameplay shell.
- `src/components/premium/TactilePressable.jsx`: shared semantic feedback entry point.
- `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`: expanded diagnostics and haptic semantics.
- `native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift`: light branded boot/failure presentation.
- `public/audio/*.m4a`: bundled original/licensed effects.
- `scripts/verify-audio-assets.mjs`: audio manifest integrity gate.
- `scripts/verify-native-web.mjs`: exact inlined bundle compatibility assertions.
- `.github/workflows/card-academy-ios-release-v6.yml`: corrected oldest-runtime and artifact gate.

---

### Task 1: Reproduce and expose the iOS 16 startup failure

**Files:**
- Modify: `src/lib/nativeBoot.js`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`
- Modify: `tests/native-boot.test.mjs`
- Modify: `tests/stormandme-native-contract.test.mjs`
- Create: `scripts/inspect-native-entry.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `normalizeBootError(value, fallback, location)` returning `{ name, message, source, line, column, stack }`.
- Produces: native `error` payload persistence that records every supplied diagnostic field.
- Consumes: existing `holdwiseBoot` WKScriptMessage handler.

- [ ] **Step 1: Write failing JavaScript diagnostics tests**

Add tests proving a window error with a missing `event.error` still preserves message/source/line/column, and an unhandled rejection preserves its stack:

```js
assert.deepEqual(messages[0], {
  type: 'error', name: 'Error', message: 'Script error.',
  source: 'file:///app/www/index.html', line: 47, column: 19, stack: '',
});
assert.equal(messages[1].stack.includes('startup boom'), true);
```

- [ ] **Step 2: Write failing Swift source-contract tests**

Require `source`, `line`, `column`, and `stack` keys and require the error marker to include them. Require the controller to reject a late error after a ready message during the verification window.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
node --test tests/native-boot.test.mjs tests/stormandme-native-contract.test.mjs
```

Expected: FAIL because the current reporter and Swift bridge only preserve name/message.

- [ ] **Step 4: Implement diagnostics without changing compatibility behavior**

Export `normalizeBootError`; pass `event.filename`, `event.lineno`, and `event.colno`; capture string stacks safely; write every field into the native marker in a stable multiline format. Keep all bridge calls inside `try/catch`.

- [ ] **Step 5: Add an exact-entry inspection script**

`scripts/inspect-native-entry.mjs` must accept a `www` directory, locate the inlined module, verify it contains no external primary entry script, print its source-map reference, and exit nonzero when the primary module is missing or malformed. Add `native:inspect` to `package.json`.

- [ ] **Step 6: Verify GREEN and commit diagnostics**

Run:

```bash
node --test tests/native-boot.test.mjs tests/stormandme-native-contract.test.mjs
npm run build:native
bash native/ios/HoldWiseAI/Scripts/prepare_web.sh
npm run native:inspect -- native/ios/HoldWiseAI/Resources/www
```

Commit:

```bash
git add src/lib/nativeBoot.js native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift tests/native-boot.test.mjs tests/stormandme-native-contract.test.mjs scripts/inspect-native-entry.mjs package.json
git commit -m "test: expose native startup diagnostics"
```

- [ ] **Step 7: Run one diagnostic native/Appetize build and record the root cause**

Build the same universal simulator `.app`, launch on the oldest available CI runtime, then upload the diagnostic ZIP to Appetize iOS 16.2. Save the complete marker and console evidence to `docs/research/2026-08-16-appetize-ios16-startup-root-cause.md`. Do not begin Task 2 until the failing source/feature is identified.

---

### Task 2: Repair and lock native web compatibility

**Files:**
- Create: `src/lib/cloneValue.js`
- Create: `tests/clone-value.test.mjs`
- Modify: `vite.config.js`
- Modify: `scripts/inline-native-web.mjs`
- Modify: `scripts/verify-native-web.mjs`
- Modify: `tests/native-web-packaging.test.mjs`
- Modify: every `src/games/engines/*.js` and game-table component currently calling `structuredClone` directly
- Modify: dependency/source file identified in Task 1 evidence

**Interfaces:**
- Produces: `cloneValue(value, scope = globalThis)` with native structured clone first and a JSON-safe fallback for HoldWise plain game state.
- Produces: native build target `safari15.4` with an explicit supported-runtime contract.
- Consumes: root-cause evidence from Task 1.

- [ ] **Step 1: Write failing compatibility tests**

Test that `cloneValue` deeply clones HoldWise plain state when `scope.structuredClone` is absent and that mutation of the clone cannot mutate the input. Add a packaging test that requires `vite.config.js` to declare `safari15.4` and requires the inlined native entry to pass the exact root-cause assertion discovered in Task 1.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test tests/clone-value.test.mjs tests/native-web-packaging.test.mjs
```

Expected: FAIL because `cloneValue` and the explicit Safari target do not exist.

- [ ] **Step 3: Implement minimal compatibility repair**

Implement:

```js
export function cloneValue(value, scope = globalThis) {
  if (typeof scope?.structuredClone === 'function') return scope.structuredClone(value);
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
```

Replace direct production `structuredClone` calls with `cloneValue`. Set `build.target` to `safari15.4`. Apply only the additional syntax/API repair supported by the Task 1 marker; document it beside the regression assertion.

- [ ] **Step 4: Verify exact inlined package compatibility**

Run:

```bash
node --test tests/clone-value.test.mjs tests/native-web-packaging.test.mjs
npm run build:native
bash native/ios/HoldWiseAI/Scripts/prepare_web.sh
node scripts/verify-native-web.mjs native/ios/HoldWiseAI/Resources/www
```

Expected: PASS with no external primary entry and no forbidden root-cause construct.

- [ ] **Step 5: Run all engine tests and commit**

Run `npm test`, then commit:

```bash
git add src/lib/cloneValue.js src/games src/components/games vite.config.js scripts tests
git commit -m "fix: support the Appetize iOS 16 runtime"
```

---

### Task 3: Replace the dark system with the light premium visual foundation

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/premium/CinematicBackdrop.jsx`
- Modify: `src/components/premium/GlassSurface.jsx`
- Modify: `src/pages/CardAcademyLobby.jsx`
- Modify: `src/components/games/GameFamilyTile.jsx`
- Modify: `src/components/games/GameShell.jsx`
- Modify: `native/ios/HoldWiseAI/Sources/StormAndMeBootView.swift`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`
- Create: `tests/light-premium-visual.test.mjs`

**Interfaces:**
- Produces: CSS tokens `--hw-pearl`, `--hw-sky`, `--hw-aqua`, `--hw-mint`, `--hw-lavender`, `--hw-coral`, `--hw-royal`, `--hw-sunshine`, and `--hw-ink`.
- Produces: family classes `.hw-family-poker`, `.hw-family-casino`, `.hw-family-solitaire`, `.hw-family-classics`, `.hw-family-family`.
- Consumes: existing GlassSurface, ScreenReveal, and game catalog contracts.

- [ ] **Step 1: Write the failing light-palette contract**

Require every new token and family class. Reject `settings.theme: "dark"` as the default, reject `text-white` in the lobby and game shell, and assert the native web view/boot backgrounds use light RGB values. Require the hero, progress cards, family tiles, and mini cards to use white/light surfaces plus deep-navy text.

- [ ] **Step 2: Verify RED**

Run `node --test tests/light-premium-visual.test.mjs`; expected FAIL on missing tokens and current dark defaults.

- [ ] **Step 3: Implement the shared light foundation**

Set the app canvas to a pearl-to-sky gradient; rebuild Glass 1–5 as translucent white layers with colored edges; convert shadows from black-heavy depth to soft navy/blue depth; preserve contrast fallbacks and Reduced Motion.

- [ ] **Step 4: Recompose the lobby**

Use a royal-to-aqua Continue Learning hero, three distinct progress cards, five colorful family tiles, and white mini-game cards. Use deep navy for headings/body, royal blue for Play, lavender/aqua for Learn, mint for progress, and sunshine only for rewards.

- [ ] **Step 5: Apply family-aware game shells**

Map Poker to emerald/cyan, Casino to aqua/royal, Solitaire to periwinkle/lavender, Classics to violet/sunshine, and Family to coral/mint/aqua. Keep playing cards white and controls readable.

- [ ] **Step 6: Make native boot light and verify**

Change the native background and Storm And Me boot view to pearl/sky with the existing company-first branding. Run:

```bash
node --test tests/light-premium-visual.test.mjs tests/premium-visual.test.mjs tests/card-academy-visual.test.mjs
npm run build
```

- [ ] **Step 7: Commit the visual foundation**

```bash
git add src/index.css src/components src/pages/CardAcademyLobby.jsx native/ios/HoldWiseAI/Sources tests/light-premium-visual.test.mjs
git commit -m "feat: brighten HoldWise with premium family colors"
```

---

### Task 4: Add persisted sound settings and the isolated sound service

**Files:**
- Create: `src/lib/soundEffects.js`
- Create: `src/lib/feedback.js`
- Create: `tests/sound-effects.test.mjs`
- Create: `tests/app-context-settings.test.mjs`
- Modify: `src/lib/appContext.jsx`
- Create: `public/audio/manifest.json`
- Add: `public/audio/ui-tap.m4a`
- Add: `public/audio/primary.m4a`
- Add: `public/audio/deal.m4a`
- Add: `public/audio/flip.m4a`
- Add: `public/audio/select.m4a`
- Add: `public/audio/correct.m4a`
- Add: `public/audio/warning.m4a`
- Add: `public/audio/win.m4a`
- Add: `public/audio/achievement.m4a`
- Create: `scripts/verify-audio-assets.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `createSoundEffects({ AudioCtor, now })` with `preload()`, `play(name, options)`, and `stopAll()`.
- Produces: `emitFeedback(type, settings, options)` coordinating sound and haptics.
- Consumes: persisted `settings.soundEnabled`, `settings.musicEnabled`, and `accessibility.haptics`.

- [ ] **Step 1: Write failing sound-service tests**

Test valid cue lookup, disabled no-op, playback failure no-op, 60 ms repeat rate limit, volume clamping, and correct cue mapping for `tap`, `primary`, `deal`, `flip`, `select`, `correct`, `warning`, `win`, and `achievement`.

- [ ] **Step 2: Write failing settings migration tests**

Require old persisted state without sound keys to migrate to `soundEnabled: true`, `musicEnabled: false`, while preserving existing user values.

- [ ] **Step 3: Verify RED**

Run `node --test tests/sound-effects.test.mjs tests/app-context-settings.test.mjs`; expected FAIL because the service and settings do not exist.

- [ ] **Step 4: Add verified local audio assets**

Create short original/licensed M4A cues, list filenames and SHA-256 digests in `manifest.json`, and make `verify-audio-assets.mjs` reject missing, empty, unlisted, or hash-mismatched assets. Add `verify:audio` to `package.json`.

- [ ] **Step 5: Implement sound and settings**

Use dependency-injected `AudioCtor` for tests, catch preload/play promise rejection, reuse one audio instance per cue, and rate-limit repeated cues. Persist separate Sound/Music/Haptics values without changing unrelated profile state.

- [ ] **Step 6: Verify and commit**

Run:

```bash
node --test tests/sound-effects.test.mjs tests/app-context-settings.test.mjs
npm run verify:audio
npm test
```

Commit `src/lib`, context, tests, manifest, scripts, and audio assets with `feat: add HoldWise sound feedback system`.

---

### Task 5: Complete semantic haptics and wire feedback through gameplay

**Files:**
- Modify: `src/lib/haptics.js`
- Modify: `src/lib/feedback.js`
- Modify: `src/components/premium/TactilePressable.jsx`
- Modify: `src/components/games/*.jsx`
- Modify: `src/pages/GameTutorial.jsx`
- Modify: `native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift`
- Modify: `tests/haptics.test.mjs`
- Create: `tests/feedback-wiring.test.mjs`

**Interfaces:**
- Produces semantic types `selection`, `success`, `warning`, `impactLight`, and `impactMedium`.
- Consumes `emitFeedback(type, settings)` from Task 4.

- [ ] **Step 1: Write failing semantic bridge tests**

Require all five types, native-first behavior, disabled no-op, browser fallback, and exact Swift mappings to `UISelectionFeedbackGenerator`, `UINotificationFeedbackGenerator`, and light/medium `UIImpactFeedbackGenerator`.

- [ ] **Step 2: Write failing gameplay wiring tests**

Require tactile buttons to emit `tap`/`impactLight`; card selection to emit `select`/`selection`; deal/draw to emit `deal`/`impactMedium`; correct, warning, win, and achievement events to use matching semantic feedback.

- [ ] **Step 3: Verify RED**

Run `node --test tests/haptics.test.mjs tests/feedback-wiring.test.mjs`; expected FAIL on missing impact types and sound coordination.

- [ ] **Step 4: Implement the native and JavaScript mappings**

Keep one public `emitFeedback` entry point, map each semantic event once, and prevent feedback when disabled. Do not fire haptics from passive animations.

- [ ] **Step 5: Wire representative event sources, then all families**

Start with TactilePressable, Blackjack, and the tutorial graduation path; run focused tests; then apply the same semantic contract to Poker, Solitaire, Classics, and Family tables.

- [ ] **Step 6: Verify and commit**

Run `node --test tests/haptics.test.mjs tests/feedback-wiring.test.mjs` and `npm test`, then commit with `feat: wire semantic sound and haptic feedback`.

---

### Task 6: Add visible settings controls and accessibility behavior

**Files:**
- Create: `src/components/FeedbackSettings.jsx`
- Modify: `src/pages/CardAcademyLobby.jsx`
- Create: `tests/feedback-settings-ui.test.mjs`

**Interfaces:**
- Consumes: `settings`, `setSettings`, `accessibility`, and `setAccessibility` from AppContext.
- Produces: three 44-point toggles labeled Sound, Music, and Haptics.

- [ ] **Step 1: Write failing UI contract tests**

Require all three labels, 44-point targets, independent setters, `aria-pressed`, and visible On/Off state. Require Music to display “Coming with original soundtrack” while remaining off by default.

- [ ] **Step 2: Verify RED**

Run `node --test tests/feedback-settings-ui.test.mjs`; expected FAIL because the component does not exist.

- [ ] **Step 3: Implement the bright settings sheet**

Add a small gear action in the lobby header that opens a white/light-glass sheet. Preserve keyboard, screen-reader, Reduced Motion, and high-contrast behavior.

- [ ] **Step 4: Verify and commit**

Run the focused test plus `npm run lint` and `npm run typecheck`; commit with `feat: add sound music and haptic controls`.

---

### Task 7: Build the corrected v6 release and enforce the real gates

**Files:**
- Create: `.github/workflows/card-academy-ios-release-v6.yml`
- Create: `tests/release-v6-contract.test.mjs`
- Modify: `scripts/release-card-academy-browser-check.mjs`
- Modify: `scripts/verify-one-click-release.mjs`
- Create: `.release/ios-v6-trigger.txt`
- Create after run: `docs/research/2026-08-16-holdwise-v6-runtime-quadcheck.md`

**Interfaces:**
- Produces: `HoldWise-AI-Card-Academy-Appetize-v2.1.0.zip` containing one universal `.app`.
- Consumes: all test, build, audio, haptic, compatibility, and visual gates from Tasks 1–6.

- [ ] **Step 1: Write the failing workflow contract**

Require the v6 workflow to run complete QA, audio verification, 21 games/tutorials, explicit oldest-available runtime selection, error-marker checks before and after ready, representative family screenshots, exact ZIP integrity, and separate proof artifact upload.

- [ ] **Step 2: Verify RED**

Run `node --test tests/release-v6-contract.test.mjs`; expected FAIL because v6 does not exist.

- [ ] **Step 3: Implement the v6 workflow**

Build native with the explicit Safari target, select the oldest installed iOS simulator instead of the newest preferred device, fail immediately on any error marker, wait five seconds after ready and check again, capture intro/lobby/five-family screenshots, and package the exact universal app.

- [ ] **Step 4: Run the complete local gate**

Run:

```bash
npm run qa
npm run verify:audio
npm run audit:gameplay
node --test tests/release-v6-contract.test.mjs
```

- [ ] **Step 5: Commit and push v6**

Commit with `release: build light premium Appetize v6`, push `card-academy-full-v1`, and monitor every workflow to completion.

- [ ] **Step 6: Verify Appetize iOS 16.2 manually**

Upload the exact inner ZIP, confirm the Storm And Me intro reaches the bright lobby, open one game from every family, enable sound, confirm cue playback, and record native haptic proof from the simulator/native logs. Save screenshots and results in the v6 quadcheck document.

- [ ] **Step 7: User visual acceptance**

Provide the exact ZIP and Appetize link to the user. The release remains “preview candidate” until the user approves the colors, lobby, gameplay, sound, and feedback.

---

## Final Verification

Run the complete suite from a clean checkout:

```bash
npm install --no-audit --no-fund
npm run qa
npm run verify:audio
npm run audit:gameplay
bash native/ios/HoldWiseAI/Scripts/prepare_web.sh
node scripts/verify-native-web.mjs native/ios/HoldWiseAI/Resources/www
```

The handoff must include:

- successful v6 workflow URL;
- exact ZIP SHA-256 and byte size;
- iOS runtime used in CI;
- Appetize iOS 16.2 screenshot of the bright lobby;
- representative screenshots for all five families;
- sound manifest proof;
- native haptic message proof;
- confirmation that all 21 games and 21 tutorials passed.

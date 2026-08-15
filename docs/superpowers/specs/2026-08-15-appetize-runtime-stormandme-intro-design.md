# HoldWise AI Appetize Runtime + StormAndMe Intro Design

Date: 2026-08-15
Branch: `appetize-preview`
Scope: Appetize/iOS preview lane only unless explicitly promoted later. Production `main` remains untouched.

## Goal

Make the iOS Simulator package visibly boot into the HoldWise AI video-poker trainer instead of a blank WKWebView, add a premium Storm And Me launch identity, and make future blank-screen failures self-diagnosing instead of silent.

## Current evidence

- The simulator app itself launches successfully in Appetize.
- The packaged `www/index.html` exists and the native controller finds it; otherwise the existing native missing-bundle page would appear.
- The current native web build already uses Vite `base: './'` through `VITE_NATIVE_IOS=true`.
- The preview already uses `HashRouter`, so neither an absolute Vite base nor `BrowserRouter` is the current root cause.
- The packaged HTML still boots through external local subresources (`./assets/index-*.js` as `type="module"` and `./assets/index-*.css`) under `file://`.
- WebKit has long-standing local-file origin/subresource restrictions. A blank root with a loaded shell is consistent with a startup script/subresource failure, but the current native shell does not surface JavaScript errors.
- Startup code also performs history mutation and Base44 initialization, so the exact failing boundary must be measured before applying a runtime fix.

## Approaches considered

### A. Harden the existing `file://` preview lane — recommended

Keep the current lightweight native wrapper. First add deterministic boot diagnostics and reproduce the current failure in an iOS Simulator. Then make the smallest correction supported by that evidence. If the failing boundary is local external module loading, inline the critical first-paint CSS/JavaScript into the native preview HTML so React does not depend on that boundary for first paint.

Pros:
- Smallest change to the preview branch.
- No new native dependency or local server.
- Lets us prove the root cause rather than stack guesses.
- Easy to verify in CI and easy to revert.

Trade-off:
- If first-paint inlining is required, the exact-strategy worker remains a separate resource. If WebKit blocks the worker, existing code already falls back to the synchronous strategy engine; the app remains playable.

### B. Serve bundle resources through `WKURLSchemeHandler`

Pros:
- Gives the local content an app-owned URL scheme.
- Apple documents custom scheme handlers for local web resources.

Trade-offs:
- Web workers cannot reliably load from custom schemes, and WebKit has had recent regressions around scripted pages on custom schemes.
- Adds more native surface area than the preview requires.

### C. Run a loopback HTTP server inside the app

Pros:
- Closest to normal browser HTTP semantics for modules, workers, storage, and routing.

Trade-offs:
- Highest complexity and maintenance cost.
- Unnecessary for a preview shell unless evidence proves the simpler lane cannot be made reliable.

Decision: use Approach A. Escalate to B or C only if the measured runtime failure cannot be corrected safely in the existing wrapper.

## Architecture

### 1. Native StormAndMe boot overlay

Add a reusable native launch overlay above the WKWebView.

Visual system:
- Midnight/obsidian background aligned with HoldWise premium styling.
- Original vector cloud outline; no stock art dependency.
- Lightning bolt drawn as a vector shape.
- Two brief lightning pulses with a restrained teal/gold afterglow.
- `STORM AND ME` wordmark centered beneath the mark.
- `HoldWise AI` product subtitle below the company wordmark.
- Total normal duration approximately 1.2–1.6 seconds, but the overlay remains until the web app reports a successful mount so a blank web view is never exposed.
- Respect Reduce Motion: use opacity-only transitions and skip pulse/scale motion.

Brand standard for future Storm And Me apps:
- Company mark always appears first.
- Product name is secondary.
- Intro is short, polished, and non-interactive.
- Reuse the same cloud/bolt geometry and wordmark spacing; product-specific accent glow may vary.

### 2. Explicit web boot handshake and diagnostics

Add a `holdwiseBoot` script-message channel between web content and native before changing the runtime-loading strategy.

Web states:
- `booting`: document loaded but React not yet confirmed.
- `ready`: React mounted and first UI frame is scheduled.
- `error`: uncaught startup exception or unhandled promise rejection.

Native behavior:
- Show StormAndMe overlay immediately.
- Load the bundled app.
- Hide the overlay only after `ready`.
- Log a stable marker `HOLDWISE_BOOT_READY` for CI/runtime inspection.
- Log navigation failures and web-content process termination.
- On timeout or `error`, replace the silent blank screen with a branded diagnostic panel containing a short user-safe message plus debug details in DEBUG builds.

At document start, inject lightweight listeners for:
- `window.error`
- `unhandledrejection`

Send only sanitized error name/message to native. Do not include personal data, tokens, hand history, or account details.

### 3. Evidence-driven runtime correction

The first simulator run after diagnostics are added uses the current loading model unchanged. The captured failure determines the single correction:

- If the primary external `index-*.js`/CSS local subresource load fails, transform only the native preview copy so the primary CSS and primary app JavaScript are inline in `index.html`.
- If URL cleanup/history mutation fails, change native/file-mode app-parameter cleanup so it only rewrites the URL when a removable query parameter is actually present.
- If Base44 initialization is the failing boundary, isolate guest preview boot from that initialization while preserving normal web behavior.
- If none of those are the cause, use the captured error to make one targeted correction and rerun the same smoke test before continuing.

No multi-fix bundle is applied before the failure is measured.

If first-paint inlining is the proven correction, the native preview packaging also:
- preserves lazy chunks and the strategy worker files for on-demand use;
- removes the Base44 external favicon from the native copy;
- removes the root `/manifest.json` reference from the native copy because the preview does not need a PWA manifest;
- fails CI if the native HTML still references the primary external `index-*.js` or `index-*.css` boot files.

The normal web build remains unchanged.

## CI verification

The preview workflow verifies all layers:

1. Existing course-data SHA checks remain.
2. Existing premium/gameplay tests remain.
3. Existing exhaustive 2,598,960-hand gameplay audit remains.
4. Native packaging checks verify `www/index.html` and the strategy worker exist.
5. iOS Simulator build remains unsigned and includes arm64.
6. Add an iOS Simulator runtime smoke check when the GitHub macOS runner provides a compatible simulator runtime:
   - boot simulator;
   - install app;
   - launch app;
   - capture the `holdwiseBoot` error/ready markers;
   - on the diagnostic run, retain the evidence that identifies the current failure;
   - after the targeted correction, require `HOLDWISE_BOOT_READY` before packaging succeeds.
7. If first-paint inlining is the measured correction, add packaging checks proving the boot JS/CSS are inline and the root manifest dependency is absent.

The final Appetize ZIP is uploaded only after the corrected runtime smoke check passes.

## Error handling

- Missing bundle: keep the current native missing-bundle page, branded consistently.
- JavaScript startup error: branded diagnostic panel rather than blank screen.
- Boot timeout: branded diagnostic panel with retry action.
- Strategy worker unavailable: existing synchronous fallback remains; gameplay continues.
- Base44/auth unavailable: guest/local trainer remains usable.

## Testing

Tests are added before the corresponding implementation change:
- Boot-handshake test: `ready` is emitted only after mount and errors serialize safely.
- Native runtime smoke test: current build reproduces/captures the failure before the correction and emits `HOLDWISE_BOOT_READY` after it.
- If URL cleanup is implicated: a clean file URL causes no history mutation while normal web query cleanup still works.
- If first-paint inlining is implicated: transformed HTML contains inline boot JS/CSS and no primary external boot references.
- Existing premium/gameplay tests continue passing.

## Non-goals

- No changes to production `main` in this pass.
- No redesign of HoldWise gameplay.
- No replacement of the exact-strategy engine.
- No full navigation/admin/settings reconstruction in the Appetize preview.
- No third-party splash/animation dependency.

## Success criteria

- Appetize opens to the StormAndMe cloud/lightning intro, then the visible HoldWise AI trainer.
- No blank screen is exposed during boot.
- The intro is clearly company-first (`STORM AND ME`) with `HoldWise AI` secondary.
- A startup failure produces an actionable diagnostic screen instead of silence.
- CI proves the packaged app can boot the intended web runtime before publishing the ZIP.
- Production `main` remains unchanged.

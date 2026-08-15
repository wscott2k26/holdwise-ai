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
- Startup code also performs history mutation and Base44 initialization, so runtime diagnostics must identify the exact failing boundary before any broad refactor.

## Approaches considered

### A. Harden the existing `file://` preview lane — recommended

Keep the current lightweight native wrapper. Add deterministic boot diagnostics, remove avoidable local-file startup hazards, and inline the critical boot CSS/JavaScript into the native preview HTML so React does not depend on external local module loading for first paint.

Pros:
- Smallest change to the preview branch.
- No new native dependency or local server.
- Avoids the most fragile `file://` external module boundary for initial render.
- Easy to verify in CI and easy to revert.

Trade-off:
- The exact-strategy worker remains a separate resource. If WebKit blocks the worker, existing code already falls back to the synchronous strategy engine; the app remains playable.

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
- Unnecessary for a preview shell whose primary goal is to demonstrate the trainer quickly.

Decision: implement Approach A now. Keep B/C out of scope unless diagnostics prove A cannot provide a reliable runtime.

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
- Total normal duration approximately 1.2–1.6 seconds, but the overlay will remain until the web app reports a successful mount so a blank web view is never exposed.
- Respect Reduce Motion: use opacity-only transitions and skip pulse/scale motion.

Brand standard for future Storm And Me apps:
- Company mark always appears first.
- Product name is secondary.
- Intro is short, polished, and non-interactive.
- The same cloud/bolt geometry and wordmark spacing should be reused; product-specific accent glow may vary.

### 2. Explicit web boot handshake

Add a `holdwiseBoot` script-message channel between React and native.

Web states:
- `booting`: document loaded but React not yet confirmed.
- `ready`: React mounted and first UI frame is scheduled.
- `error`: uncaught startup exception or unhandled promise rejection.

Native behavior:
- Show StormAndMe overlay immediately.
- Load the bundled app.
- Hide the overlay only after `ready`.
- Log a stable marker such as `HOLDWISE_BOOT_READY` for CI/runtime inspection.
- On timeout or `error`, replace the silent blank screen with a branded diagnostic panel containing a short user-safe message plus debug details in DEBUG builds.

### 3. Harden native preview HTML

During `prepare_web.sh`, create the preview copy of the web bundle and transform its first-paint dependencies:
- Inline the generated primary CSS into `index.html`.
- Inline the generated primary app JavaScript into `index.html` instead of relying on an external local module script for boot.
- Preserve lazy chunks and the strategy worker files for on-demand use.
- Remove the Base44 external favicon from the native copy.
- Remove/relativize the root `/manifest.json` reference from the native copy because the preview does not need a PWA manifest.
- Add a deterministic packaging verifier that fails CI if the native HTML still references the primary external `index-*.js` or `index-*.css` boot files.

The normal web build remains unchanged; this transformation is native-preview packaging only.

### 4. Guard file-scheme URL mutation

In native/file mode, app parameter cleanup must not rewrite the current URL unless a removable query parameter is actually present. This prevents unnecessary `history.replaceState` work during `file://` startup while preserving current web behavior.

### 5. Runtime failure visibility

At document start, inject lightweight listeners for:
- `window.error`
- `unhandledrejection`

Send sanitized error name/message to native through `holdwiseBoot`. No personal data, tokens, hand history, or account details are included.

Navigation failures and web-content process termination are also logged natively.

## CI verification

The preview workflow will verify all layers:

1. Existing course-data SHA checks remain.
2. Existing premium/gameplay tests remain.
3. Existing exhaustive 2,598,960-hand gameplay audit remains.
4. Native packaging checks verify:
   - `www/index.html` exists.
   - primary boot CSS is inline.
   - primary boot JavaScript is inline.
   - no root `/manifest.json` dependency remains.
   - strategy worker asset still exists.
5. iOS Simulator build remains unsigned and includes arm64.
6. Add a simulator runtime smoke check when the GitHub macOS runner provides a compatible simulator runtime:
   - boot simulator;
   - install app;
   - launch app;
   - wait for `HOLDWISE_BOOT_READY`;
   - fail the runtime verification if a compatible simulator was available but the ready marker never appears.

The final Appetize ZIP is uploaded only after verification passes.

## Error handling

- Missing bundle: keep the current native missing-bundle page, but brand it consistently.
- JavaScript startup error: branded diagnostic panel rather than blank screen.
- Boot timeout: branded diagnostic panel with retry action.
- Strategy worker unavailable: existing synchronous fallback remains; gameplay continues.
- Base44/auth unavailable: guest/local trainer remains usable.

## Testing

Add focused tests before implementation:
- Native packaging test: transformed HTML contains inline boot JS/CSS and no primary external boot references.
- Web test: boot message helper emits `ready` only after mount and serializes errors safely.
- URL cleanup test: no history mutation occurs for a clean file URL; normal web query cleanup still works.
- Existing premium/gameplay tests must continue passing.
- Simulator ready-marker smoke check validates the actual native/web integration, not only ZIP contents.

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
- CI proves the packaged app contains and can boot the intended web runtime before publishing the ZIP.
- Production `main` remains unchanged.

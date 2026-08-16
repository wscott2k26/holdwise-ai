# Appetize iOS 16 startup root-cause capture

## Status

No device evidence was collected in this workspace. This is a diagnostic candidate only; it is not ready for release or validation until the exact ZIP opens on Appetize iOS 16.2. The root cause is not identified.

## Available package evidence

- The native build completed locally through `npm run build:native`.
- `bash native/ios/HoldWiseAI/Scripts/prepare_web.sh` produced an inline first-paint entry and passed `scripts/verify-native-web.mjs`.
- `scripts/inspect-native-entry.mjs` reported `index-BcIxXi6A.js.map` for the inline module source map.

## Missing required evidence

- Universal simulator `.app` built with Xcode.
- Launch on the oldest available CI runtime.
- `holdwise-boot-ready` or `holdwise-boot-error.txt` marker contents.
- Native console output including `HOLDWISE_BOOT_READY`, `HOLDWISE_BOOT_ERROR`, or `HOLDWISE_BOOT_LATE_ERROR`.
- Appetize iOS 16.2 upload and reproduction result.

## Blocker

`xcodebuild` is not installed in this Linux workspace. There is also no available authenticated Appetize upload path. Do not infer a failing source/API from the absence of this evidence, and do not begin the compatibility repair task until a macOS/Appetize run captures the marker and console output.

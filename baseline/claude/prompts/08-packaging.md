# M8 — Packaging, signing, updates
electron-builder config: hardened runtime, entitlements (microphone; Apple Events only if needed), Developer ID signing, notarization,
`electron-updater` with signed updates, crash reporting opt-in. CI on macOS runner: test, build, screens, sign (secrets), notarize.
Document entitlements and the privacy manifest strings (NSMicrophoneUsageDescription).

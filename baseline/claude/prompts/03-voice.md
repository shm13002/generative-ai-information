# M3 — Voice
Replace Web Speech with: on-device wake word (macOS SFSpeechRecognizer helper in Swift, or a local model) + streaming STT, and TTS for `say`.
Barge-in: user speech stops TTS within 150 ms. Meter driven by real mic RMS (AnalyserNode). Privacy indicator: orb shows a distinct
listening state and the menu bar mic indicator is respected. Add `permission{capability:'microphone'}` onboarding when denied.

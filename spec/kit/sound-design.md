# Sound design proposal (ORIGINAL — not from Agently)

Confirmed: the Agently v0.1.38 app bundle contains **no audio files** and the overlay code makes no sound calls.
The promo videos carry a soundtrack plus a spoken user/Jarvis dialogue (TTS-like voice), mixed at about −16 dB mean / −1 dB peak.
Everything in `sounds/` is synthesized from sine partials by us (48 kHz mono 16-bit), free to use, placeholder quality.

| File | Event (stage/voice state) | Length | Design |
|---|---|---|---|
| wake-chime.wav | wake word heard → `starting` | ~250 ms | A5 → E6 rising fifth, soft attack |
| listen-start.wav | `listening` begins (push-to-talk) | ~120 ms | single soft E5 |
| ready-tick.wav | card status → `ready` | ~60 ms | short C7 tick |
| needs-you.wav | card status → `needs-you` (approval) | ~200 ms | two G6 ticks, 50 ms gap |
| receipt-sent.wav | receipt chip appears (done) | ~250 ms | D6 → A6 up-step |
| error.wav | failed receipt / `error` | ~260 ms | A4 → F4 down-step |

Rules (proposal): never play during Jarvis TTS speech (duck or skip); max one cue per 400 ms; respect system mute and a user “sounds off” toggle; keep cues < −18 LUFS relative to speech.

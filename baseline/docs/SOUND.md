# Brim sound design (original)
All cues are synthesized from scratch in `sounds-src/synth.py`. They use sine/bell partials, filtered-noise whooshes, ADSR-style envelopes, a stereo convolution reverb (a synthetic exponential-decay noise impulse response), and true-peak headroom. They're integrated-loudness normalized with pyloudnorm (ITU-R BS.1770) to ≈ -18 LUFS. Ticks, reshape and dismiss are set quieter on purpose (-20 to -24 LUFS).
Formats: 48 kHz 16-bit stereo WAV plus OGG Vorbis (q4). Playback goes through one WebAudio gain node, with volume, mute and an anti-repeat rule (90 ms per cue).

| Cue | ms (incl. reverb tail) | LUFS | Peak dBFS |
|---|---|---|---|
| wake | 1622 | -17.9 | -7.5 |
| listen-on | 1035 | -18.0 | -6.9 |
| listen-off | 991 | -18.0 | -6.4 |
| tick | 892 | -24.5 | -2.2 |
| appear | 1218 | -18.0 | -5.2 |
| reshape | 976 | -21.0 | -3.9 |
| ready | 1268 | -20.0 | -10.9 |
| needs-you | 1308 | -18.0 | -10.4 |
| approve | 1081 | -18.0 | -5.8 |
| sent | 1594 | -18.0 | -8.9 |
| dismiss | 991 | -22.0 | -6.1 |
| error | 1155 | -18.0 | -9.9 |
| undo | 1023 | -18.0 | -7.5 |

| Cue | Trigger |
|---|---|
| wake | wake word / hotkey |
| listen-on | mic opens |
| listen-off | end of speech |
| tick | step change (quiet) |
| appear | card arrives |
| reshape | card changes layout |
| ready | card ready |
| needs-you | alert / approval needed |
| approve | user approves |
| sent | receipt (success) |
| dismiss | card dismissed |
| error | failure |
| undo | undo succeeded |

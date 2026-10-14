# Storyboard template (promo video, 1920×1248 @ 60 fps observed in Oct videos)

One row per beat. Times in seconds. Motion names refer to kit/motion-presets.css.

| # | t-in | t-out | Voice line (user / Jarvis) | Island state | Card event | Block(s) | Motion | Sound cue | Caption |
|---|------|-------|---------------------------|--------------|-----------|----------|--------|-----------|---------|
| 1 | 0.0 | 1.2 | U: "Hey Jarvis, what needs me?" | idle → listening (meter) | – | – | – | wake-chime | live user caption |
| 2 | 1.2 | 2.0 | – | thinking (orb) | arrive: empty shape grows, skeleton | todo skeleton | m-arrive (spring 120/17, 700 ms) | – | step text |
| 3 | 2.0 | 4.0 | J: "Four things." | speaking | content fades in, rows stagger 60 ms | todo | m-fade 240 ms, phrase 150 ms | ready-tick | Jarvis caption |
| 4 | … | … | U: "Send it." | listening | approval → needs-you | approval | m-morph (210/26, 560 ms) | needs-you | – |
| 5 | … | … | J: "Sent." | ready | collapse → receipt chip 3.2 s | – | m-ghost 160 ms | receipt-sent | receipt ≤80 chars |

Checklist: one idea per beat · text only fades, shapes move · max 12 blocks · receipt ≤80 chars · say ≤400 chars · hold ready cards 8 s unless dismissed · label any sped-up footage.

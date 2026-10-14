# M2 — Latency & streaming
Target: skeleton < 150 ms after end-of-speech (local guesser), first real block < 1.5 s p50. Add timing marks (end-of-speech, first card,
first block, ready) to history entries and a debug overlay (`?debug`). Coalesce patches to ≤ 1 per 120 ms per card. If no block arrives in
8 s, show a `progress` block; at 30 s show an `error{kind:'timeout', retry:true}`. Tests for coalescing and timeouts with fake timers.

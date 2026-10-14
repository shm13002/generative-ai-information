# Gap analysis — what the Jarvis concept (as shown publicly) lacks, and what you need to ship your own

Basis: the public promo videos, the v0.1.38 app bundle and the docs we read. "Not seen" means we did not see it in the videos or the bundle code we read. It does not prove the feature is absent.
Status in baseline: ✅ done in baseline · 🟡 partial/stub · ⬜ not started.

## Must-have before shipping (P0)
| # | Gap | Why it matters | Baseline |
|---|---|---|---|
| 1 | **Prompt injection from emails/docs/web** | Agent reads untrusted mail and can send mail — classic exfiltration path | 🟡 `quarantine()`, `flagInjection()`, taint → always ask, `source` block with trust labels |
| 2 | **Action safety: granular approvals + undo** | "Always allow" per action kind is coarse; sends are irreversible | ✅ once / this recipient / this kind / edit / deny; undo window on sends; high-risk always asks |
| 3 | **Error, offline, auth-expired, permission-denied states** | The demos show only happy paths | ✅ `error`, `offline`, `permission` blocks + error/offline orb states |
| 4 | **History / recall of dismissed cards** | Auto-dismiss (≈8 s) loses information; users need "what did it just do?" | ✅ store history + `history` block + recall (⌘Y); 🟡 persistence |
| 5 | **Schema versioning & validation of model output** | Model/server drift breaks clients silently | ✅ `v:1`, `rev`, v0→v1 migration, ajv validation in main, future versions rejected |
| 6 | **Latency handling** | Videos look instant; real voice→LLM→tools is seconds | ✅ instant local skeleton + step lines + streaming patches; ⬜ timeouts/budgets (M2) |
| 7 | **Accessibility** (VoiceOver, keyboard-only, contrast, reduced motion) | Legal (EAA/ADA) + usability; notch UI never takes focus | 🟡 aria roles/live regions, focus rings, reduced motion, high-contrast tokens; ⬜ full keyboard path, axe tests |
| 8 | **Code signing, notarization, hardened runtime, entitlements** | Unsigned overlay + mic access won't run for users | ⬜ (M8) — document NSMicrophoneUsageDescription, Developer ID |
| 9 | **Privacy & data handling** (what is recorded, retained, sent to which subprocessor) | Mic + mail + calendar = sensitive; SOC 2 / DPA asks from B2B buyers | ⬜ privacy policy, retention settings, data map; baseline keeps data local |
| 10 | **Legal: original brand/trade dress, licenses** | Copying name, orb, palette, copy or code invites claims; RareUI = Commons Clause + attribution; boring.notch = GPL-3.0 | ✅ original name placeholder, palette, sounds; REPOS.md flags licenses |

## Should-have (P1)
- Onboarding: permission walk-through (mic, accessibility, calendar), first-run demo, wake-word training — 🟡 `permission` block
- Non-notched Macs, external displays, multi-monitor, display hot-plug — ✅ floating pill mode + `homeDisplay()`; ⬜ settings UI
- Interruptions & notification fatigue: quiet hours, Focus-mode awareness, batching alerts, priority threshold — ⬜
- Privacy indicators: explicit listening state (orb + caption) and visible "recording" while mic open — 🟡
- Barge-in / stop-speaking (⌘.) and a visible stop control — ⬜ (M3)
- Light mode — ✅ for floating pill (notch island intentionally stays black)
- Auto-update with signed updates, rollback — ⬜ (M8)
- Secrets in Keychain, token refresh, `error{kind:'auth'}` → Reconnect — 🟡 block exists
- Observability: per-request spans, cost per request, budgets, crash reports (opt-in) — ⬜ (M10)
- Streaming partial JSON robustness: coalescing, out-of-order patches (rev) — ✅ rev ordering; ⬜ coalescing

## Nice-to-have (P2)
- Multi-language STT/TTS, custom wake word, voice selection
- Shareable cards / export to doc
- Team/enterprise: admin policies for grants, audit log export, SSO
- Native SwiftUI shell (NSPanel) for lower memory than Electron
- Card theming per integration; widgets pinned to the notch

## Product/legal checklist
- Data processing: list subprocessors (LLM, STT, TTS, OAuth broker, hosting) and regions; DPA template; retention defaults.
- SOC 2 Type I → II roadmap if selling to companies; pen test before GA.
- Trademark search for the final name (Brim is a placeholder).
- Attribution page for open-source and RareUI (visible rareui.com link if used).
- Don't imitate the competitor's promo style closely (script, characters, captions) — write your own storyboards.

# Prompt for Claude: build a "Jarvis-style" generative-UI notch assistant

You are a senior macOS + web engineer. Build, step by step, a voice-first assistant that lives in the MacBook notch and answers every request with a *card* assembled from a fixed component kit (never generated code). Work in small, verified milestones; after each milestone run it and show me a screenshot or test output before continuing.

## 0. Ground rules
- Generative UI = the model emits **validated JSON** that selects from a fixed catalog of blocks. It never emits HTML/JS.
- Everything consequential (send, delete, archive, pay) requires an explicit approval card.
- Respect `prefers-reduced-motion`. Nothing starts hidden: if an animation fails, the end state must still show.

## 1. Repo layout (monorepo, pnpm)
```
apps/desktop   Electron shell (main, preload, island window, overlay HTML/CSS/JS)
apps/server    Node/TS API: agent runs, tools, SSE stream of cards
packages/shared  zod schemas: StageCard, Block types, StageAction
native/speech  Swift CLI: wake word "Hey, Jarvis" via SFSpeechRecognizer (on-device), JSON lines on stdout
```
(Alternative: replace Electron with a SwiftUI NSPanel notch shell, e.g. based on the patterns in TheBoredTeam/boring.notch, and render the same card kit in a WKWebView, or port blocks to SwiftUI views 1:1.)

## 2. Notch shell (Electron)
- Transparent, frameless, always-on-top, non-focusable BrowserWindow 640x600, top-centred on the notched display; `setVisibleOnAllWorkspaces`, `setIgnoreMouseEvents(true,{forward:true})` except over the island.
- Notch geometry: use a native probe (NSScreen.safeAreaInsets / auxiliaryTopLeftArea) if possible; else assume notch width 185 px on displays whose menu bar >= 30 px; on non-notched displays draw a 96 px pill 24-32 px tall in the menu bar centre.
- Island states: collapsed (black notch, 18 px orb in a 36 px "wing", optional live meter), bar (400 px wide: caption + controls), open (440 px wide, 16 px margin, scrollable panel of cards). Resize 220 ms; hover-in 160 ms, hover-out 320 ms.
- Window never takes focus; approvals are clicked, never keyboard-answered.
- Shortcuts: Cmd+Shift+Space start/stop voice; Option+Space toggle the panel.

## 2b. Notch details (from notch.js / island.js / orb.js, v0.1.38)
- Window never resizes (640x600); the visible island is a pure-black layer whose CSS `clip-path: inset(0 R B L round 0 0 r r)` is animated. Content is laid out at final width first and never moves; only the clip grows. Bottom corner radius: rest 12, bar 20, open 24.
- Rest width = notch width + 2 x 36 (wings). Orb (18 px canvas "glass pearl", cyan/blue/violet currents; grey when off/error) hugs the left; meter/dots/job-count hug the right.
- Easing: first arrival from the bare notch uses ARRIVE spring (700 ms); size class or width change uses MORPH spring (560 ms); height-only growth uses 220 ms OUT ease. Panel content fades 240 ms, 90 ms after the shape starts opening.
- Click-through everywhere except the shape (renderer reports pointer-inside → main toggles setIgnoreMouseEvents). Hover opens a peek after 160 ms, closes 320 ms after leaving; the card open when hovering stays open while hovered.
- Electron window: type 'panel', focusable:false, transparent, frameless, hasShadow:false, alwaysOnTop level 'status' (above menu bar), visibleOnAllWorkspaces incl. full-screen.
- The promo videos add effects NOT in the app code: liquid "droplets" that stretch out of the notch and become windows, glows and camera moves. Treat those as motion-design only (optional: SVG goo filter or SwiftUI metaball Canvas).
- SwiftUI alternative: borderless non-activating NSPanel at .statusBar+1 level, collectionBehavior [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary], notch rect from NSScreen.safeAreaInsets.top + auxiliaryTopLeftArea/RightArea; animate a custom NotchShape (bottom radii) with .spring(response:~0.45, dampingFraction:~0.8) (boring.notch pattern).

## 3. Design tokens (CSS custom properties)
```
--bg:#0e0e11; --panel:#0e0e11eb; --raised:#121215; --sur:#141418; --sur3:#222229; --notch:#000;
--tx:#f5f4f1; --tx2:#d0cec9; --tx3:#8d8b86; --tx4:#62605c; --inv:#f7f5f1; --on-inv:#111;
--fill:rgba(255,255,255,.05); --fill2:rgba(255,255,255,.09); --fill3:rgba(255,255,255,.14); --line:rgba(255,255,255,.07);
--ok:#8fbf9f; --fail:#d8886a; --ease:cubic-bezier(.4,0,.2,1);
--sans:-apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,sans-serif; --display:'SF Pro Display'; --mono:ui-monospace,'SF Mono','Geist Mono',monospace;
```
Type: body 13-14.5 px, labels 12 px/500, tags 11.5 px, weights 500/590/600, letter-spacing -0.2 px on titles, tabular-nums for figures.
Shapes: pill buttons 32 px tall radius 16 (primary = --inv bg, --on-inv text); mini/pill 26 px radius 13; tags 22 px radius 11; avatars 32 px circles; card section radii 10-16 px.

## 4. Stage contract (packages/shared, zod)
```ts
StageCard = { id: /^[A-Za-z0-9_-]{1,100}$/, utterance: string<=600,
  status: 'working'|'ready'|'needs-you'|'error', pinned?: boolean,
  step?: string<=120, say?: string<=400, receipt?: string<=80,
  screen?: { title?: string, blocks: Block[] /* max 12 */ } }   // whole card <= 64 KB
StageAction = {kind:'dismiss'} | {kind:'open', blockId?, itemId?}
  | {kind:'connect'|'send'|'approve'|'decline'|'ask', blockId}
  | {kind:'reply'|'done'|'primary', blockId, itemId}
```
Blocks (each has `id` and `type`):
- answer {text, detail?, sources?[<=4]}
- list {label?, columns[<=4], rows[<=6][], highlight?: rowIndex, action?: {label, ask}}  (2 columns => comparison layout)
- number {label, value, delta?, up?: boolean, series?: [{v}], source?}
- brief {title?, label?, bullets[], people?: [{name, role, note}], sources?}
- note {label?, text, missing?}
- todo {label?, total?, empty?, items[<=6]} — TWO shapes (the shipping kit switches on whether any item has a string `title`):
    a) Needs-you list: items [{id, title, detail?, action?}] → numbered rows with Done + optional primary button
    b) People rows: items [{id?, who, text, org?, source?, person?: bool, age?, unit?, state?: ''|done|failed, replyable?}] → avatar, Reply/Done
- agenda {label?, items[<=8]: [{id?, time, title, meta?, state?: done|next|conflict|moved|new}]}
- person {name, role?, org?, note?, facts?: [{l, v}]}
- created {kind, title, detail?, path?}
- progress {steps: [{text, state: 'done'|'active'|'pending'|'failed'}]}
- connect {provider, label?, state: idle|connecting|connected|error, error?}
- email {to, subject, body, state?, error?}
- approval {kind, title, detail?, state?, error?}
Render all text with textContent only. Reject unknown block types.

## 5. Skeleton guesser (instant form before data)
When a card is `working` and has no blocks yet, render a skeleton chosen from the utterance with keyword regexes, first match wins:
todo: waiting|owe|needs me|to-do|inbox|follow up; email: draft|write|reply|email|message; brief: prep|brief; person: who is|who's;
number: how much|how many|mrr|arr|revenue|churn|growth|conversion; list: list|which|overdue|invoices|deals|tickets|issues|compare;
agenda: today|my day|schedule|calendar|agenda|meeting|week|move|weekday names|tomorrow|book; else answer.
Skeleton shapes: number = 1 short line + 36 px block (44% wide) + line; todo/agenda/list = 4 rows of (32 px circle + 2 lines); email = 6 lines; answer = 3 lines. Lines 10 px high, radius 5, bg --fill.

## 6. Motion system (Web Animations API)
- Springs sampled into CSS `linear()`: ARRIVE = spring(stiffness 120, damping 17) over 700 ms; MORPH = spring(210, 26) over 560 ms.
- REVEAL 300 ms, STAGGER 60 ms, TAP 150 ms; EASE (.4,0,.2,1), OUT (.2,.7,.2,1), IN (.5,0,.75,0).
- Text never slides, only fades (opacity) where it lands.
- Per-part motions via `data-motion`: phrase (split text at punctuation or every 4 words, each phrase fades in 260 ms, 150 ms apart; if new text extends old text, keep the old prefix), count (numbers count from previous value over 750 ms, ease-out cubic), draw (row rule scaleX 0→1 380 ms, cells fade +120 ms; 110 ms per row), grow (scaleY 0→1 520 ms), pop (tags), slide.
- Reshape in place (FLIP): key every block by id and every part by `data-u`. On update: snapshot rects, re-render, then unchanged parts hold still, moved parts animate from their old rect with MORPH, new parts reveal in order with stagger, removed parts become absolutely-positioned "ghosts" that fade out in 160 ms.
- Status dot: working = 8 px spinner (0.9 s), needs-you = --inv dot, error = --fail dot, ready = hidden.
- Lifecycles: ready card holds 8 s then folds into the notch; receipt chip 3.2 s (failed 6 s). Max 4 concurrent jobs shown in the peek.

## 7. Voice
- Native Swift helper: AVAudioEngine + SFSpeechRecognizer (requiresOnDeviceRecognition) listening only for "Hey, Jarvis"; emits {type:'wake'}.
- Session states: off → waiting (wake word armed) → starting → listening → thinking → speaking → (back to listening | waiting); error. Turn cap: the shipping code ends a voice session after 10 minutes (voice.js). The public docs instead say there is no time limit and that a session ends after 4 minutes of silence — pick one deliberately. Send a heartbeat every 20 s (the reference backend closes after 75 s of silence); batch answer sentences for 300 ms (≤200 chars) but send tool steps immediately.
- Live conversation: OpenAI Realtime (WebRTC) in the renderer, server VAD, barge-in; show live captions in the island; audio meter bars 2.5 px wide, 90 ms height transitions.
- A spoken request becomes a background job (2 concurrent); Jarvis reads results back at the next pause.

## 8. Backend (apps/server)
- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) with a model router: Haiku for classification/short answers, Sonnet default, Opus for hard tasks.
- Tools: integrations via Nango (Gmail/Outlook, Calendar, Slack, HubSpot, Stripe, Linear), a company "brain" (Postgres/Supabase + pgvector; entities resolved on hard ids first; facts timestamped), Mac actions via a local relay to the desktop app (AppleScript/Accessibility).
- Give the agent a `show_card` tool whose input schema IS StageCard. Instruct: call `show_card` early with status 'working' and a step, then re-send the same id with blocks as data arrives, finally 'ready' or 'needs-you'. Stream each tool call to the desktop over SSE.
- Every send/delete/archive tool is wrapped: emit an `approval` block, wait for StageAction approve/decline; support Allow once / Always allow (per action kind) / Deny.

## 9. Sounds (optional; the shipping app bundles no sound files)
Use the ORIGINAL placeholder cues in kit/sounds (wake-chime, listen-start, ready-tick, needs-you, receipt-sent, error; 60–260 ms). Never play over Jarvis speech; respect mute.

## 9b. UI components via MCP (optional)
- RareUI (github.com/swamimalode07/rare-ui; license MIT + Commons Clause + Attribution — visible credit link to rareui.com required, components may not be resold) is consumed through the **shadcn MCP**: run `npx shadcn@latest mcp init --client claude`, add to components.json `"registries": {"@rare-ui": "https://raw.githubusercontent.com/swamimalode07/rare-ui/main/public/r/{name}.json"}`, then ask e.g. "add @rare-ui/fluid-orb". Useful: fluid-orb / matrix-orb (notch orb), animated-counter (number block), task-list, voice-note, step-player, notification-bell.
- Also available (npm-verified): @magicuidesign/mcp, @21st-dev/magic (API key), motion (library). Keep the 13-block catalog as the contract; components are only renderers.

## 10. Milestones
1. Shared zod schemas + unit tests. 2. Card kit page rendering fixture JSON for all 13 blocks. 3. Motion + reshape-in-place with a fixture "story" that re-sends cards. 4. Electron notch window. 5. Wake-word helper + Realtime voice. 6. Server with Claude Agent SDK + show_card + one integration. 7. Approvals + receipts. 8. Record a 45 s demo with real latency.

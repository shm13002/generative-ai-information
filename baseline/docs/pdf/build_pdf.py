import markdown, json, os, subprocess
B='/workspace/genui/baseline/'
md=lambda f: markdown.markdown(open(B+f).read(), extensions=['tables','fenced_code'])
snd=json.load(open(B+'src/renderer/sounds/manifest.json'))
def img(p,cap,w='100%'): return f'<figure><img src="{B+p}" style="width:{w}"><figcaption>{cap}</figcaption></figure>'
S=f'''<div class="cover"><h1>Brim baseline</h1><p class="lead">An original voice-first notch assistant with a generative card kit.<br>Gap analysis · working baseline · roadmap</p>
<p>Prepared for Shahzeb Makhdoom · Oct 13, 2026 · "Brim" is a placeholder name. The palette, sounds, copy and code are original, not Agently's.</p>{img("screens/crop/approval.png","Approval dropping from the notch (browser build, headless Chromium)","80%")}</div>
<h2>1. What you get and what was verified</h2><table><tr><th>Item</th><th>Status (checked Oct 13, 2026 ET)</th></tr>
<tr><td>Unit tests (contract, migration, store/undo/history, policy, mock stream, notch placement)</td><td>14/14 pass (<code>npm test</code>)</td></tr>
<tr><td>TypeScript types + generated JSON Schema v1</td><td>tsc --strict OK; schema snapshot test</td></tr>
<tr><td>Electron overlay (transparent, click-through, Alt+Space hotkey, IPC + ajv validation)</td><td>Launched under Xvfb on Linux; mock agent over IPC rendered a needs-you card (<code>npm run smoke</code>). <b>Not run on macOS</b> (no Mac available here)</td></tr>
<tr><td>Browser build, plus single-file <code>dist/brim.html</code> (395 KB, sounds inlined)</td><td>No page errors; all 13 sounds decoded</td></tr>
<tr><td>Screenshots of 18 states</td><td>Captured with Playwright; no console errors</td></tr>
<tr><td><code>demo.mp4</code></td><td>35.7 s, 1280×800 H.264 30 fps + AAC 48 kHz stereo, -17.5 LUFS integrated; 24 sound events synced from the event log</td></tr>
<tr><td>Claude Agent SDK adapter</td><td>Stub only, not executed. The SDK (0.3.296) exports <code>query</code>, <code>tool</code> and <code>createSdkMcpServer</code></td></tr></table>
<h2>2. Demo in motion (frames from demo.mp4, 10 fps)</h2>
{img("screens/strips/alert.png","Alert drops out of the notch: DROP spring (180/14), slight overshoot")}
{img("screens/strips/open-fill.png","Wake → listen → the island springs open (ARRIVE 140/15) → shimmering skeleton guessed from the words")}
{img("screens/strips/reshape-count.png","Reshape in place: the list shortens, a number block arrives, $ counts up over 820 ms, the sparkline draws")}
{img("screens/strips/approval.png","Edit in place, then the approval drops in (needs-you sound)")}
{img("screens/strips/collapse-receipt.png","Allow once → card blurs out → receipt bar with Undo and a countdown line")}
{img("screens/strips/signed-open.png","Later alert → card opens → auto-dismiss")}
<h2>3. Key states</h2><div class="grid">{"".join(img(f"screens/crop/{s}.png",s) for s in ["rest","alert","listening","skeleton","todo","reshape","approval","receipt","jobs","history","error","offline","permission","source","floating-dark","light-floating"])}</div>
<h2>4. Block catalog (19 = 13 core + 6 for the gaps)</h2>{img("screens/gallery.png","All renderers. New ones: undo, error, offline, history, permission, source")}
<h2>5. Gap analysis</h2>{md("docs/GAPS.md").replace("<h1>","<h3>").replace("</h1>","</h3>")}
<h2>6. Architecture and contract</h2><pre>utterance ─▶ agent (mock | Claude SDK) ─▶ v1 messages: upsert | patch{{rev}} | remove{{receipt}}
          ─▶ main: ajv validate + migrate ─▶ IPC ─▶ renderer store (history, undo) ─▶ stage (island + FLIP + reveals + sounds)
actions ◀─ renderer: dismiss | approve/deny/edit | undo | retry/open/done/primary/connect/recall ─▶ main validates</pre>
<p>Card: <code>v</code>, <code>id</code>, <code>rev</code>, <code>utterance</code> ≤600, <code>status</code> (working | ready | needs-you | error | offline), <code>step</code> ≤120, <code>say</code> ≤400, <code>receipt</code> ≤80, <code>blocks</code> ≤12, total ≤64,000 chars. Unknown fields and block types are rejected. A v0 payload (<code>screen.blocks</code>) migrates; v2+ is refused.</p>
<h2>7. Motion and sound</h2><table><tr><th>Motion</th><th>Value</th></tr><tr><td>ARRIVE / MORPH / DROP springs</td><td>(140,15) 760 ms · (230,27) 520 ms · (180,14) 680 ms, sampled to CSS linear()</td></tr><tr><td>Reveals</td><td>phrase 140 ms apart, 280 ms blur-fade · count 820 ms ease-out cubic · rows 95 ms stagger · spark draw 760 ms · ghost 170 ms</td></tr><tr><td>Lifecycle</td><td>receipt 3.4 s · ready hold 9 s · undo window 10 s · island sizes rest 270 / bar 420 / open 460, bottom radius 14/22/26</td></tr></table>
<table><tr><th>Sound</th><th>ms</th><th>LUFS</th><th>Peak dBFS</th></tr>{"".join(f"<tr><td>{v['name']}</td><td>{v['ms']}</td><td>{v['lufs']}</td><td>{v['peak_db']}</td></tr>" for v in snd.values())}</table>
<h2>8. Roadmap</h2><table><tr><th>Version</th><th>Scope</th></tr>
<tr><td><b>v0 (this baseline)</b></td><td>Overlay, contract v1, 19 blocks, motion, sounds, mock agent, approvals and undo, history, error/offline/permission states, floating mode, tests, demo</td></tr>
<tr><td><b>v1 (shippable beta, about 6–8 weeks)</b></td><td>M1 Claude adapter · M2 latency budgets · M3 wake word, STT, TTS and barge-in · M4 persisted grants · M5 encrypted history · M6 accessibility and displays · M7 security · M8 signing, notarization and auto-update · first 2 integrations (calendar, mail)</td></tr>
<tr><td><b>v2</b></td><td>CRM and other connectors, observability and cost budgets (M10), team policies and audit log, SOC 2 Type I, native SwiftUI shell option, multi-language voice</td></tr></table>
<h2>9. Files for Claude Code</h2><p><code>CLAUDE.md</code> · <code>claude/MASTER_PROMPT.md</code> · <code>claude/prompts/01–10</code> (one per milestone) · <code>claude/.mcp.json</code> (shadcn 4.21.4, @playwright/mcp 0.0.83, @upstash/context7-mcp 4.4.1, @magicuidesign/mcp 2.0.0, versions checked on npm) · <code>claude/REPOS.md</code> (32 repos with verified URLs, stars and licenses).</p>
<p class="small">Limits: Electron was verified on Linux only. Web Speech availability varies by browser. The sounds are original but were judged by synthesis parameters and loudness, not by listening tests. "Not seen" in the gap analysis means not seen in the public material.</p>'''
css='''@page{size:A4;margin:14mm}body{font:10pt -apple-system,Helvetica,Arial,sans-serif;color:#1b1b1b}h1{font-size:34pt;margin:0}h2{border-bottom:2px solid #c98b2b;padding-bottom:3px;margin-top:20px;page-break-after:avoid}
.cover{page-break-after:always;padding-top:30mm}.lead{font-size:14pt;color:#555}table{border-collapse:collapse;width:100%;font-size:8.6pt;margin:6px 0}th,td{border:1px solid #ccc;padding:3px 5px;text-align:left;vertical-align:top}th{background:#f3eee4}
figure{margin:6px 0;page-break-inside:avoid}figure img{width:100%;border-radius:4px;border:1px solid #ddd}figcaption{font-size:8pt;color:#555}.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
pre{background:#f6f4ef;padding:6px;font-size:8pt;white-space:pre-wrap}code{font-size:8.5pt}.small{font-size:8pt;color:#666}'''
open(B+'docs/pdf/spec.html','w').write(f'<html><head><meta charset="utf-8"><style>{css}</style></head><body>{S}</body></html>')
subprocess.run(['google-chrome','--headless','--no-sandbox','--disable-gpu','--no-pdf-header-footer','--allow-file-access-from-files',f'--print-to-pdf={B}Brim-Baseline-Spec.pdf',B+'docs/pdf/spec.html'],capture_output=True)
print(subprocess.run(['pdfinfo',B+'Brim-Baseline-Spec.pdf'],capture_output=True,text=True).stdout.split('Pages:')[1].split()[0])

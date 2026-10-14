# Repositories referenced in the research (verified Oct 13, 2026 ~8:50 PM ET via GitHub API/search)

Stars = stargazers at check time. "License" = GitHub's SPDX detection (NOASSERTION = custom/unclear — read the file).

## Generative UI / agent↔UI protocols
| Repo | Stars | License | What it is | How to use it in Brim |
|---|---|---|---|---|
| https://github.com/vercel-labs/json-render | 18,646 | Apache-2.0 | "The Generative UI framework": model emits JSON against a component catalog | Closest prior art to Brim's contract (catalog + JSON). Compare streaming/partial-JSON handling before inventing your own. |
| https://github.com/thesysdev/openui | 10,855 | MIT | "Open Standard for Generative UI" (OpenUI Lang; publishes latency benchmarks) | Benchmark ideas for token cost/latency of UI payloads. |
| https://github.com/a2ui-project/a2ui (was google/A2UI) | 16,688 | Apache-2.0 | Agent-to-UI declarative protocol | Reference for versioned, declarative UI messages + client renderers. |
| https://github.com/ag-ui-protocol/ag-ui | 16,507 | MIT | Agent–User Interaction protocol (event stream between agent and frontend) | Option for the main↔agent event stream if you outgrow Brim's upsert/patch/remove. |
| https://github.com/CopilotKit/CopilotKit | 38,003 | MIT | Frontend stack for agents & generative UI | Patterns for human-in-the-loop approvals and tool-rendered UI. |
| https://github.com/tambo-ai/tambo | 11,188 | MIT | Generative UI SDK for React | React alternative if you port the kit to React. |
| https://github.com/MCP-UI-Org/mcp-ui (was idosal/mcp-ui) | 5,210 | Apache-2.0 | UI resources over MCP | If Brim cards should also be served to other MCP hosts. |
| https://github.com/openai/openai-apps-sdk-examples | 2,369 | MIT | Example apps for the OpenAI Apps SDK (widgets in chat) | Reference for sandboxed widget UX; not used directly. |
| https://github.com/vercel/ai | 27,302 | NOASSERTION (Apache-2.0 per repo) | AI SDK for TypeScript (streaming, tools, structured output) | Alternative model layer (streamObject for partial JSON) if not using the Claude Agent SDK. |

## Agent runtime
| Repo | Stars | License | Use |
|---|---|---|---|
| https://github.com/anthropics/claude-agent-sdk-typescript | 1,805 | (see repo) | npm `@anthropic-ai/claude-agent-sdk` (0.3.296 installed here; exports `query`, `tool`, `createSdkMcpServer`). Wire `show_card` in `src/agent/claude-adapter.js`. |
| https://github.com/anthropics/claude-agent-sdk-python | 8,271 | MIT | Python twin, if the backend is Python. |

## Notch / island apps (macOS)
| Repo | Stars | License | Use |
|---|---|---|---|
| https://github.com/TheBoredTeam/boring.notch | 11,025 | **GPL-3.0** | SwiftUI notch app. Study patterns only — copying code makes your app GPL. |
| https://github.com/Lakr233/NotchDrop | 2,127 | MIT | SwiftUI notch shelf; MIT, safer to learn from/reuse with attribution. |
| https://github.com/farouqaldori/vibe-notch | 2,523 | Apache-2.0 | Claude Code session notifications in the notch. |
| https://github.com/mrkai77/DynamicNotchKit | 463 | MIT | Swift package for notch-attached panels — good base for a native port. |
| https://github.com/MioMioOS/MioIsland | 539 | NOASSERTION | Dynamic Island for AI coding agents (approve from notch). |
| https://github.com/AppGram/agentnotch | 218 | none | Notch status for Claude Code/Codex. |
| https://github.com/saif0200/notchprompt | 1,387 | MIT | Teleprompter in the notch (simple NSPanel example). |
| https://github.com/jpomykala/NotchPrompter | 651 | NOASSERTION | Floating prompter. |
| cyclop, Islet, OpenNotch | — | — | Named in earlier notes; **not found** by GitHub search on Oct 13 — not verified. |

## UI components & MCPs
| Repo | Stars | License | Use |
|---|---|---|---|
| https://github.com/swamimalode07/rare-ui | 1,708 | MIT + Commons Clause + Attribution | Via shadcn MCP registry `@rare-ui` (see .mcp.json). Must credit rareui.com visibly; can't resell components. |
| https://github.com/Codewithswappy/RareUI | 24 | MIT | Different project with the same name (rareui.in) — not the MCP. |
| https://github.com/shadcn-ui/ui | 125,533 | MIT | shadcn CLI + MCP (`npx shadcn@latest mcp`). |
| https://github.com/magicuidesign/magicui | 22,653 | MIT | Animated components; MCP `@magicuidesign/mcp`. |
| https://github.com/21st-dev/magic-mcp | 6,005 | ISC | `@21st-dev/magic` MCP (needs a 21st.dev API key). |
| https://github.com/motiondivision/motion | 34,072 | MIT | Animation library (springs) if you move to React/JS-driven motion. |
| https://github.com/microsoft/playwright-mcp | 38,104 | Apache-2.0 | Let Claude drive/screenshot the renderer. |
| https://github.com/ChromeDevTools/chrome-devtools-mcp | 53,478 | Apache-2.0 | Performance traces of animations. |
| https://github.com/upstash/context7 | 62,991 | MIT | Up-to-date library docs for Claude. |
| https://github.com/modelcontextprotocol/servers | 91,224 | NOASSERTION | Reference MCP servers. |

## Platform & tooling
| Repo | Stars | License | Use |
|---|---|---|---|
| https://github.com/electron/electron | 123,312 | MIT | Shell (v33.4.11 installed). |
| https://github.com/electron-userland/electron-builder | 14,672 | MIT | Packaging, signing, notarization, `electron-updater` auto-update. |
| https://github.com/sindresorhus/electron-store | 5,024 | MIT | Persist settings/history/grants. |
| https://github.com/ajv-validator/ajv | 14,861 | MIT | JSON Schema validation of every agent message (used). |

## Reference (studied, do not copy)
| Repo | Stars | Notes |
|---|---|---|
| https://github.com/AhmadAfterHours/agently-desktop-releases | 0 | Agently for Mac binaries ("Binary distribution only"). Source of the measured numbers in the research. Proprietary: do not copy code, name, brand, or trade dress. |

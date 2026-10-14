# How to build fast generative UI and an agently.dev-style product with open source (October 2026)

To build fast generative UI, have the model stream a compact description of the UI through a catalog of components you already built. Don't have it write raw React or HTML on every turn. Keep full code generation for the less frequent "build me a page or app" moments, and render that code in a browser sandbox. One correction first: agently.dev is not mainly a generative-UI builder. It is an "AI chief of staff" built on a company knowledge graph. Its generative-UI surface is its "Pages" (documents, presentations, spreadsheets, interactive artifacts and published HTML pages).\[1\] Copying it is mostly an agent, memory and integrations problem with a fast UI layer on top.

## TL;DR
- **Speed comes from producing fewer output tokens and showing them sooner.** Streaming a catalog-based UI spec (json-render, OpenUI Lang, A2UI, or AI SDK tool parts) on a fast host such as Cerebras or Groq gets the first pixels on screen in well under a second. Generating raw code typically takes 10–35 seconds per view. Thesys measured 1,493 tokens and 35 seconds for a code-generated chart, against 610 tokens and under 2 seconds to first render with a component spec.
- **The open-source stack is mature as of 2026.** It includes Vercel AI SDK 6 plus json-render (Apache 2.0), Thesys OpenUI (MIT, 10.9k GitHub stars), CopilotKit/AG-UI 1.0, Google A2UI, and MCP Apps (stable since January 26, 2026). For open-weight models: Kimi K3 or GLM-5.3 for heavy code, Qwen3.8-27B (Apache 2.0, one GPU) or gpt-oss-120B on Cerebras for fast UI specs, and Tesslate's UIGEN fine-tunes for small local UI models.\[2\]\[3\]
- **Blueprint for an agently-like MVP as a solo founder:** Next.js + AI SDK 6 → an agent loop with tools and approval gates → Postgres memory and a knowledge graph → catalog-based generative UI in chat, plus code-generated "Pages" rendered in a sandboxed iframe → an MCP server so Claude, Cursor and ChatGPT can use your "brain". Ship the memory and agent loop first. Generative UI is the presentation layer, not the moat.

## Key Findings

### 1. What agently.dev actually is
- **Positioning:** "Agently is your AI chief of staff. It learns how your company runs from your connected tools, then handles the work with your approval." Its tagline is "The agent is the commodity. The brain is the product."\[4\] It was launched on Hacker News earlier as an "AI Work OS" in which docs, tasks, team chat and integrations are interconnected and "AI employees" work inside a shared workspace.\[5\]
- **Core pieces, from its docs:**
  - **Jarvis**, a single orchestrator agent that plans tasks and delegates to specialist sub-agents.\[1\]
  - **The Brain**, a "temporal knowledge graph" of facts "tagged with when it was true and where it came from", fed by "a hundred sources" over OAuth (Slack, Gmail, Stripe, Salesforce, Notion, Linear, GitHub and others).\[1\]\[4\]
  - **Work** (task queue) and **Routines** (scheduled jobs).\[1\]
  - **Approvals**, where consequential actions are "held with the reasoning attached".\[4\]
  - **Pages**, described as "notes, presentations, spreadsheets, and interactive artifacts in a block-based editor" that can be shared, gated, or "published as a live website at a youpage.agently.dev address".\[1\]
- **Its generative-UI elements:** Pages and HTML pages ("Docs Presentations Sheets HTML pages Notion-style templates");\[6\] structured run cards showing actions and approval buttons; and an **MCP server** at api.agently.dev/mcp exposing six tools (search, find entity, walk neighbours, schema, recent episodes, remember).\[4\] The server is "stateless (MCP spec 2026-07-28)".\[7\]
- **Recent shipping pace:** Agently for Mac ("Jarvis lives in the notch") on October 11, 2026; Approvals on October 10; Draft reply on October 12; hands-free "Jarvis mode" on October 13.\[4\]
- **Pricing:** The homepage FAQ lists a free tier and "Pro at $99 a month… 3,000 credits a month, 10 connected apps, 10 GB of brain storage and up to 10 members."\[4\] One Agently blog post says "from $39/mo".\[8\] This conflicts with the homepage. Treat $99 as current and $39 as possibly an older plan.
- **Tech stack:** Not disclosed. Inferred: a Next.js-style web app, since the site serves Next.js meta tags.\[4\] The rest is likely an LLM orchestration layer calling frontier APIs, a temporal graph store (Agently compares its data model to Zep's temporal knowledge graph), an OAuth integrations layer, and a streaming chat UI that renders structured cards.\[9\] Pages are probably a block editor with LLM-generated HTML for "interactive artifacts". All of this is inference; none of it is confirmed.
- **Name confusion:** Do not confuse it with **Agently (agently.tech, AgentEra)**, an unrelated open-source Python framework for structured and streaming LLM output, or with agently.com, a real-estate training company.\[10\]\[11\]

### 2. The four technical approaches and their tradeoffs

| Approach | How it works | Speed | Safety and consistency | Best for |
|---|---|---|---|---|
| **A. Raw code generation** (v0, Bolt, Lovable, Claude Artifacts, Gemini "dynamic view") | LLM writes HTML/React; compiled and run in a sandbox | Slowest: thousands of tokens per view | Arbitrary code, so it needs isolation; visual drift | One-off apps, landing pages, "Pages"-style artifacts |
| **B. Tool-call → pre-built component** (AI SDK tool parts, Tambo, CopilotKit "static" GenUI) | Model picks a registered component and streams typed props (Zod) | Fastest: tens to hundreds of tokens | On-brand, type-safe | Dashboards, cards, forms, approvals\[12\]\[13\] |
| **C. Declarative UI spec / protocol** (json-render, OpenUI Lang, A2UI, Thesys C1, MCP Apps) | Model composes a tree from a catalog; renderer maps it to native components | Fast, and composable beyond single components | No executable code (except MCP Apps, which uses sandboxed HTML iframes) | Open-ended layouts that stay within your design system |
| **D. Streaming / progressive rendering** (applies to all of the above) | Render partial JSON patches or partial props as tokens arrive | Cuts perceived latency to time-to-first-token | Needs tolerant parsers | Everything |

- **A. Code generation** gives the richest results. Google's paper "Generative UI: LLMs are Effective UI Generators" found generated interfaces "strongly preferred by human raters", but only "when ignoring generation speed".\[14\] That caveat is the core problem. Thesys's own test (vendor data) found code generation used 1,493 output tokens and 35 seconds for a static chart, against 610 tokens and under 2 seconds to start rendering with its component API.\[15\]
- **B. Vercel AI SDK:** the old `streamUI`/RSC approach is effectively retired. Vercel says "Development of AI SDK RSC is currently paused", and its RSC GenUI example repo was archived on June 25, 2026.\[16\] The current pattern is `streamText` + tools on the server, with `useChat` rendering `message.parts` typed as `tool-${toolName}` and moving through states like `input-available`, `output-available` and `output-error`.\[17\] SDK 6 adds an Agent abstraction and a `needsApproval` flag for human-in-the-loop, which maps directly to Agently's approval gate.\[18\]
- **C. Protocols, briefly:**
  - **json-render (Vercel Labs, Apache 2.0, launched January 2026, 18.7k GitHub stars as of October 2026):** a Zod catalog generates the system prompt via `catalog.prompt()`. The model streams **RFC 6902 JSON Patch lines (JSONL)**, which `useUIStream`/SpecStream compiles progressively. It ships 36 shadcn/ui components and renderers for React, Vue, Svelte, Solid, React Native, PDF, email and video.
  - **OpenUI / OpenUI Lang (Thesys, MIT, 10.9k GitHub stars):** a compact streaming language. In Thesys's own benchmark across seven UI scenarios it used 4,800 tokens in total, against 10,180 for json-render JSON and 9,948 for C1 JSON (52–53% fewer). Thesys claims "Latency (60 tok/s) 4.9s vs 14.2s" for json-render and A2UI. Thesys's hosted **C1 API** is closed-source. Crayon/OpenUI is the open part.\[19\]\[20\]
  - **A2UI (Google, Apache 2.0, December 2025):** a declarative JSON "flat list of components with identifier references", streamed over A2A or AG-UI and rendered natively (Angular, Flutter, Lit, React). Google says it is used in Opal and Gemini Enterprise.\[21\]\[22\] v0.9 is current.
  - **MCP Apps (SEP-1865, stable January 26, 2026):** an MCP server returns `ui://` resources with MIME type `text/html;profile=mcp-app`. Hosts render them in **sandboxed iframes** that talk back over JSON-RPC/postMessage. It merges MCP-UI and OpenAI's Apps SDK, and runs in Claude, ChatGPT, VS Code, Goose and Postman.\[23\]\[24\]\[25\] The latest SDK reviewed is ext-apps v1.7.5 (July 23, 2026), and it became one of MCP's first two official extensions in the stateless 2026-07-28 spec.\[26\]\[27\]
  - **AG-UI 1.0 (CopilotKit, September 30, 2026):** the event transport underneath, with 31 typed events in 8 categories over SSE (text, tool calls, reasoning, state snapshot/delta, and so on).\[28\]\[29\] A2UI and MCP Apps "ride on top of" it. CopilotKit released "Open Intelligent UI" on October 9, 2026, as an open-source answer to OpenAI's newly shipped Intelligent UI in ChatGPT.\[30\]
- **Tambo** (React, register components with Zod; MIT) is good to learn from, but **Tambo Cloud shuts down October 31, 2026**. Use it only self-hosted.\[31\]

### 3. Speed techniques, ranked by impact
1. **Generate fewer tokens.** This is the biggest lever. Time-to-UI ≈ TTFT + (output tokens ÷ tokens per second). A 600-token spec at about 1,700 tok/s takes about 0.35 s of decode time. A 3,000-token React file at 85 tok/s takes about 35 s. Use catalogs, compact formats (OpenUI Lang or YAML), and IDs and references instead of repeated markup.
2. **Stream and render progressively.** Use JSON Patch/JSONL, a partial-JSON parser, or partial tool-call props, and show skeletons immediately. Note that some tool-based integrations do not stream: Thesys's Open WebUI plugin renders "all at once, not token-by-token" because the tool runs after its arguments finish generating.\[32\]
3. **Use fast inference hardware for the UI layer.** On gpt-oss-120B, Cerebras advertises about 3,000 tok/s. Artificial Analysis's provider page (fetched October 14, 2026) lists Cerebras at 1,532.7 t/s and Groq at 470.4 t/s. On a 10,000-input-token reasoning workload, it shows time to first answer token of 1.72 s for Cerebras against 4.98 s for Groq. Cerebras lists gemma-4-31b at about 1,850 tok/s ($0.99/$1.49 per million tokens). Groq lists gpt-oss-20b at about 1,000 tok/s ($0.075/$0.30).\[33\] By comparison, Kimi K2.6 on Fireworks runs at about 85 tok/s.\[34\] Digital Applied's April 2026 latency benchmark (30 model and provider pairings) found that "for chat-style streaming UI, perceived performance flattens around 200 TPS regardless of model speed". Fast hardware matters most for agent loops and for code that must finish before it can render.
4. **Use constrained or structured decoding, which is nearly free now.** The XGrammar paper (MLSys 2025) reports "near-zero overhead structure generation".\[35\] vLLM's blog reports "up to 5x improvement in time per output token (TPOT) under load" from the XGrammar integration.\[36\] The XGrammar-2 post (MLC, May 4, 2026) claims "up to 80x efficiency gain compared to XGrammar".\[37\] Grammar-constrain your UI spec so you never re-ask on malformed JSON.
5. **Use speculative decoding for code edits.** Prompt-lookup or n-gram decoding gives "2x-4x" on input-grounded tasks, including code editing.\[38\] EAGLE-3 reports up to 6.5× (373 vs 158 tok/s on Llama-3.1-8B in SGLang).\[39\] Cursor's "speculative edits" reached "~1000 tokens/s… ~13x speedup over vanilla inference".\[40\]\[41\] Morph's fast-apply model advertises 10,500+ tok/s, but OpenRouter measures about 4,240 tok/s P50.\[42\]\[43\] For iterating on generated Pages, send diffs or edits rather than full rewrites.
6. **Cache.** Use provider prompt caching for your large catalog system prompt. Google's "neural OS" prototype on Gemini 2.5 Flash-Lite stores generated screens in a UI graph and serves revisits "without querying Gemini again".\[44\] Cache generated specs per intent and data shape.
7. **Choose the cheapest sandbox that fits.**
   - In-browser and essentially free: an iframe + esbuild-wasm + esm.sh, which is what LlamaCoder now uses instead of Sandpack.\[45\] Sandpack/Nodebox has "no install/setup step". WebContainers "boot in milliseconds".\[46\]\[47\]
   - Server-side: E2B ("~150ms"), Daytona ("Sub 90ms", likely using warm templates), and Vercel Sandbox (Firecracker, "Milliseconds"; used by v0).\[48\]\[49\]\[50\]
   - All of these are vendor claims.

### 4. Open-weight models for UI and code (October 2026)
- **Frontier open weights (use via API):**
  - **Kimi K3** (Moonshot, July 2026, 2.8T/104B MoE, 1M context, custom Kimi K3 License). One October 4 snapshot ranks it 4th on LMArena WebDev (1674).\[51\]\[52\] Other trackers rank it anywhere from #1 to #7 depending on date.\[53\]\[54\] Rankings move weekly.
  - **GLM-5.3** (Z.ai). Z.ai's list price is $1.40 input / $4.40 output per million tokens, according to SiliconFlow's September 2026 GLM 5.3 API guide. One pricing site calls GLM-5.3 proprietary, so check the licence for the full model.
  - **DeepSeek V4.1 Flash**, at about $0.15–0.30 / $0.60–1.20 per million tokens, is the cheap workhorse.\[51\]
- **Self-hostable and fast:**
  - **Qwen3.8-27B** (August 2026, Apache 2.0, about 18 GB in Ollama, ranked 14th on Code Arena) is the best one-GPU pick.\[51\]\[52\]
  - **Qwen3-Coder-Next** (80B/3B-active MoE, Apache 2.0) and **Qwen3-Coder-30B-A3B** are fast MoE options.\[52\]
  - **GLM-5.3-Flash** (MIT, 320B/18B) suits multi-GPU servers.\[52\]
  - **gpt-oss-120B/20B** are the models with the fastest hosted inference.
- **UI-specific fine-tunes:** Tesslate's **UIGEN** line: UIGEN-T3-14B on Qwen3-14B with a `/no_think` fast mode; UIGEN-X-8B/4B; and UIGEN-FX-4B, trained with A11y, Axe and Lighthouse rewards. They are good for cheap local HTML/Tailwind generation, but they are research previews, mostly from 2025.\[2\]\[3\]\[55\]\[56\]
- **Takeaway:** "Dedicated coder fine-tunes are losing to general flagships." On Code Arena, Qwen3-Coder-480B ranks 106th while the general Qwen3.8-27B ranks 14th.\[51\] For component specs, a small fast general model plus grammar constraints beats a big coder model.

### 5. Open-source repos to start from
- **Component/spec GenUI:** vercel-labs/json-render; thesysdev/openui (plus generative-ui-bench); CopilotKit (AG-UI, generative-ui-playground, Open Intelligent UI); google A2UI; modelcontextprotocol/ext-apps; assistant-ui (chat primitives); tambo-ai/tambo (self-host).\[57\]\[58\]
- **Code-gen builders (v0/Lovable clones):**
  - stackblitz-labs/bolt.diy, the official open-source Bolt.new with WebContainers and any LLM.\[59\]\[60\]
  - firecrawl/open-lovable, which clones a URL into a React app using Firecrawl + E2B + Groq/Kimi (MIT).\[61\]\[62\]\[63\]
  - Nutlope/llamacoder, an open-source Claude Artifacts on Together AI with an esbuild-wasm iframe.\[45\]
  - dyad-sh/dyad, a local app builder.\[64\]
- **Tutorials:**
  - AI SDK docs "Generative User Interfaces" and the Vercel Academy lesson "Multi-Step & Generative UI".\[17\]\[65\]
  - json-render "AI SDK Integration" (standalone and inline modes).\[66\]
  - LogRocket's json-render walkthrough.\[67\]
  - CopilotKit's "Build with Google's new A2UI Spec" and "Developer's Guide to the AG-UI Protocol".\[29\]\[68\]
  - The 2026 MCP Apps build guides covering the `ui://` resource, `_meta.ui.resourceUri` and CSP.\[24\]

## Recommendations: a solo-founder blueprint

**Architecture (in words):** Browser (Next.js + shadcn) ⇄ SSE stream (AI SDK UI messages, or AG-UI if you want framework neutrality) ⇄ API route running an **agent loop** (AI SDK 6 `Agent`/`streamText` with tools, `stopWhen` caps and `needsApproval` on writes) ⇄ **model router**:
- a fast tier (gpt-oss-120B on Cerebras/Groq, or self-hosted Qwen3.8-27B) for chat and UI specs;
- a strong tier (Kimi K3 or GLM-5.3 via API) for planning and Page and code generation.

The agent loop connects to **tools**: integrations over OAuth, Brain search/write, and a `render_ui` tool constrained to a json-render or OpenUI catalog. It also connects to **memory**: Postgres + pgvector to start, then a temporal fact table or graph (entity, fact, valid_from/valid_to, source). **Pages** = model-written single-file React/HTML, compiled in-browser (esbuild-wasm in a sandboxed iframe) and saved as versioned artifacts, with edits sent as diffs. Finally, expose an **MCP server** (and MCP Apps UI) so external agents can use your Brain, which is exactly Agently's distribution play.\[7\]

**MVP steps:**
1. **Week 1:** Chat plus 8–12 catalog components (KPI card, table, chart, form, approval card, email draft, task list) streamed with json-render or AI SDK tool parts. Grammar-constrain the output. Target under 1 s to first component.
2. **Week 2:** 3–5 integrations (Gmail, Calendar, Slack, Stripe, Notion) as tools, with an approval queue for every write.
3. **Week 3:** The Brain. Ingest into Postgres, extract facts with source and timestamp, and cite them in answers.
4. **Week 4:** Pages via code generation in an iframe sandbox; Routines via cron; an MCP server.
5. **Then:** Prompt caching on the catalog prompt, a spec cache, a diff-based edit model, and evaluations (OpenUI's generative-ui-bench is a starting point).

**Tradeoffs to decide on purpose:**
- **Catalog vs. code:** use a catalog for 90% of turns because it is fast and on-brand, and code for Pages.
- **Hosted vs. self-hosted models:** start hosted, since Cerebras/Groq beat a single GPU on latency. Self-host Qwen only when cost or privacy requires it.
- **Protocol choice:** AI SDK alone is simplest. Adopt AG-UI/A2UI only if you need multiple agent frameworks or native mobile clients.
- **Avoid lock-in to hosted GenUI services.** Thesys C1 is closed, and Tambo Cloud is ending.\[20\]\[31\]

## Caveats
- Most speed and token numbers here come from vendors: the Thesys/OpenUI benchmarks, Cerebras's 3,000 tok/s, E2B's ~150 ms, Morph's 10,500 tok/s. Independent measurements are often lower, for example Artificial Analysis's 1,532.7 t/s for Cerebras on gpt-oss-120B (October 14, 2026) and OpenRouter's ~4,240 tok/s for Morph.
- Model leaderboards (Kimi K3's rank, the GLM and Qwen versions) disagree between trackers and change monthly. Re-check before committing.
- Agently's internal stack is not public. Everything about its implementation beyond its docs is inference.

## Sources

1. [Core Concepts, Docs · Agently](https://agently.dev/docs/core-concepts)
2. [Tesslate/UIGEN-T3-14B-Preview · Hugging Face](https://huggingface.co/Tesslate/UIGEN-T3-14B-Preview)
3. [Tesslate/UIGEN-FX-4B-RL-Preview · Hugging Face](https://huggingface.co/Tesslate/UIGEN-FX-4B-RL-Preview)
4. [Agently: a chief of staff that already knows your company](https://agently.dev/)
5. [Show HN: Agently an AI Work OS that turns docs, chats, and tasks into execution](https://news.ycombinator.com/item?id=47141662)
6. [Agently: Your whole stack, running itself](https://agently.dev/?amp=)
7. [MCP Server, Docs · Agently](https://agently.dev/docs/mcp-server)
8. [ChatGPT Alternatives for Business: 15 Tools (2026) · Agently](https://agently.dev/blog/agently-chatgpt-alternative)
9. [Agently, a Mem0 Alternative for Teams That Want Shared AI Memory](https://agently.dev/blog/agently-mem0-alternative)
10. [GitHub - AgentEra/Agently: \[GenAI Application Development Framework\] 🚀 Build GenAI application quick and easy 💬 Easy to interact with GenAI agent in code using structure data and chained-calls syntax 🧩 Use Event-Driven Flow \*TriggerFlow\* to manage complex GenAI working logic 🔀 Switch to any model without rewrite application code](https://github.com/AgentEra/Agently)
11. [Home](https://www.agently.com/)
12. [Generative Components](https://docs.tambo.co/concepts/generative-interfaces/generative-components)
13. [GitHub - browncourtney6/tambo: Generative UI SDK for React · GitHub](https://github.com/browncourtney6/tambo)
14. [Generative UI: A rich, custom, visual interactive user experience for any prompt](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/)
15. [Why Generating Code for Generative UI is a bad idea](https://thesys.ghost.io/generating-code-for-generative-ui-is-a-bad-idea/)
16. [GitHub - vercel-labs/ai-sdk-preview-rsc-genui: Generative UI with React Server Components and Vercel AI SDK · GitHub](https://github.com/vercel-labs/ai-sdk-preview-rsc-genui)
17. [Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
18. [The Complete Guide to Generative UI Frameworks in 2026](https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc)
19. [OpenUI - In-depth Analysis](https://trend-hunt.com/en/product/openui)
20. [What Is Thesys C1? The Generative UI API Explained](https://ai-tldr.dev/learn/building-ai-apps/ai-ux-patterns/thesys-c1-generative-ui/)
21. [Google's Open-source A2UI Protocol](https://www.theunwindai.com/p/google-s-open-source-a2ui-protocol)
22. [Google Introduces A2UI (Agent-to-User Interface): An Open Sourc Protocol for Agent Driven Interfaces - MarkTechPost](https://www.marktechpost.com/2025/12/22/google-introduces-a2ui-agent-to-user-interface-an-open-sourc-protocol-for-agent-driven-interfaces/)
23. [What are MCP apps: Interactive UI for AI agents explained](https://composio.dev/content/what-are-mcp-apps)
24. [MCP Apps: build a UI on the 2026-07-28 spec](https://ecorpit.com/mcp-apps-server-rendered-ui-extension-build-guide-2026/)
25. [MCP Apps Explained (2026): Spec, Mechanism, and Real Host Support](https://www.ayautomate.com/blog/mcp-apps)
26. [MCP Apps: Interactive UI, Architecture & Security Guide](https://mcpblog.org/mcp-apps/)
27. [MCP Apps: UI enters the protocol, officially](https://agentinterface.app/guides/mcp-apps-ui-enters-the-protocol-officially)
28. [Introducing AG-UI 1.0: a stable spec for connecting any agent to any application](https://www.copilotkit.ai/blog/ag-ui-1.0)
29. [The Developer's Guide to the AG-UI Protocol](https://www.copilotkit.ai/blog/developers-guide-to-the-ag-ui-protocol)
30. [Introducing Open Intelligent UI: the Open-Source Alternative to ChatGPT's Intelligent UI](https://www.copilotkit.ai/blog/introducing-open-intelligent-ui)
31. [GitHub - tambo-ai/tambo: Generative UI SDK for React · GitHub](https://github.com/tambo-ai/tambo)
32. [GitHub - thesysdev/openwebui-plugin: OpenUI Generative UI tool for Open WebUI - renders interactive charts, forms, tables, and cards in chat via OpenUI Lang. · GitHub](https://github.com/thesysdev/openwebui-plugin)
33. [Cerebras Inference Speed vs Groq: Models, Benchmarks, Pricing](https://benchlm.ai/blog/posts/cerebras-won-speed-not-the-shortlist)
34. [Best LLMs for coding: 2026 roundup](https://fireworks.ai/blog/best-llms-for-coding)
35. <https://arxiv.org/pdf/2411.15100>
36. [Structured Decoding in vLLM: a gentle introduction](https://vllm-project.github.io/2025/01/14/struct-decode-intro.html)
37. [MLC](https://blog.mlc.ai/2026/05/04/xgrammar-2-fast-customizable-structured-generation)
38. [GitHub - apoorvumang/prompt-lookup-decoding: Simple speculative decoding technique, integrated in vLLM and transformers · GitHub](https://github.com/apoorvumang/prompt-lookup-decoding)
39. [EAGLE-3: Scaling up Inference Acceleration of Large Language Models via Training-Time Test](https://www.alphaxiv.org/abs/2503.01840)
40. [How Cursor built Fast Apply using the Speculative Decoding API](https://fireworks.ai/blog/cursor)
41. [Explore cursor.sh's 'fast apply' techniques ("fully rewriting the full file outperforms aider-like diffs for files under 400 lines") · Issue #625 · Aider-AI/aider](https://github.com/paul-gauthier/aider/issues/625)
42. [Fast Apply: Code Merging at 10,500 tok/s for AI Agents](https://www.morphllm.com/fast-apply-model)
43. [Morph V3 Fast - API Pricing & Providers](https://openrouter.ai/morph/morph-v3-fast)
44. [Simulating a neural operating system with Gemini 2.5 Flash-Lite - Google Developers Blog](https://developers.googleblog.com/en/simulating-a-neural-operating-system-with-gemini-2-5-flash-lite/)
45. [GitHub - Nutlope/llamacoder: Open source Claude Artifacts](https://github.com/Nutlope/llamacoder)
46. [StackBlitz](https://stackblitz.com/)
47. [Frequently Asked Questions - Sandpack - CodeSandbox](https://sandpack.codesandbox.io/docs/resources/faq)
48. <https://github.com/e2b-dev/docs/pull/49.diff>
49. [Daytona - Secure Infrastructure for Running AI-Generated Code](https://www.daytona.io/)
50. [Understanding Sandboxes](https://vercel.com/docs/sandbox/concepts)
51. [Best Open Weight Coding Models: Scores, Licences, Hardware](https://danubelabs.net/en/blog/best-open-weight-coding-models)
52. [Best Local LLM for Coding in 2026: 10 Models Compared](https://vdf.ai/blog/best-local-llm-for-coding/)
53. [Best Open-Source Coding Model 2026: Kimi K3 vs GLM-5.2 vs DeepSeek V4 vs Qwen3](https://www.morphllm.com/best-open-source-coding-model-2026)
54. [Best AI Model for Coding (2026): 15 Models Ranked by Benchmarks and Cost per Task](https://www.morphllm.com/best-ai-model-for-coding)
55. [Tesslate/UIGEN-X-4B-0729 · Hugging Face](https://huggingface.co/Tesslate/UIGEN-X-4B-0729)
56. [Tesslate/UIGEN-X-8B · Hugging Face](https://huggingface.co/Tesslate/UIGEN-X-8B)
57. [Thesys · GitHub](https://github.com/thesysdev)
58. [AG-UI Protocol](https://deepwiki.com/CopilotKit/CopilotKit/6-ag-ui-protocol)
59. [Stijnus commited on](https://huggingface.co/spaces/T1ckbase/bolt.diy/commit/b732f20233cb3259a70fb5647074e88a44bf5be5)
60. [bolt.diy / README.md](https://huggingface.co/spaces/T1ckbase/bolt.diy/blob/f52ba2ea3b1f08119c5ebcdff29d6659c42ace1d/README.md)
61. [How to Use Open Lovable, the Open-Source Alternative to Loveable AI](https://apidog.com/blog/loveable-ai-alternative-open-lovable/)
62. [Open Lovable: The Firecrawl Tool Explained · Creatr](https://getcreatr.com/open-lovable)
63. [Open Lovable - Free Open-Source AI Website Builder](https://open-lovable.com/)
64. [lovable · GitHub Topics · GitHub](https://github.com/topics/lovable)
65. [Multi-Step & Generative UI](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui)
66. [AI SDK Integration](https://json-render.dev/docs/ai-sdk)
67. [Exploring Vercel's JSON Render: build dynamic UI from structured data - LogRocket Blog](https://blog.logrocket.com/vercel-json-render-dynamic-ui/)
68. [The Developer's Guide to Generative UI in 2026](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026)

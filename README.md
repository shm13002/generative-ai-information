# Generative AI Information

Research, specs, and build kits for creating a generative-UI ("intelligent UI") assistant. In this kind of app, an AI model fills streaming, animated components (cards, notch, deep-research views, parallel task boards) instead of answering in plain text. The research includes frame-by-frame analysis of Agently's demo videos and reference material on CopilotKit, AG-UI and A2UI.

## Folder index

| Folder / file | What's in it |
|---|---|
| [`spec/`](spec/) | The latest full spec ([Jarvis-GenUI-Replication-Spec.pdf](spec/Jarvis-GenUI-Replication-Spec.pdf), 124 pages: notch, deep research, 100 parallel tasks, company brain, interruptions), the [Claude build prompt](spec/claude-prompt.md), and [`kit/`](spec/kit/) |
| [`intelligent-ui-spec/`](intelligent-ui-spec/) | Spec versions v1, v2, and the current one (PDFs), the build prompt, the system prompt, JSON schemas, and examples |
| [`Intelligent-UI-Kit.zip`](Intelligent-UI-Kit.zip) | Packaged build kit (prompt, system prompt, schemas, examples, PDF) |
| [`baseline/`](baseline/) | Working baseline app: source, docs, `claude/` prompts, tests, schema, the baseline spec PDF, and sound sources (node_modules excluded) |
| [`analysis-video/`](analysis-video/) | [Chapters/timestamps](analysis-video/Agently-Analysis-chapters.md), [deep-dive notes and transcripts](analysis-video/Deep-Dives-Notes.md), build scripts, and `screenshots/` |
| [`analysis-video/deep-dives/`](analysis-video/deep-dives/) | 8 deep-dive breakdown videos (1080p, under 25 MB each): Notch, Hundred Tasks, Ontology, Self-Designing UI, Interrupt, Apps Are Dead, Reinvented Interfaces, Launch Film |
| [`reference/copilotkit-a2ui/`](reference/copilotkit-a2ui/) | CopilotKit / AG-UI / Pydantic AI / A2UI reference: [links](reference/copilotkit-a2ui/LINKS.md), notes, and a PDF |

## Not included
The full compilation video (1 h 12 min, about 638 MB in 19 parts) and its compressed copies are too large for this repo, so they were left out.

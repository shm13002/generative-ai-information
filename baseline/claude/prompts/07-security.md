# M7 — Security
Electron hardening checklist (contextIsolation, sandbox, CSP, no remote content, IPC sender validation, permission handlers deny-by-default).
Prompt-injection: taint every value derived from third-party content; tainted → always ask; show `source` block with trust labels.
Secrets in macOS Keychain (keytar or safeStorage). Rate-limit tool calls. Threat model doc in docs/THREATS.md.

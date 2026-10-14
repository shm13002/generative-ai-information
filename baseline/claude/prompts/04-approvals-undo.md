# M4 — Approvals, undo, grants
Wire policy.decide() for every tool. Approval choices: once / this recipient / this action kind / edit / deny; persist grants
(electron-store) with a Settings card to review/revoke. Sends are delayed by UNDO_WINDOW_MS and cancellable from the receipt Undo button and
⌘Z. Approvals expire (expiresAt) → state 'expired'. Never auto-approve high risk or tainted actions. Tests for every path.

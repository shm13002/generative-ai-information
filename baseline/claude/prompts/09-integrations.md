# M9 — Integrations
Add connectors one at a time (calendar → mail → CRM) behind tools with typed outputs mapped to blocks (agenda, todo, number, person).
OAuth via a broker (e.g., Nango) or native; `connect` block drives the flow; `error{kind:'auth'}` with Reconnect when tokens expire.
Offline: queue requests (offline block), replay on reconnect.

# Codex one-shot full userscript audit

This temporary file exists only to create a reviewable PR for a complete Codex audit.

Audit the entire `userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js` file from top to bottom, not just this PR diff.

Read all ~10k lines and inspect interactions across lifecycle, restore/reload, sponsor accounting, gift history, chat fallback, commands, entries, payout/refund settlement, BON Pool settlement, stats, statements, UI, timers and idempotency.

Focus especially on:
- double-payout / double-refund / double-count races;
- overlapping async work, timers and polls;
- Gift History vs SystemBot fallback consistency;
- reload/restore and expired-giveaway settlement;
- cross-tab locking and ledgers;
- zero-entry Pool=0 refunds and Pool>0 full-pot settlement;
- host/self/admin identity normalization;
- sponsor notes and contribution accounting;
- payout allocation / rounding / minimum-prize guarantees;
- stale state after reset/end/error paths;
- DOM parsing / UNIT3D API assumptions;
- unsafe fallbacks or ambiguous HTTP outcomes;
- missing awaits, swallowed errors that can affect money/state, dead code, contradictory state, and misleading audit/statements;
- security/false-positive risks from user-written chat messages imitating system output.

Do not modify files or push fixes. Report findings with severity and concrete code locations.
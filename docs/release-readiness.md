# Release readiness evidence

Evidence date: 2026-08-31

## Current status

- Repository implementation and local automated gates: **verified**.
- CI on the supported Node 24 toolchain: **pending the next GitHub Actions run**.
- Staging environment and real Gemini request: **unverified**.
- Production promotion: **not approved**.

`npm run verify:full` completed with exit code 0 after the transaction and Gemini migrations. The
local host used Node 26, which is outside the supported `24.x` root contract and produced a Functions
runtime warning; CI is pinned to Node 24 and Functions deployment remains pinned to Node 22.

## Automated evidence

| Gate                               | Result                          |
| ---------------------------------- | ------------------------------- |
| Format, lint, strict typecheck     | Pass                            |
| Frontend unit tests                | 5/5 pass                        |
| Functions unit tests               | 3/3 pass                        |
| Reservation transaction emulator   | 5/5 pass                        |
| Firestore security rules emulator  | 4/4 pass                        |
| Public Playwright desktop/mobile   | 4/4 pass                        |
| Authenticated full-stack lifecycle | 1/1 pass                        |
| Production dependency audit        | 0 high/critical vulnerabilities |
| Entry bundle budget                | 112.3 KiB gzip, pass            |

The transaction suite proves concurrent duplicate reservation, quota exhaustion, expired-lease
recovery, mismatched payload reuse, and completed-record replay against the Firestore Emulator.

## Required staging evidence

Production promotion remains blocked until every release smoke item in the runbook is recorded
against the deployed staging project. This includes real Google sign-in, valid App Check tokens,
cross-account isolation, one real Gemini 3.7 Flash structured response, observed latency/token use,
retry behavior, deletion, logs, and monitoring alerts.

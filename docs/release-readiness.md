# Release readiness evidence

Evidence captured: 2026-09-01 20:50 WIB

## Decision

| Scope                           | Decision      | Reason                                                                                                         |
| ------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| Source implementation           | **Complete**  | Product phases 0–3 and local phase 4A are implemented.                                                         |
| Local automated acceptance      | **Go**        | The supported Node 24 aggregate gate completed with exit code 0.                                               |
| Functions runtime compatibility | **Go**        | Typecheck, unit, transaction, build, and authenticated lifecycle gates also pass on Node 22.                   |
| Staging promotion               | **No-go yet** | The completed working tree does not yet have exact-commit CI or deployed-environment evidence.                 |
| Production promotion            | **No-go**     | Real Auth, App Check, Gemini, observability, performance, backup, and reviewer evidence remain external gates. |

“Complete” in this document means the authorized repository implementation and its reproducible local
validation are complete. It does not turn local emulator evidence into cloud or production evidence.

## Verified toolchains

| Surface                             | Verified runtime                                         |
| ----------------------------------- | -------------------------------------------------------- |
| Root application and CI contract    | Node 24.20.0, npm 11.19.0                                |
| Cloud Functions deployment contract | Node 22.23.2                                             |
| Firestore/Auth/Functions emulation  | Firebase CLI 15.28.2, Firestore Emulator 1.22.0, Java 25 |

The aggregate run used Node 24. Functions were then independently typechecked, unit-tested,
transaction-tested, built, and exercised through the authenticated lifecycle on Node 22 so the local
host version cannot hide a runtime-contract problem.

## Automated evidence

| Gate                                                   | Result                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `npm run verify:full` on Node 24                       | **Pass**, exit code 0                                                   |
| Prettier, ESLint with zero warnings, strict TypeScript | **Pass**                                                                |
| Frontend/shared unit and component tests               | **21/21 files, 44/44 tests pass**                                       |
| Frontend coverage                                      | 60.40% statements, 50.79% branches, 54.54% functions, 61.91% lines      |
| Functions unit tests                                   | **2/2 files, 3/3 tests pass** on Node 24 and Node 22                    |
| Firestore transaction/invariant tests                  | **2/2 files, 10/10 tests pass** on Node 24 and Node 22                  |
| Firestore Security Rules tests                         | **1/1 file, 6/6 tests pass**                                            |
| Public Playwright matrix                               | **38 passed, 4 intentionally skipped, 0 failed** across 42 cases        |
| Authenticated emulator lifecycle                       | **1/1 pass** on Node 24 and Node 22                                     |
| Web and Functions production builds                    | **Pass**; 3,292 modules transformed                                     |
| Entry bundle budget                                    | **Pass**; 65.3 KiB gzip, 36 JavaScript chunks                           |
| Production dependency audit                            | **0 vulnerabilities** in root and Functions production trees            |
| Client artifact scan                                   | **No source maps, external Google Font URLs, or Gemini secret markers** |
| Visual regression baselines                            | **6 inspected snapshots** for desktop/mobile landing and demo result    |

The four local Playwright skips are expected: pixel baselines run only on Chromium desktop/mobile to
avoid comparing images produced by different rendering engines. Chromium, Firefox, and WebKit
desktop/mobile still execute all functional, theme, keyboard, focus, route, drawer, and axe
accessibility scenarios. CI and deploy use a dedicated Windows visual job so the `win32` baselines are
compared in the same operating-system family where they were generated.

## Concurrency and deletion evidence

The Firestore transaction suite explicitly proves:

- exactly one generator wins concurrent duplicate analysis requests;
- quota exhaustion rejects a new reservation;
- an expired lease is reclaimed without charging quota twice;
- an idempotency key cannot be reused with a different payload;
- a completed record is replayed without regeneration;
- stale authenticated requests are blocked after account deletion starts;
- one deterministic server-owned daily check-in is upserted without changing its creation time;
- incomplete habit arrays and non-owner check-ins are rejected;
- deleting an analysis or account cascades associated check-ins; and
- a stale token cannot create a check-in after account deletion starts.

The authenticated browser lifecycle additionally exercises sign-in through the Auth Emulator, create
and resume reflection, server analysis, server check-in, scoped analysis deletion with cascade, account
deletion, tombstone creation, and Auth user removal.

## Accessibility and visual evidence

- Dialogs and the mobile drawer are rendered through body portals.
- Background application content is isolated with reference-counted `inert` and `aria-hidden` state.
- Tab containment, Escape dismissal, initial focus, nested modal isolation, and trigger focus restoration
  have automated coverage.
- Axe checks pass for the landing page, both themes, public routes, sign-in dialog, and mobile drawer.
- Six Windows/Chromium snapshots cover landing dark/light and demo-result hierarchy at desktop and
  mobile viewports.

## Dependency audit disposition

The release audit intentionally evaluates runtime dependencies and is clean: root 0 and Functions 0.
The broader root development audit reports **1 low and 7 moderate** advisories, all beneath the direct
development-only `firebase-tools@15.28.2` dependency. Registry verification showed 15.28.2 is the
current release at evidence time. npm proposes `firebase-tools@14.23.0` as a semver-major remediation,
which is a downgrade and is not an acceptable unattended fix. Functions' complete dependency tree is
clean. This remains a tracked developer-tooling risk, not a shipped-client vulnerability.

Re-evaluate the full development audit whenever Firebase CLI publishes a newer fixed dependency tree.
Do not use `npm audit fix --force` without separately validating emulator, deploy, and CI behavior.

## External evidence still required

Production promotion remains blocked until all of the following are attached to one exact commit:

1. Green GitHub Actions CI for that commit on the supported toolchain.
2. Protected staging deployment using the documented order: Firestore rules/indexes/TTL, Functions,
   then Hosting.
3. Real Google sign-in and cross-account owner-isolation evidence.
4. Valid and invalid App Check behavior with production enforcement configured fail-closed.
5. One real `gemini-3.7-flash` structured response, including latency, token usage, timeout, and retry
   evidence; emulator demo output is not provider evidence.
6. Verification that the `expiresAt` TTL field override is active in the target Firestore project.
7. Staging deletion evidence showing cascade completion and stale-token rejection.
8. Lighthouse results meeting the PRD mobile thresholds and a manual 320/360/768/1024/1440 px visual
   review on the deployed build.
9. Logs, dashboards, alerts, quota/budget controls, backup retention, and a non-production restore drill.
10. Final privacy/contact copy and explicit release reviewer approval.

Until those ten items pass, the accurate status is: **implementation-complete and locally verified,
staging-unverified, production not approved**.

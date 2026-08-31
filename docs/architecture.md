# Architecture

## Context and boundaries

Becoming has one public demo path and one authenticated reflection path. The trust boundary is the callable backend: browser input is untrusted, Firestore direct writes are denied, and the Gemini credential never enters the frontend bundle.

```text
Public visitor -> static Hosting -> safe local demo result

Authenticated user
  -> Firebase Auth
  -> reCAPTCHA Enterprise App Check
  -> createAnalysis callable
       -> Zod validation
       -> Firestore transaction: idempotency + daily quota + lease
       -> Gemini structured output
       -> Zod output validation
       -> authoritative Firestore result
  -> owner-only Firestore read
```

## Components

| Component          | Responsibility                                                | Trust level              |
| ------------------ | ------------------------------------------------------------- | ------------------------ |
| React/Vite         | Accessible UI, draft state, routes, result rendering          | Untrusted client         |
| Shared contracts   | Stable question IDs and strict request/result schemas         | Validation boundary      |
| Firebase Auth      | Google identity and token lifecycle                           | Managed identity         |
| App Check          | Reduce scripted abuse and replay                              | Abuse-control signal     |
| Callable Functions | Authorization, quota, idempotency, AI orchestration, deletion | Trusted server           |
| Firestore          | Reflection/result persistence and owner reads                 | Authoritative data store |
| Gemini API         | Structured reflection generation                              | External processor       |

## Request lifecycle

1. The browser validates eight bounded responses and creates a UUID idempotency key.
2. A callable request carries Auth and a limited-use App Check token.
3. A Firestore transaction reserves the UUID, hashes the payload, increments the UTC daily counter, writes the private reflection, and creates a 90-second processing lease.
4. Duplicate requests with the same user and hash reuse the record. A mismatched payload is rejected. An active request returns `pending`; an expired or failed lease can be retried.
5. Gemini returns structured JSON. The backend validates it again before marking the record complete.
6. The client reads its own result and can retry, download, share, or delete it.

## Security model

- Firestore rules allow authenticated owners to get their `users`, `reflections`, and `analyses` documents.
- Analysis list queries must include `userId == request.auth.uid` and `limit <= 50`.
- Every direct client write is denied. Admin SDK writes bypass rules only inside trusted Functions.
- App Check is enforced and replay protection is enabled for mutations.
- The emulator-only runtime disables App Check verification because App Check has no local
  emulator; Auth, authorization, validation, rules, and data lifecycle remain exercised. Production
  fails closed with App Check enforcement and replay protection enabled.
- Secrets are supplied to Functions through Secret Manager.
- A strict Hosting CSP, HSTS, MIME sniffing protection, referrer policy, and permissions policy are configured.
- Prompts explicitly treat user reflections as data, not instructions; input/output schemas cap their shape and size.

## Reliability and scaling

- Callable instances are capped at 20 with concurrency 20 to bound downstream cost.
- The per-user UTC quota defaults to 10 analyses/day.
- Idempotency and leases prevent accidental duplicate charge while allowing recovery after worker failure.
- The browser coalesces concurrent calls for the same idempotency key, including React development
  lifecycle replays; the server transaction remains the authoritative duplicate guard.
- Firestore remains the workflow source of truth; the UI can resume pending/completed sessions after refresh.
- Static assets use immutable hashed caching; the HTML shell remains revalidatable.

## Complexity

- Request validation and hashing: `O(C)`, where `C` is total reflection characters; maximum input is bounded.
- Reservation transaction: `O(1)` document reads/writes.
- History query: `O(k)` output for `k <= 50` results, backed by a composite index.
- Account deletion: `O(n)` time for `n` user documents, processed in batches of 400 with `O(400)` peak memory.

## Deliberate trade-offs

- Firebase serverless reduces operational surface, but creates provider coupling and requires disciplined cost alerts.
- Synchronous generation gives a simple UX, but is bounded by callable timeout. For longer models, move generation to Cloud Tasks and keep the current status contract.
- A per-user daily quota prevents basic abuse but is not a global budget. Production must also configure Google Cloud budget alerts and API quotas.
- The development fallback Firebase config is convenient for prototype preview; production fails closed unless explicit environment values and App Check are present.

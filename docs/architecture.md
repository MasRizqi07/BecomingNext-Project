# Architecture

## System boundary

Becoming memiliki public demo statis dan perjalanan personal terautentikasi. Browser selalu dianggap
untrusted. Shared Zod schemas memvalidasi bentuk data, callable Functions menjadi mutation boundary,
dan Firestore menjadi authoritative workflow store. Direct client writes ditolak oleh rules.

```text
Public visitor
  -> Firebase Hosting
  -> static DEMO_ANALYSIS
  -> no Auth, no Firestore write, no Gemini

Authenticated user
  -> React/Vite client
  -> Firebase Auth + limited-use App Check token
  -> callable Function
       -> authorization + shared schema validation
       -> Firestore transaction / bounded batch operation
       -> Gemini only for createAnalysis
       -> server timestamps + authoritative result
  -> owner-only Firestore read or validated callable acknowledgement
```

## Components and ownership

| Component               | Responsibility                                                  | Trust                |
| ----------------------- | --------------------------------------------------------------- | -------------------- |
| React/Vite              | Accessible routes, draft state, rendering, retries              | Untrusted client     |
| Shared contracts        | Bounded reflection/result/check-in request and response schemas | Validation boundary  |
| Firebase Auth           | Google identity and token lifecycle                             | Managed identity     |
| App Check               | Reduce automated abuse and token replay                         | Abuse-control signal |
| Callable Functions      | Authorization, quota, idempotency, AI, check-in, deletion       | Trusted server       |
| Firestore               | Workflow and user-owned records                                 | Authoritative store  |
| Gemini Interactions API | Stateless structured reflection generation                      | External processor   |

## Firestore model

| Collection                  | Key / purpose                                         | Client access        |
| --------------------------- | ----------------------------------------------------- | -------------------- |
| `users`                     | UID; profile metadata and deletion marker             | Owner `get` only     |
| `reflections`               | Analysis UUID; bounded original answers               | Owner read only      |
| `analyses`                  | Analysis UUID; status, lease, result, deletion marker | Owner read/list only |
| `checkIns`                  | SHA-256 of UID + analysis UUID + UTC day              | Owner read/list only |
| `rateLimits`                | UID; daily quota counters                             | None                 |
| `accountDeletionTombstones` | SHA-256 of UID; deletion/expiry timestamps            | None                 |

All application collection writes use the Admin SDK inside Functions. List queries must be owner
filtered and bounded by rules; current client history loads at most 20 analyses.

## Analysis lifecycle

1. The client validates eight bounded responses and creates a UUID idempotency key.
2. `createAnalysis` authenticates the caller and requires App Check outside emulators.
3. `reserveAnalysis` reads the account tombstone/user marker, hashes the payload, verifies UUID reuse,
   applies the per-user UTC quota, creates the private reflection, and reserves a processing lease in
   one transaction.
4. Duplicate user/hash requests reuse the record; payload/key mismatch is rejected. Completed records
   replay their stored result. Failed or expired leases can be reclaimed.
5. The callable invokes Gemini 3.7 Flash through the Interactions API with `store: false` and a
   structured JSON response format.
6. Zod validates provider output. `persistCompletedAnalysis` again checks user/analysis deletion and
   the account tombstone before atomically storing the result.
7. Provider errors mark the analysis failed unless deletion is in progress. A cleanup error is logged
   separately and does not hide the original service error.

The callable timeout is 120 seconds. The reservation lease is 150 seconds so another request cannot
reclaim work while the original invocation can still finish.

## Check-in lifecycle

1. The UI builds one status for every generated daily habit plus bounded mood and optional note.
2. `upsertCheckIn` validates the request and derives a deterministic daily document ID.
3. One transaction reads the deletion tombstone, user marker, analysis, and existing daily check-in.
4. The transaction requires a completed, non-deleting analysis owned by the caller, validates the
   stored result, and requires exact habit-index coverage.
5. The transaction preserves the original `createdAt`, updates `updatedAt`, and writes only
   server-derived `userId`, `dayKey`, and timestamps.
6. The UI changes to success only after the callable response passes the shared acknowledgement schema.

The deterministic key makes same-day retries idempotent and intentionally represents latest daily
state rather than an append-only intra-day history.

## Deletion lifecycle

### One analysis

1. `deleteAnalysis` verifies ownership and sets `deletionRequestedAt` transactionally.
2. In-flight completion sees the marker and cannot resurrect the result.
3. Related check-ins are deleted in batches of at most 400.
4. The reflection and analysis are deleted together.
5. A missing analysis returns idempotent success; a foreign analysis returns permission denied.

### Entire account

1. `deleteMyData` writes the user deletion marker and hashed tombstone before deleting any records.
2. The tombstone contains only `deletionRequestedAt` and `expiresAt`; no email, profile, answer,
   analysis, or check-in content is copied into it.
3. Check-ins, reflections, and analyses are deleted concurrently in bounded batches; user/rate-limit
   records follow.
4. Firebase Auth is deleted last. `auth/user-not-found` is treated as idempotent success.
5. Reservation, analysis completion/failure mutation, and check-in transactions reject the tombstone,
   preventing a still-valid old ID token or delayed function from recreating data.
6. `expiresAt` is 24 hours after deletion request. Firestore TTL performs asynchronous physical
   cleanup; deployment must verify the field override is enabled.

## Security invariants

- `GEMINI_API_KEY` exists only in Secret Manager/Functions; no `VITE_*` AI secret is allowed.
- App Check enforcement and replay consumption fail closed outside the Functions emulator.
- Auth, ownership, schema, and lifecycle checks are server-side; UI state is never authorization.
- Reflection content never enters URL, analytics, share payload by default, or structured logs.
- Gemini input/output is bounded and independently validated; user text is treated as data.
- Hosting config sets CSP, HSTS, MIME sniffing protection, referrer policy, and permissions policy.
- Source maps are opt-in and disabled in normal production builds.
- Account tombstones and rate limits have no client read/write path.

## Reliability and capacity controls

- `createAnalysis`: 120-second timeout, 512 MiB, max 20 instances, concurrency 20.
- `upsertCheckIn`: 30-second timeout, 256 MiB, max 20 instances, concurrency 80.
- deletion callables: bounded instances/concurrency; account deletion has a 120-second timeout.
- Daily analysis quota defaults to 10 per user; cloud budget/API quotas remain separate controls.
- Static assets use immutable hashed caching while the HTML shell remains revalidatable.
- Browser calls for one idempotency key are coalesced; Firestore remains the duplicate authority.
- Emulator suites cover concurrency, quota, lease recovery, payload mismatch, owner isolation,
  authoritative check-in, cascade deletion, and stale-token replay blocking.

## Complexity

| Operation                | Time             | Working memory | Bound                         |
| ------------------------ | ---------------- | -------------- | ----------------------------- |
| Validate/hash reflection | `O(C)`           | `O(C)`         | Schema caps all strings       |
| Reserve/replay analysis  | `O(1)` documents | `O(1)`         | Fixed transaction set         |
| Persist completed result | `O(1)` documents | `O(1)`         | Fixed transaction set         |
| Upsert check-in          | `O(h)`           | `O(h)`         | `2 <= h <= 5`                 |
| History response/render  | `O(k)`           | `O(k)`         | Client uses `k <= 20`         |
| Delete owned data        | `O(n)`           | `O(400)`       | Repeated 400-document batches |
| Tombstone guard          | `O(1)` document  | `O(1)`         | One deterministic lookup      |

## Deliberate trade-offs

- Firebase serverless minimizes operational surface but couples identity, data, compute, and
  deployment to Google Cloud.
- Synchronous AI keeps the UX and status model simple but cannot exceed callable limits. A future
  Cloud Tasks worker can preserve the existing stored status contract.
- Per-user quota controls common abuse, not total spend; production needs cloud budgets and API quota.
- Daily deterministic check-ins avoid duplicates but overwrite state within the same UTC day.
- TTL minimizes retention of the deletion guard, but physical deletion is asynchronous and requires
  an operationally verified policy.
- Local emulators prove application logic and authorization contracts, not real Auth, App Check,
  Gemini behavior, network latency, cloud IAM, or production readiness.

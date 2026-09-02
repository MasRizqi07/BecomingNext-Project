# Production runbook

## Release boundary

Local verification is necessary but never sufficient for promotion. A production release requires a
green CI run on the exact commit, completed staging evidence, real provider checks, monitoring, and
explicit reviewer approval. Record evidence in [release-readiness.md](release-readiness.md).

## Environment separation

Use separate Firebase projects and protected GitHub Environments named `staging` and `production`.

Required GitHub variables:

- `FIREBASE_PROJECT_ID`;
- `VITE_FIREBASE_API_KEY`;
- `VITE_FIREBASE_AUTH_DOMAIN`;
- `VITE_FIREBASE_PROJECT_ID`;
- `VITE_FIREBASE_STORAGE_BUCKET`;
- `VITE_FIREBASE_MESSAGING_SENDER_ID`;
- `VITE_FIREBASE_APP_ID`;
- `VITE_FIRESTORE_DATABASE_ID`;
- `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.

Required GitHub secrets:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`;
- `GCP_SERVICE_ACCOUNT`.

Production must require reviewers and a deployment branch policy. Use Workload Identity Federation;
do not store service-account JSON. Grant only roles needed for Hosting, Firestore rules/indexes/TTL,
Functions, Artifact Registry, service-account impersonation, and access to the existing
`GEMINI_API_KEY` secret.

## Supported toolchains

- Root/CI: Node 24 and npm 10+.
- Functions runtime/build validation: Node 22.
- Firestore Emulator: Java 21+.
- Public browser gate: Playwright Chromium, Firefox, and WebKit at desktop/mobile viewports.
- Visual baseline gate: Windows/Chromium desktop and mobile through the dedicated CI/deploy job.
- Authenticated emulator gate: Google Chrome channel.

Before release:

```bash
npm ci
npm --prefix functions ci
npx playwright install --with-deps chromium firefox webkit chrome
npm run verify:full
```

## First staging deployment

1. Create Firestore in or near `asia-southeast1` and confirm `VITE_FIRESTORE_DATABASE_ID`.
2. Enable Google Authentication and add the Hosting domains to authorized domains.
3. Register the web app with reCAPTCHA Enterprise App Check.
4. Store the provider key:

   ```bash
   npx firebase-tools functions:secrets:set GEMINI_API_KEY --project <staging-project-id>
   ```

5. Configure `GEMINI_MODEL` and `DAILY_ANALYSIS_LIMIT` only when deviating from documented defaults.
6. Configure billing budgets, Gemini quota, Functions instance alerts, Firestore usage alerts, and
   log-based metrics.
7. Run `npm run verify:full` on Node 24. Validate Functions type, unit, transaction, build, and
   authenticated lifecycle gates separately on Node 22. CI and deploy workflows enforce both
   toolchains.
8. Dispatch `.github/workflows/deploy.yml` for `staging`. The workflow intentionally deploys
   Firestore rules, indexes, and TTL policy before Functions and Hosting.
9. In Firebase/Google Cloud console, verify:

   - composite indexes for `analyses` and `checkIns` are ready;
   - TTL is enabled on `accountDeletionTombstones.expiresAt`;
   - all four callables use the expected region/runtime/options;
   - App Check enforcement is enabled for production callables;
   - the Hosting release has the expected security headers.

10. Execute every staging smoke item below and attach evidence to the release record.

## Staging smoke checklist

### Public and UI

- Landing, How it works, Privacy, Demo, and 404 render without console errors.
- Desktop/mobile navigation, locked single-dark theme, keyboard focus, reduced motion, and dialog/drawer
  isolation behave correctly.
- Demo performs no Auth-required write and no Gemini request.
- Run Lighthouse mobile: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 90.

### Identity and isolation

- Real Google sign-in works on the deployed domain.
- App Check metrics report valid tokens; a missing/invalid token is rejected.
- A second account cannot read a known analysis/check-in ID owned by the first account.
- Firestore direct writes to user/application collections are rejected.

### Analysis lifecycle

- Eight answers submit exactly one analysis when double-clicked/retried.
- One real Gemini 3.7 Flash response conforms to schema; record model, latency, token usage, and request
  correlation identifiers without reflection content.
- Refreshing a pending analysis resumes authoritative status.
- A simulated/recoverable failure can retry with the same UUID without another quota charge.
- Download/share exclude original answers and private URLs.

### Check-in and scoped deletion

- A completed result saves one check-in with exact habit coverage, mood, note, server timestamps, and
  the expected UTC day.
- Re-saving on the same UTC day updates the same deterministic record.
- UI success appears only after server acknowledgement.
- Deleting one analysis removes its reflection and all linked check-ins while preserving the account
  and other analyses.

### Account deletion

- Delete requires typed confirmation and explains the 24-hour anti-replay guard.
- Deletion removes check-ins, reflections, analyses, profile, rate limit, and Firebase Auth account.
- The server-only tombstone contains only deletion/expiry timestamps under a hashed document ID.
- Rules prevent any client access to tombstones.
- A request using the pre-deletion ID token cannot reserve/complete an analysis or save a check-in.
- Confirm the tombstone becomes TTL-eligible after 24 hours; physical cleanup timing is asynchronous.

### Observability

- Logs contain `Analysis completed`, `Analysis generation failed`, `Check-in saved`, and
  `User data deleted` only where expected.
- Logs do not contain answers, generated result bodies, API keys, or raw provider payloads.
- Alerts and dashboards receive test signals.

## Monitoring targets

| Signal                     | Initial target / alert                         |
| -------------------------- | ---------------------------------------------- |
| Callable availability      | >= 99.5% over 30 days                          |
| Completed analysis latency | p95 < 60 seconds                               |
| Function error ratio       | > 5% for 10 minutes                            |
| AI validation failures     | > 3 in 15 minutes or sustained rise            |
| Check-in failure ratio     | > 3% for 10 minutes                            |
| Deletion failure           | Alert immediately; privacy-impacting operation |
| Functions instances        | Near configured max                            |
| Firestore reads/writes     | Abnormal baseline increase                     |
| Daily cloud spend          | Budget notifications at 50%, 80%, 100%         |

Never add reflection, result, note, or provider key content to structured logs.

## Incident response

### AI provider failure

Check Gemini status/quota and Functions logs. The analysis should be `failed`, enabling safe retry
with the same idempotency key. If broad, reduce `maxInstances`, disable the personalized CTA, or use
the documented `GEMINI_MODEL` rollback lever. Keep the static demo available.

### Check-in write failure

Confirm callable health, App Check, analysis ownership/status, stored result schema, and Firestore
transaction errors. Do not implement a client-write fallback. The UI must remain unsaved/error until
the authoritative acknowledgement succeeds.

### Partial account deletion

1. Confirm the user deletion marker and hashed tombstone exist.
2. Keep mutation callables enabled so the tombstone continues to block stale-token writes.
3. Re-run the idempotent deletion callable or use a narrowly scoped admin repair for the exact UID.
4. Verify each collection and Auth separately; record document counts, not private content.
5. Do not delete the tombstone early. Escalate as a privacy incident if owned content remains.

### Cost or abuse spike

Inspect App Check validity, auth principals, rate-limit documents, Functions instances, Firestore
usage, and Gemini quota. Lower `DAILY_ANALYSIS_LIMIT`, reduce instance caps, or temporarily disable
personalized analysis. Never expose a browser provider key as a bypass.

### Data access concern

Disable affected accounts, preserve audit logs, reproduce with rules tests, and determine whether
deployed rules or Admin credentials were involved. Direct browser writes must remain denied.

## Rollback

1. Identify the last known-good commit and deployment run.
2. Redeploy through the protected workflow; never patch production files manually.
3. Use Hosting release history for a Hosting-only rollback.
4. Keep Functions backward-compatible with stored documents. If rollback crosses a schema change,
   deploy a compatibility version first.
5. Do not roll back Firestore rules to a version that permits client writes.
6. Do not remove the tombstone TTL/index policy or stale-token guard while newer clients/functions may
   still exist.
7. Re-run the full smoke checklist and record the incident timeline.

## Backup and retention

- Application records are retained until user deletion or an operator-enforced policy.
- The anti-replay tombstone expires after 24 hours and is physically removed asynchronously by TTL.
- Scheduled Firestore exports require a separate, documented retention and deletion policy before
  production launch; deleting live data does not automatically remove existing exports.
- Encrypt backup storage with managed controls, restrict access, and regularly test restoration into
  a non-production project.
- Legal/privacy review must approve user-facing policy, provider terms, contact details, and backup
  retention before production.

## Production go/no-go

Promotion is **no-go** if any item is missing: green exact-commit CI, full staging checklist, real
Auth/App Check/Gemini evidence, owner-isolation proof, deletion proof, TTL policy verification,
monitoring/alerts, backup retention decision, Lighthouse targets, privacy/legal review, or explicit
reviewer approval.

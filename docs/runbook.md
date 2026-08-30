# Production runbook

## Environment separation

Use separate Firebase projects and GitHub Environments named `staging` and `production`. Each GitHub Environment must define:

- Variables: `FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIRESTORE_DATABASE_ID`, `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
- Secrets: `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.
- Production protection: required reviewers and deployment branch policy.

The deploy identity needs only the roles required for Firebase Hosting, Firestore rules/indexes, Cloud Functions deployment, Artifact Registry, service-account impersonation, and access to the existing `GEMINI_API_KEY` secret. Prefer Workload Identity Federation; do not store a service-account JSON key.

## First deployment

1. Enable Firebase Authentication with Google and add the real Hosting domains to authorized domains.
2. Create Firestore in or near `asia-southeast1` and verify the configured database ID.
3. Register the web app with App Check using reCAPTCHA Enterprise.
4. Set `GEMINI_API_KEY` with `firebase functions:secrets:set`.
5. Configure billing budgets, Gemini API quota, Functions max-instance monitoring, and Firestore usage alerts.
6. Run `npm run verify:full` on Node 24 and Java 21+.
7. Dispatch `.github/workflows/deploy.yml` to `staging`.
8. Execute the staging checklist below. Then dispatch to `production` with reviewer approval.

## Release smoke checklist

- Landing and demo render at desktop and mobile widths with no console errors.
- Sign-in succeeds on the deployed domain.
- A complete eight-question submission creates exactly one analysis when the request is retried.
- Pending analysis survives refresh and reaches either completed or a recoverable error.
- History returns only the current user's records.
- A second test account cannot read another user's known analysis ID.
- Download/share actions work; delete removes both analysis and reflection.
- Account deletion removes Auth, profile, rate limit, reflections, and analyses.
- App Check metrics show valid tokens. Enforce only after legitimate clients are confirmed.
- Logs do not contain reflection answers or API keys.

## Monitoring targets

| Signal                     | Initial target / alert                           |
| -------------------------- | ------------------------------------------------ |
| Callable availability      | >= 99.5% over 30 days                            |
| Completed analysis latency | p95 < 60 seconds                                 |
| Function error ratio       | alert above 5% for 10 minutes                    |
| AI validation failure      | alert on sustained increase or > 3 in 15 minutes |
| Functions instances        | alert near configured max of 20                  |
| Daily cloud spend          | budget alerts at 50%, 80%, and 100%              |

Create log-based metrics from `Analysis completed` and `Analysis generation failed`. Never add the reflection payload to structured logs.

## Incident response

### AI provider failure

Confirm Gemini status/quota and function error logs. The record is marked `failed`, so the same idempotency key can retry without creating another reflection or daily quota charge. If the failure is broad, disable the personalized CTA or lower `maxInstances`; the public demo remains available.

### Cost or abuse spike

Check App Check validity, auth principals, rate-limit documents, Functions instance count, and Gemini quota. Lower `DAILY_ANALYSIS_LIMIT`, reduce `maxInstances`, or temporarily disable the callable. Do not expose a browser API key as a bypass.

### Data access concern

Disable affected accounts, preserve audit logs, reproduce against Firestore rules tests, and determine whether Admin SDK credentials or deployed rules were involved. Direct browser writes should remain denied.

## Rollback

1. Identify the last known-good Git commit and its deployment run.
2. Redeploy that commit through the same protected workflow; do not edit production files manually.
3. Use Firebase Hosting release history for an immediate hosting rollback if only the static client is affected.
4. Functions changes must remain backward-compatible with stored documents. If rollback crosses a schema change, deploy a compatibility function before reverting.
5. Re-run the smoke checklist and record the incident timeline.

## Backup and retention

Enable scheduled Firestore exports to a locked-down Cloud Storage bucket and regularly test restoration into a non-production project. Set a documented retention period for reflections and analyses before launch; the application currently retains data until user deletion or operator policy enforcement.

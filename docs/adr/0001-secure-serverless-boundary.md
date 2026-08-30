# ADR 0001: Secure serverless analysis boundary

- Status: accepted
- Date: 2026-08-30

## Context

The prototype called Gemini from the browser and had no authoritative write boundary. That exposed the provider credential, allowed client-controlled documents, and could duplicate costly requests.

## Decision

Use Firebase Authentication and App Check at the client boundary, callable Cloud Functions for every mutation, Secret Manager for the Gemini credential, Firestore as the workflow source of truth, and shared strict Zod contracts. Reserve each request in a transaction using a client UUID, payload hash, quota counter, and expiring lease.

## Consequences

- Provider credentials and privileged writes remain server-side.
- Retries are safe and recoverable, while cost and concurrency are bounded.
- The deployment depends on Firebase/Google Cloud services and correct App Check rollout.
- Long-running or high-volume generation may later require Cloud Tasks, but the stored status contract can remain stable.

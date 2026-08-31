# ADR 0002: Gemini model and API interface

- Status: Accepted
- Date: 2026-08-31

## Context

Gemini 3.7 Flash is a stable GA model and supersedes Gemini 3.6 Flash for new Flash workloads.
Google now recommends the Interactions API for new integrations and classifies `generateContent` as
legacy. Becoming sends sensitive reflections in a single stateless structured-output request.

## Decision

- Default `GEMINI_MODEL` to `gemini-3.7-flash`, while retaining the runtime parameter as a rollback
  lever.
- Use `@google/genai` 2.x and `client.interactions.create`.
- Set `store: false`; the application does not use server-side conversation state.
- Request JSON through `response_format`, then independently validate the decoded value with Zod.
- Do not set removed sampling parameters. Retain the model's default thinking level until staging
  latency, quality, and token-use evidence supports an explicit override.

## Consequences

- Staging must validate output quality, latency, token usage, and schema conformance with the real
  model before production promotion.
- Operators can temporarily set `GEMINI_MODEL=gemini-3.6-flash` without a code rollback.
- `store: false` prevents Interactions API state retention; normal provider processing and the
  application's own Firestore retention policy still apply.

## References

- https://ai.google.dev/gemini-api/docs/latest-model
- https://ai.google.dev/gemini-api/docs/migrate-to-interactions
- https://ai.google.dev/gemini-api/docs/interactions-overview

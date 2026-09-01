# ADR 0003: Authoritative daily check-in and account-deletion guard

- Status: Accepted
- Date: 2026-09-01

## Context

V2 adds a daily habit check-in linked to a completed analysis. A client-only success state would let
users see data as saved even when ownership, payload coverage, or persistence had not been verified.
Account deletion also has a race: deleting Firebase Auth revokes refresh tokens, but an already-issued
ID token can remain usable until it expires. A delayed analysis or a client replaying that token must
not recreate documents after deletion.

## Decision

- Persist check-ins only through the `upsertCheckIn` callable. Direct Firestore writes remain denied.
- Use a deterministic SHA-256 document key derived from user ID, analysis ID, and UTC day. Repeated
  saves on the same day update one record instead of creating duplicates.
- In one transaction, verify the authenticated owner, require a completed and non-deleting analysis,
  validate the stored analysis result, and require exactly one status for every generated habit.
- Treat Firestore as authoritative: the UI reports success only after the callable acknowledgement
  passes the shared response schema.
- Cascade check-ins when an analysis or account is deleted.
- Before account cleanup, write a server-only deletion marker and a tombstone keyed by a one-way
  SHA-256 hash of the Firebase UID. The tombstone contains only deletion and expiry timestamps.
- Keep the tombstone valid for 24 hours, reject analysis reservation/completion and check-in writes
  while it exists, and configure Firestore TTL on `expiresAt` for asynchronous cleanup.
- Delete the Firebase Auth user last, after application data cleanup succeeds.

## Consequences

- Check-in writes are idempotent per user, analysis, and UTC day, but the current product intentionally
  stores only the latest state for that day rather than an intra-day event history.
- A check-in transaction is `O(h)` for `h` habits; the schema caps `h` at five, so operational cost is
  bounded.
- Account/analysis deletion is `O(n)` in owned documents and uses batches of at most 400.
- The tombstone is deliberately minimal but is still an operational identifier. Privacy copy must
  disclose its purpose and expiry, and operators must verify the TTL policy after deployment.
- Firestore TTL deletion is asynchronous. Code must rely on `expiresAt` as the retention boundary and
  must not promise deletion at an exact second.

## Alternatives considered

- **Client writes:** rejected because ownership, completeness, and server timestamps would be
  client-controlled.
- **Random check-in IDs:** rejected because retries and repeated daily saves could create duplicates.
- **Delete Auth first without a tombstone:** rejected because an already-issued ID token or an
  in-flight function could recreate user data.
- **Permanent deny-list:** rejected because it retains an identifier indefinitely and complicates
  legitimate future account recreation.

## Rollback

The check-in navigation can be hidden while leaving stored records readable. The callable can be
rolled back independently as long as rules continue to deny direct writes. The deletion tombstone
must not be removed until all deployed mutation paths are known to reject stale-token replays.

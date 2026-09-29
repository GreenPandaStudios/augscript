# August web release review

Reviewed on 2026-09-28 against [the confirmed implementation plan](web-implementation-plan.md). The repository had no existing commit, so the initial implementation was reviewed as a whole. Independent Standards and Spec reviewers performed follow-up checks after fixes. Compiler, native socket, browser transport, and same-file endpoint regressions verify the runtime behavior.

## Standards

All six original invariant findings are addressed: duplicate input safety, inherited child cancellation/deadlines, lock progress, owned capture lifetime, delayed checked errors, and response status errors. Follow-up fixes narrow cleanup to the explicit scope boundary, check possible sibling failures at waits, and observe all selected children during failed grouped waits. No concrete new defects were found in the final narrow review.

Policy emission now uses named native identifiers instead of duplicated numeric ordering.

## Spec

All five original and two follow-up findings are addressed: malformed duplicate inputs, cancellation while awaiting children, lossless int64 action values, complex typed forms, empty endpoint-test streams, string-valued Json form encoding, and post-yield failures in endpoint tests. No new defects were found in the final narrow review.

## Verification

`npm run check` passes. The final full `npm test` run passes all 185 tests, including native HTTP/1.1, TLS HTTP/2 and HTTP/3, independent signature verification, and the same-application OpenID Connect login/session/logout flow.

## Remaining scope

See [the gap ledger](web-library-gaps.md). Multicore worker and channel/broadcast changes were rejected by automatic approval review and have not been applied; explicit approval requests remain pending. This release uses cooperative scheduling on one OS thread. Broader HTTP and OpenID Connect certification, persistent accounts, federation, key rotation, inbound streams, and other recorded follow-up capabilities remain outside the verified proof.

Final review: Standards 0 unresolved findings; Spec 0 unresolved findings within the implemented scope. Pending approval scope remains incomplete.

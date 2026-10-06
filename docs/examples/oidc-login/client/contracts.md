---
title: "client/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/contracts.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](contracts.md)
- [`client/endpoints.aug`](endpoints.md)
- [`client/export.aug`](export.md)
- [`client/login.aug`](login.md)
- [`client/logout.aug`](logout.md)
- [`client/protocol.aug`](protocol.md)
- [`client/session.aug`](session.md)
- [`client/views.aug`](views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](../provider/authorization.md)
- [`provider/contracts.aug`](../provider/contracts.md)
- [`provider/credentials.aug`](../provider/credentials.md)
- [`provider/discovery.aug`](../provider/discovery.md)
- [`provider/export.aug`](../provider/export.md)
- [`provider/token.aug`](../provider/token.md)
- [`provider/userinfo.aug`](../provider/userinfo.md)
- [`provider/views.aug`](../provider/views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMjMyZjY4MDQyMjQ4YTFmOGQ4NzU1ZmE4MGMwN2Y2OWFjYTIxMjU2YTU1NTE0MTZmYWE1MzQ2YTZjY2ZmZTAxYSIsImZvcm1hdHRlZFNoYTI1NiI6ImIxODg5MmQ0MWUzMzdhNGMyYTYzMDA4OWIxOTFkNjQ3ZDRiNTcxMWVlYzE3ZDk0NzA1NTc3OWFlNGQxMDc4YTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dpblRyYW5zYWN0aW9uIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1TZXNzaW9uQ2xhaW1zIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Mb2dvdXRGb3JtIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6OCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1TZXNzaW9uRXJyb3IiXX1dfQ
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error:
    pass
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMjMyZjY4MDQyMjQ4YTFmOGQ4NzU1ZmE4MGMwN2Y2OWFjYTIxMjU2YTU1NTE0MTZmYWE1MzQ2YTZjY2ZmZTAxYSIsImZvcm1hdHRlZFNoYTI1NiI6ImIzZDJmMjMwNTU0N2EwNmE1ZmU1NDk0Zjc3MDEwMDlkMjVkMGFiN2YyNjg2ZDc4MjlhNjBmOTQ0MDEzNzZjM2UiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dpblRyYW5zYWN0aW9uIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1TZXNzaW9uQ2xhaW1zIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Mb2dvdXRGb3JtIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6OSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1TZXNzaW9uRXJyb3IiXX1dfQ
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](contracts-diagrams.md)

### `LoginTransaction` · immutable record · [source](contracts.md#source-L3) {#symbol-LoginTransaction}

Browser-bound client state, nonce and PKCE verifier, consumed by the callback. It takes `state`, `nonce`, and `verifier` as strings, kept read-only and `expires` as an integer, kept read-only.

### `SessionClaims` · immutable record · [source](contracts.md#source-L5) {#symbol-SessionClaims}

Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. It takes `iss`, `sub`, and `aud` as strings, kept read-only, `exp` and `iat` as integers, kept read-only, and `jti`, `csrf`, and `name` as strings, kept read-only.

### `LogoutForm` · immutable record · [source](contracts.md#source-L6) {#symbol-LogoutForm}

It takes `csrf` as a string, kept read-only.

### `SessionError` · class · [source](contracts.md#source-L7) {#symbol-SessionError}

It implements `Error`.

::::

:::::

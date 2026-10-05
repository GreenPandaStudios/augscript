---
title: "provider/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/contracts.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiN2VkMzZhZDYyMTYzM2M1NTRlNGEyYTQzMTdjMjU5MTJiODNiZjhhNjg4MmJiYjljODM4N2ZhYmMzOWI3ZmMwNCIsImZvcm1hdHRlZFNoYTI1NiI6IjFiZjZlNzRjMmVkMGFiNDE3NjlkZDVhMTU2ZjA1ZDJmNTU4ODllMjIyYTFiMjhkOGEwNGRlZGIyOGVmMjc2ODEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXV0aG9yaXphdGlvblJlcXVlc3QiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BdXRob3JpemF0aW9uQ29kZSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUlkQ2xhaW1zIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQWNjZXNzR3JhbnQiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Ub2tlblJlc3BvbnNlIl19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtT0F1dGhFcnJvciJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVRva2VuRm9ybSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMSwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUxvZ2luRm9ybSJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVVzZXJJbmZvIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9naW5FcnJvciJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MTYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvZGVFcnJvciJdfV19
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** A provider request is bound to a browser cookie, a form CSRF token, and a registered client. */
record AuthorizationRequest(string clientId, string redirectUri, string state, string nonce, string challenge, string browser, string csrf, int expires)
/** Codes are short-lived, single-use and bound to a redirect URI and S256 challenge. */
record AuthorizationCode(string clientId, string redirectUri, string challenge, string nonce, string subject, string name, int expires)
record IdClaims(string iss, string sub, string aud, int exp, int iat, string nonce, string name)
record AccessGrant(string subject, string name, int expires)
record TokenResponse(string token_type, string access_token, string id_token, int expires_in, string scope)
record OAuthError(string error, string error_description)
record TokenForm(string grant_type, string code, string redirect_uri, string client_id, string code_verifier)
record LoginForm(string request_id, string csrf, string username, string password)
record UserInfo(string sub, string name)
LoginError() implements Error:
    pass
CodeError() implements Error:
    pass
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiN2VkMzZhZDYyMTYzM2M1NTRlNGEyYTQzMTdjMjU5MTJiODNiZjhhNjg4MmJiYjljODM4N2ZhYmMzOWI3ZmMwNCIsImZvcm1hdHRlZFNoYTI1NiI6IjY0MTE0YmI3N2YyNjc1NWZmYWU5YTBhZGQxYjM4NzFkMTNhYmFkM2FhZmJmOWNmNWI3NjFkZTVlYzUyOGVlNTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXV0aG9yaXphdGlvblJlcXVlc3QiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BdXRob3JpemF0aW9uQ29kZSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUlkQ2xhaW1zIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQWNjZXNzR3JhbnQiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Ub2tlblJlc3BvbnNlIl19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtT0F1dGhFcnJvciJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVRva2VuRm9ybSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMSwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUxvZ2luRm9ybSJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVVzZXJJbmZvIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9naW5FcnJvciJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNiwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvZGVFcnJvciJdfV19
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** A provider request is bound to a browser cookie, a form CSRF token, and a registered client. */
record AuthorizationRequest(string clientId, string redirectUri, string state, string nonce, string challenge, string browser, string csrf, int expires)
/** Codes are short-lived, single-use and bound to a redirect URI and S256 challenge. */
record AuthorizationCode(string clientId, string redirectUri, string challenge, string nonce, string subject, string name, int expires)
record IdClaims(string iss, string sub, string aud, int exp, int iat, string nonce, string name)
record AccessGrant(string subject, string name, int expires)
record TokenResponse(string token_type, string access_token, string id_token, int expires_in, string scope)
record OAuthError(string error, string error_description)
record TokenForm(string grant_type, string code, string redirect_uri, string client_id, string code_verifier)
record LoginForm(string request_id, string csrf, string username, string password)
record UserInfo(string sub, string name)
LoginError() implements Error {
    pass
}
CodeError() implements Error {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `AuthorizationRequest` · immutable record · [source](contracts.md#source-L3) {#symbol-AuthorizationRequest}

A provider request is bound to a browser cookie, a form CSRF token, and a registered client. It takes `clientId`, `redirectUri`, `state`, `nonce`, `challenge`, `browser`, and `csrf` as strings, kept read-only and `expires` as an integer, kept read-only.

### `AuthorizationCode` · immutable record · [source](contracts.md#source-L5) {#symbol-AuthorizationCode}

Codes are short-lived, single-use and bound to a redirect URI and S256 challenge. It takes `clientId`, `redirectUri`, `challenge`, `nonce`, `subject`, and `name` as strings, kept read-only and `expires` as an integer, kept read-only.

### `IdClaims` · immutable record · [source](contracts.md#source-L6) {#symbol-IdClaims}

It takes `iss`, `sub`, and `aud` as strings, kept read-only, `exp` and `iat` as integers, kept read-only, and `nonce` and `name` as strings, kept read-only.

### `AccessGrant` · immutable record · [source](contracts.md#source-L7) {#symbol-AccessGrant}

It takes `subject` and `name` as strings, kept read-only and `expires` as an integer, kept read-only.

### `TokenResponse` · immutable record · [source](contracts.md#source-L8) {#symbol-TokenResponse}

It takes `token_type`, `access_token`, and `id_token` as strings, kept read-only, `expires_in` as an integer, kept read-only, and `scope` as a string, kept read-only.

### `OAuthError` · immutable record · [source](contracts.md#source-L9) {#symbol-OAuthError}

It takes `error` and `error_description` as strings, kept read-only.

### `TokenForm` · immutable record · [source](contracts.md#source-L10) {#symbol-TokenForm}

It takes `grant_type`, `code`, `redirect_uri`, `client_id`, and `code_verifier` as strings, kept read-only.

### `LoginForm` · immutable record · [source](contracts.md#source-L11) {#symbol-LoginForm}

It takes `request_id`, `csrf`, `username`, and `password` as strings, kept read-only.

### `UserInfo` · immutable record · [source](contracts.md#source-L12) {#symbol-UserInfo}

It takes `sub` and `name` as strings, kept read-only.

### `LoginError` · class · [source](contracts.md#source-L13) {#symbol-LoginError}

It implements `Error`.

### `CodeError` · class · [source](contracts.md#source-L15) {#symbol-CodeError}

It implements `Error`.

::::

:::::

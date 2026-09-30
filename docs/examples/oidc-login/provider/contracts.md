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

```aug [Indentation]
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

```aug [Braces]
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

<a id="symbol-AuthorizationRequest"></a>
### `AuthorizationRequest` · immutable record · [source](contracts.md#code)

A provider request is bound to a browser cookie, a form CSRF token, and a registered client. It takes `clientId`, `redirectUri`, `state`, `nonce`, `challenge`, `browser`, and `csrf` as strings, kept read-only and `expires` as an integer, kept read-only.

<a id="symbol-AuthorizationCode"></a>
### `AuthorizationCode` · immutable record · [source](contracts.md#code)

Codes are short-lived, single-use and bound to a redirect URI and S256 challenge. It takes `clientId`, `redirectUri`, `challenge`, `nonce`, `subject`, and `name` as strings, kept read-only and `expires` as an integer, kept read-only.

<a id="symbol-IdClaims"></a>
### `IdClaims` · immutable record · [source](contracts.md#code)

It takes `iss`, `sub`, and `aud` as strings, kept read-only, `exp` and `iat` as integers, kept read-only, and `nonce` and `name` as strings, kept read-only.

<a id="symbol-AccessGrant"></a>
### `AccessGrant` · immutable record · [source](contracts.md#code)

It takes `subject` and `name` as strings, kept read-only and `expires` as an integer, kept read-only.

<a id="symbol-TokenResponse"></a>
### `TokenResponse` · immutable record · [source](contracts.md#code)

It takes `token_type`, `access_token`, and `id_token` as strings, kept read-only, `expires_in` as an integer, kept read-only, and `scope` as a string, kept read-only.

<a id="symbol-OAuthError"></a>
### `OAuthError` · immutable record · [source](contracts.md#code)

It takes `error` and `error_description` as strings, kept read-only.

<a id="symbol-TokenForm"></a>
### `TokenForm` · immutable record · [source](contracts.md#code)

It takes `grant_type`, `code`, `redirect_uri`, `client_id`, and `code_verifier` as strings, kept read-only.

<a id="symbol-LoginForm"></a>
### `LoginForm` · immutable record · [source](contracts.md#code)

It takes `request_id`, `csrf`, `username`, and `password` as strings, kept read-only.

<a id="symbol-UserInfo"></a>
### `UserInfo` · immutable record · [source](contracts.md#code)

It takes `sub` and `name` as strings, kept read-only.

<a id="symbol-LoginError"></a>
### `LoginError` · class · [source](contracts.md#code)

It implements `Error`.

<a id="symbol-CodeError"></a>
### `CodeError` · class · [source](contracts.md#code)

It implements `Error`.

::::

:::::

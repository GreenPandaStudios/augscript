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

A provider request is bound to a browser cookie, a form CSRF token, and a registered client.

**Inputs:** Take `clientId` (`string`); store read-only. Take `redirectUri` (`string`); store read-only. Take `state` (`string`); store read-only. Take `nonce` (`string`); store read-only. Take `challenge` (`string`); store read-only. Take `browser` (`string`); store read-only. Take `csrf` (`string`); store read-only. Take `expires` (`int`); store read-only.

<a id="symbol-AuthorizationCode"></a>
### `AuthorizationCode` · immutable record · [source](contracts.md#code)

Codes are short-lived, single-use and bound to a redirect URI and S256 challenge.

**Inputs:** Take `clientId` (`string`); store read-only. Take `redirectUri` (`string`); store read-only. Take `challenge` (`string`); store read-only. Take `nonce` (`string`); store read-only. Take `subject` (`string`); store read-only. Take `name` (`string`); store read-only. Take `expires` (`int`); store read-only.

<a id="symbol-IdClaims"></a>
### `IdClaims` · immutable record · [source](contracts.md#code)

**Inputs:** Take `iss` (`string`); store read-only. Take `sub` (`string`); store read-only. Take `aud` (`string`); store read-only. Take `exp` (`int`); store read-only. Take `iat` (`int`); store read-only. Take `nonce` (`string`); store read-only. Take `name` (`string`); store read-only.

<a id="symbol-AccessGrant"></a>
### `AccessGrant` · immutable record · [source](contracts.md#code)

**Inputs:** Take `subject` (`string`); store read-only. Take `name` (`string`); store read-only. Take `expires` (`int`); store read-only.

<a id="symbol-TokenResponse"></a>
### `TokenResponse` · immutable record · [source](contracts.md#code)

**Inputs:** Take `token_type` (`string`); store read-only. Take `access_token` (`string`); store read-only. Take `id_token` (`string`); store read-only. Take `expires_in` (`int`); store read-only. Take `scope` (`string`); store read-only.

<a id="symbol-OAuthError"></a>
### `OAuthError` · immutable record · [source](contracts.md#code)

**Inputs:** Take `error` (`string`); store read-only. Take `error_description` (`string`); store read-only.

<a id="symbol-TokenForm"></a>
### `TokenForm` · immutable record · [source](contracts.md#code)

**Inputs:** Take `grant_type` (`string`); store read-only. Take `code` (`string`); store read-only. Take `redirect_uri` (`string`); store read-only. Take `client_id` (`string`); store read-only. Take `code_verifier` (`string`); store read-only.

<a id="symbol-LoginForm"></a>
### `LoginForm` · immutable record · [source](contracts.md#code)

**Inputs:** Take `request_id` (`string`); store read-only. Take `csrf` (`string`); store read-only. Take `username` (`string`); store read-only. Take `password` (`string`); store read-only.

<a id="symbol-UserInfo"></a>
### `UserInfo` · immutable record · [source](contracts.md#code)

**Inputs:** Take `sub` (`string`); store read-only. Take `name` (`string`); store read-only.

<a id="symbol-LoginError"></a>
### `LoginError` · class · [source](contracts.md#code)

Implements `Error`.

<a id="symbol-CodeError"></a>
### `CodeError` · class · [source](contracts.md#code)

Implements `Error`.

::::

:::::

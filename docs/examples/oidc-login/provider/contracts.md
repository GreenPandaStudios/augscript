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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) is an immutable record.
- [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) is an immutable record.
- [`IdClaims`](contracts.md#symbol-IdClaims) is an immutable record.
- [`AccessGrant`](contracts.md#symbol-AccessGrant) is an immutable record.
- [`TokenResponse`](contracts.md#symbol-TokenResponse) is an immutable record.
- [`OAuthError`](contracts.md#symbol-OAuthError) is an immutable record.
- [`TokenForm`](contracts.md#symbol-TokenForm) is an immutable record.
- [`LoginForm`](contracts.md#symbol-LoginForm) is an immutable record.
- [`UserInfo`](contracts.md#symbol-UserInfo) is an immutable record.
- [`LoginError`](contracts.md#symbol-LoginError) is a class implementing `Error`.
- [`CodeError`](contracts.md#symbol-CodeError) is a class implementing `Error`.

### `AuthorizationRequest` {#symbol-AuthorizationRequest}

[source](contracts.md#code)

Immutable record.

**Author documentation**

A provider request is bound to a browser cookie, a form CSRF token, and a registered client.

**Inputs**

- `clientId` (`string`) — required labeled input — stored as `clientId` and read-only after initialization.
- `redirectUri` (`string`) — required labeled input — stored as `redirectUri` and read-only after initialization.
- `state` (`string`) — required labeled input — stored as `state` and read-only after initialization.
- `nonce` (`string`) — required labeled input — stored as `nonce` and read-only after initialization.
- `challenge` (`string`) — required labeled input — stored as `challenge` and read-only after initialization.
- `browser` (`string`) — required labeled input — stored as `browser` and read-only after initialization.
- `csrf` (`string`) — required labeled input — stored as `csrf` and read-only after initialization.
- `expires` (`int`) — required labeled input — stored as `expires` and read-only after initialization.

### `AuthorizationCode` {#symbol-AuthorizationCode}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Codes are short-lived, single-use and bound to a redirect URI and S256 challenge.

**Inputs**

- `clientId` (`string`) — required labeled input — stored as `clientId` and read-only after initialization.
- `redirectUri` (`string`) — required labeled input — stored as `redirectUri` and read-only after initialization.
- `challenge` (`string`) — required labeled input — stored as `challenge` and read-only after initialization.
- `nonce` (`string`) — required labeled input — stored as `nonce` and read-only after initialization.
- `subject` (`string`) — required labeled input — stored as `subject` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.
- `expires` (`int`) — required labeled input — stored as `expires` and read-only after initialization.

### `IdClaims` {#symbol-IdClaims}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `iss` (`string`) — required labeled input — stored as `iss` and read-only after initialization.
- `sub` (`string`) — required labeled input — stored as `sub` and read-only after initialization.
- `aud` (`string`) — required labeled input — stored as `aud` and read-only after initialization.
- `exp` (`int`) — required labeled input — stored as `exp` and read-only after initialization.
- `iat` (`int`) — required labeled input — stored as `iat` and read-only after initialization.
- `nonce` (`string`) — required labeled input — stored as `nonce` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.

### `AccessGrant` {#symbol-AccessGrant}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `subject` (`string`) — required labeled input — stored as `subject` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.
- `expires` (`int`) — required labeled input — stored as `expires` and read-only after initialization.

### `TokenResponse` {#symbol-TokenResponse}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `token_type` (`string`) — required labeled input — stored as `token_type` and read-only after initialization.
- `access_token` (`string`) — required labeled input — stored as `access_token` and read-only after initialization.
- `id_token` (`string`) — required labeled input — stored as `id_token` and read-only after initialization.
- `expires_in` (`int`) — required labeled input — stored as `expires_in` and read-only after initialization.
- `scope` (`string`) — required labeled input — stored as `scope` and read-only after initialization.

### `OAuthError` {#symbol-OAuthError}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `error` (`string`) — required labeled input — stored as `error` and read-only after initialization.
- `error_description` (`string`) — required labeled input — stored as `error_description` and read-only after initialization.

### `TokenForm` {#symbol-TokenForm}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `grant_type` (`string`) — required labeled input — stored as `grant_type` and read-only after initialization.
- `code` (`string`) — required labeled input — stored as `code` and read-only after initialization.
- `redirect_uri` (`string`) — required labeled input — stored as `redirect_uri` and read-only after initialization.
- `client_id` (`string`) — required labeled input — stored as `client_id` and read-only after initialization.
- `code_verifier` (`string`) — required labeled input — stored as `code_verifier` and read-only after initialization.

### `LoginForm` {#symbol-LoginForm}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `request_id` (`string`) — required labeled input — stored as `request_id` and read-only after initialization.
- `csrf` (`string`) — required labeled input — stored as `csrf` and read-only after initialization.
- `username` (`string`) — required labeled input — stored as `username` and read-only after initialization.
- `password` (`string`) — required labeled input — stored as `password` and read-only after initialization.

### `UserInfo` {#symbol-UserInfo}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `sub` (`string`) — required labeled input — stored as `sub` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.

### `LoginError` {#symbol-LoginError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.

### `CodeError` {#symbol-CodeError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

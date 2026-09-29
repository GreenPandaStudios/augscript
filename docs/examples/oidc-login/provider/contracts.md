---
title: "provider/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `AuthorizationRequest` {#symbol-AuthorizationRequest}

[source](contracts.md#code)

Immutable record.

**Author documentation**

A provider request is bound to a browser cookie, a form CSRF token, and a registered client.

**Inputs and dependencies**

- `clientId`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `clientId`. The field is read-only after initialization.
- `redirectUri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `redirectUri`. The field is read-only after initialization.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `state`. The field is read-only after initialization.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `nonce`. The field is read-only after initialization.
- `challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `challenge`. The field is read-only after initialization.
- `browser`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `browser`. The field is read-only after initialization.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `csrf`. The field is read-only after initialization.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires`. The field is read-only after initialization.

### `AuthorizationCode` {#symbol-AuthorizationCode}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Codes are short-lived, single-use and bound to a redirect URI and S256 challenge.

**Inputs and dependencies**

- `clientId`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `clientId`. The field is read-only after initialization.
- `redirectUri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `redirectUri`. The field is read-only after initialization.
- `challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `challenge`. The field is read-only after initialization.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `nonce`. The field is read-only after initialization.
- `subject`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `subject`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires`. The field is read-only after initialization.

### `IdClaims` {#symbol-IdClaims}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `iss`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `iss`. The field is read-only after initialization.
- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `sub`. The field is read-only after initialization.
- `aud`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `aud`. The field is read-only after initialization.
- `exp`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `exp`. The field is read-only after initialization.
- `iat`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `iat`. The field is read-only after initialization.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `nonce`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.

### `AccessGrant` {#symbol-AccessGrant}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `subject`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `subject`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires`. The field is read-only after initialization.

### `TokenResponse` {#symbol-TokenResponse}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `token_type`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `token_type`. The field is read-only after initialization.
- `access_token`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `access_token`. The field is read-only after initialization.
- `id_token`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `id_token`. The field is read-only after initialization.
- `expires_in`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires_in`. The field is read-only after initialization.
- `scope`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `scope`. The field is read-only after initialization.

### `OAuthError` {#symbol-OAuthError}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `error`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `error`. The field is read-only after initialization.
- `error_description`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `error_description`. The field is read-only after initialization.

### `TokenForm` {#symbol-TokenForm}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `grant_type`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `grant_type`. The field is read-only after initialization.
- `code`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `code`. The field is read-only after initialization.
- `redirect_uri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `redirect_uri`. The field is read-only after initialization.
- `client_id`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `client_id`. The field is read-only after initialization.
- `code_verifier`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `code_verifier`. The field is read-only after initialization.

### `LoginForm` {#symbol-LoginForm}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `request_id`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `request_id`. The field is read-only after initialization.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `csrf`. The field is read-only after initialization.
- `username`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `username`. The field is read-only after initialization.
- `password`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `password`. The field is read-only after initialization.

### `UserInfo` {#symbol-UserInfo}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `sub`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.

### `LoginError` {#symbol-LoginError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.

### `CodeError` {#symbol-CodeError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

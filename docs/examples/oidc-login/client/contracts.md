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

```aug [Indentation]
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error:
    pass
```

```aug [Braces]
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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`LoginTransaction`](contracts.md#symbol-LoginTransaction) is an immutable record.
- [`SessionClaims`](contracts.md#symbol-SessionClaims) is an immutable record.
- [`LogoutForm`](contracts.md#symbol-LogoutForm) is an immutable record.
- [`SessionError`](contracts.md#symbol-SessionError) is a class implementing `Error`.

### `LoginTransaction` {#symbol-LoginTransaction}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Browser-bound client state, nonce and PKCE verifier, consumed by the callback.

**Inputs**

- `state` (`string`) — required labeled input — stored as `state` and read-only after initialization.
- `nonce` (`string`) — required labeled input — stored as `nonce` and read-only after initialization.
- `verifier` (`string`) — required labeled input — stored as `verifier` and read-only after initialization.
- `expires` (`int`) — required labeled input — stored as `expires` and read-only after initialization.

### `SessionClaims` {#symbol-SessionClaims}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Sessions require their own issuer, audience, key and JWT type, plus a live registry entry.

**Inputs**

- `iss` (`string`) — required labeled input — stored as `iss` and read-only after initialization.
- `sub` (`string`) — required labeled input — stored as `sub` and read-only after initialization.
- `aud` (`string`) — required labeled input — stored as `aud` and read-only after initialization.
- `exp` (`int`) — required labeled input — stored as `exp` and read-only after initialization.
- `iat` (`int`) — required labeled input — stored as `iat` and read-only after initialization.
- `jti` (`string`) — required labeled input — stored as `jti` and read-only after initialization.
- `csrf` (`string`) — required labeled input — stored as `csrf` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.

### `LogoutForm` {#symbol-LogoutForm}

[source](contracts.md#code)

Immutable record.

**Inputs**

- `csrf` (`string`) — required labeled input — stored as `csrf` and read-only after initialization.

### `SessionError` {#symbol-SessionError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

---
title: "client/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `LoginTransaction` {#symbol-LoginTransaction}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Browser-bound client state, nonce and PKCE verifier, consumed by the callback.

**Inputs and dependencies**

- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `state`. The field is read-only after initialization.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `nonce`. The field is read-only after initialization.
- `verifier`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `verifier`. The field is read-only after initialization.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires`. The field is read-only after initialization.

### `SessionClaims` {#symbol-SessionClaims}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Sessions require their own issuer, audience, key and JWT type, plus a live registry entry.

**Inputs and dependencies**

- `iss`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `iss`. The field is read-only after initialization.
- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `sub`. The field is read-only after initialization.
- `aud`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `aud`. The field is read-only after initialization.
- `exp`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `exp`. The field is read-only after initialization.
- `iat`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `iat`. The field is read-only after initialization.
- `jti`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `jti`. The field is read-only after initialization.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `csrf`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.

### `LogoutForm` {#symbol-LogoutForm}

[source](contracts.md#code)

Immutable record.

**Inputs and dependencies**

- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `csrf`. The field is read-only after initialization.

### `SessionError` {#symbol-SessionError}

[source](contracts.md#code)

Behavioral class.

Satisfies `Error`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

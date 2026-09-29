---
title: "client/export.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `client/export.aug`

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
export LoginTransaction from contracts
export SessionClaims from contracts
export home from endpoints
export me from endpoints
export logout from logout
export startLogin from login
export loginCallback from login
```

```aug [Braces]
export LoginTransaction from contracts
export SessionClaims from contracts
export home from endpoints
export me from endpoints
export logout from logout
export startLogin from login
export loginCallback from login
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Folder exports

- Export the declaration `LoginTransaction` from [`contracts.aug`](contracts.md#symbol-LoginTransaction).
- Export the declaration `SessionClaims` from [`contracts.aug`](contracts.md#symbol-SessionClaims).
- Export the declaration `home` from [`endpoints.aug`](endpoints.md#symbol-home).
- Export the declaration `me` from [`endpoints.aug`](endpoints.md#symbol-me).
- Export the declaration `logout` from [`logout.aug`](logout.md#symbol-logout).
- Export the declaration `startLogin` from [`login.aug`](login.md#symbol-startLogin).
- Export the declaration `loginCallback` from [`login.aug`](login.md#symbol-loginCallback).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

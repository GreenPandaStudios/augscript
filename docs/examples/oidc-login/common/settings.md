---
title: "common/settings.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/settings.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `common/settings.aug`

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
- [`common/export.aug`](export.md)
- [`common/headers.aug`](headers.md)
- [`common/keys.aug`](keys.md)
- [`common/settings.aug`](settings.md)
- [`common/views.aug`](views.md)
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
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings() returns Settings:
    return Settings(baseUrl="http://127.0.0.1:8787", issuer="http://127.0.0.1:8787/provider", clientId="august-login-app", callback="http://127.0.0.1:8787/login/callback", sessionSeconds=900, secureCookies=false)
```

```aug [Braces]
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings() returns Settings {
    return Settings(baseUrl="http://127.0.0.1:8787", issuer="http://127.0.0.1:8787/provider", clientId="august-login-app", callback="http://127.0.0.1:8787/login/callback", sessionSeconds=900, secureCookies=false)
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Settings` {#symbol-Settings}

[source](settings.md#code)

Immutable record.

**Author documentation**

Explicit loopback development settings. The provider accepts one registered client and its exact callback URI.

**Inputs and dependencies**

- `baseUrl`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `baseUrl`. The field is read-only after initialization.
- `issuer`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `issuer`. The field is read-only after initialization.
- `clientId`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `clientId`. The field is read-only after initialization.
- `callback`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `callback`. The field is read-only after initialization.
- `sessionSeconds`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `sessionSeconds`. The field is read-only after initialization.
- `secureCookies`: `bool`. The caller supplies this labeled input. Read reference values without copying them. Store it as `secureCookies`. The field is read-only after initialization.

### `settings` {#symbol-settings}

[source](settings.md#code)

Result: [`Settings`](settings.md#symbol-Settings).

**Behavior when execution reaches this operation**

- Return the result of call [`Settings`](settings.md#symbol-Settings) with `baseUrl` set to `"http://127.0.0.1:8787"`; `issuer` set to `"http://127.0.0.1:8787/provider"`; `clientId` set to `"august-login-app"`; `callback` set to `"http://127.0.0.1:8787/login/callback"`; `sessionSeconds` set to `900`; `secureCookies` set to `false` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

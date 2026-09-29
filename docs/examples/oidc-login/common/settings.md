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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Settings`](settings.md#symbol-Settings) is an immutable record.
- [`settings`](settings.md#symbol-settings) is a function returning `Settings`.

### `Settings` {#symbol-Settings}

[source](settings.md#code)

Immutable record.

**Author documentation**

Explicit loopback development settings. The provider accepts one registered client and its exact callback URI.

**Inputs**

- `baseUrl` (`string`) — required labeled input — stored as `baseUrl` and read-only after initialization.
- `issuer` (`string`) — required labeled input — stored as `issuer` and read-only after initialization.
- `clientId` (`string`) — required labeled input — stored as `clientId` and read-only after initialization.
- `callback` (`string`) — required labeled input — stored as `callback` and read-only after initialization.
- `sessionSeconds` (`int`) — required labeled input — stored as `sessionSeconds` and read-only after initialization.
- `secureCookies` (`bool`) — required labeled input — stored as `secureCookies` and read-only after initialization.

### `settings` {#symbol-settings}

[source](settings.md#code)

Returns: [`Settings`](settings.md#symbol-Settings).

**What it does**

- Return call [`Settings`](settings.md#symbol-Settings) with `baseUrl` = `"http://127.0.0.1:8787"`; `issuer` = `"http://127.0.0.1:8787/provider"`; `clientId` = `"august-login-app"`; `callback` = `"http://127.0.0.1:8787/login/callback"`; `sessionSeconds` = `900`; `secureCookies` = `false`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

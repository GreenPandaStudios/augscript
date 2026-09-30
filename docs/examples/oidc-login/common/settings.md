---
title: "common/settings.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/settings.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "settings.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings() returns Settings:
    return Settings(baseUrl="http://127.0.0.1:8787", issuer="http://127.0.0.1:8787/provider", clientId="august-login-app", callback="http://127.0.0.1:8787/login/callback", sessionSeconds=900, secureCookies=false)
```

```aug [Braces]
// aug-spec: "settings.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings() returns Settings {
    return Settings(baseUrl="http://127.0.0.1:8787", issuer="http://127.0.0.1:8787/provider", clientId="august-login-app", callback="http://127.0.0.1:8787/login/callback", sessionSeconds=900, secureCookies=false)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Settings"></a>
### `Settings` · immutable record · [source](settings.md#code)

Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. The caller supplies `baseUrl`, `issuer`, `clientId`, and `callback` as `string`, stored read-only, `sessionSeconds` as `int`, stored read-only, and `secureCookies` as `bool`, stored read-only.

<a id="symbol-settings"></a>
### `settings` · [source](settings.md#code)

The result is [`Settings`](settings.md#symbol-Settings). It returns a new [`Settings`](settings.md#symbol-Settings) (`baseUrl` set to `"http://127.0.0.1:8787"`, `issuer` set to `"http://127.0.0.1:8787/provider"`, `clientId` set to `"august-login-app"`, `callback` set to `"http://127.0.0.1:8787/login/callback"`, `sessionSeconds` set to `900`, and `secureCookies` set to `false`).

::::

:::::

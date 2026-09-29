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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Settings"></a>
### `Settings` · immutable record · [source](settings.md#code)

Explicit loopback development settings. The provider accepts one registered client and its exact callback URI.

**Inputs:** Take `baseUrl` (`string`); store read-only. Take `issuer` (`string`); store read-only. Take `clientId` (`string`); store read-only. Take `callback` (`string`); store read-only. Take `sessionSeconds` (`int`); store read-only. Take `secureCookies` (`bool`); store read-only.

<a id="symbol-settings"></a>
### `settings` · [source](settings.md#code)

Returns [`Settings`](settings.md#symbol-Settings).

- Return a new [`Settings`](settings.md#symbol-Settings) with `baseUrl` as `"http://127.0.0.1:8787"`, `issuer` as `"http://127.0.0.1:8787/provider"`, `clientId` as `"august-login-app"`, `callback` as `"http://127.0.0.1:8787/login/callback"`, `sessionSeconds` as `900`, `secureCookies` as `false`.

::::

:::::

---
title: "common/export.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `common/export.aug`

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
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Settings from settings
export settings from settings
export SigningKeys from keys
export MemorySigningKeys from keys
export initializeKeys from keys
export KeyError from keys
export Page from views
export securityHeaders from headers
export withCookie from headers
```

```aug [Braces]
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Settings from settings
export settings from settings
export SigningKeys from keys
export MemorySigningKeys from keys
export initializeKeys from keys
export KeyError from keys
export Page from views
export securityHeaders from headers
export withCookie from headers
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

Export the declaration `Settings` from [`settings.aug`](settings.md#symbol-Settings). Export the declaration `settings` from [`settings.aug`](settings.md#symbol-settings). Export the declaration `SigningKeys` from [`keys.aug`](keys.md#symbol-SigningKeys). Export the declaration `MemorySigningKeys` from [`keys.aug`](keys.md#symbol-MemorySigningKeys).

Export the declaration `initializeKeys` from [`keys.aug`](keys.md#symbol-initializeKeys). Export the declaration `KeyError` from [`keys.aug`](keys.md#symbol-KeyError). Export the declaration `Page` from [`views.aug`](views.md#symbol-Page). Export the declaration `securityHeaders` from [`headers.aug`](headers.md#symbol-securityHeaders).

Export the declaration `withCookie` from [`headers.aug`](headers.md#symbol-withCookie).

::::

:::::

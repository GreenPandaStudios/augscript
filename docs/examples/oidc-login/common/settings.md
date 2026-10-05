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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNjc2MDFjNGQ5MjQzZDZjZGYyNDEzNTU1NzNkNWM1NGNiZjgzNmFiOTJhMGMyNjY5YzIwYTEzZmFiNTcyMmI3YiIsImZvcm1hdHRlZFNoYTI1NiI6IjU3MjA3MWRhYmExYjFiNGE3OTg3Nzg2MTdkMzlhMjA2ODg2ZDE1MjkzN2JmZWJhZWRiYTRlYWM2OGVkODU5ZGQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtU2V0dGluZ3MiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtc2V0dGluZ3MiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "settings.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings():
    return Settings(
        baseUrl="http://127.0.0.1:8787",
        issuer="http://127.0.0.1:8787/provider",
        clientId="august-login-app",
        callback="http://127.0.0.1:8787/login/callback",
        sessionSeconds=900,
        secureCookies=false
    )
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNjc2MDFjNGQ5MjQzZDZjZGYyNDEzNTU1NzNkNWM1NGNiZjgzNmFiOTJhMGMyNjY5YzIwYTEzZmFiNTcyMmI3YiIsImZvcm1hdHRlZFNoYTI1NiI6IjBhN2VjYzk2ODI3NGQwODYyYzA1ZTBiY2NhZDQ4NWJkM2Q4ZmNmZjYxZjdlMTNjOGNmOTQ5N2ZiZDkzYTVmMzciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtU2V0dGluZ3MiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtc2V0dGluZ3MiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "settings.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. */
record Settings(string baseUrl, string issuer, string clientId, string callback, int sessionSeconds, bool secureCookies)
settings() {
    return Settings(
        baseUrl="http://127.0.0.1:8787",
        issuer="http://127.0.0.1:8787/provider",
        clientId="august-login-app",
        callback="http://127.0.0.1:8787/login/callback",
        sessionSeconds=900,
        secureCookies=false
    )
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Settings` · immutable record · [source](settings.md#source-L3) {#symbol-Settings}

Explicit loopback development settings. The provider accepts one registered client and its exact callback URI. It takes `baseUrl`, `issuer`, `clientId`, and `callback` as strings, kept read-only, `sessionSeconds` as an integer, kept read-only, and `secureCookies` as a boolean, kept read-only.

### `settings` · [source](settings.md#source-L4) {#symbol-settings}

::: spec-paragraph specification-paragraph-1
It returns a [`Settings`](settings.md#symbol-Settings) with `baseUrl` `"http://127.0.0.1:8787"`, `issuer` `"http://127.0.0.1:8787/provider"`, `clientId` `"august-login-app"`, `callback` `"http://127.0.0.1:8787/login/callback"`, `sessionSeconds` `900`, and `secureCookies` `false`. [source](settings.md#source-L5)
:::

::: details Checked interface

```text
settings() returns Settings
```

:::

::::

:::::

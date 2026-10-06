---
title: "client/export.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZThjMTlmM2ExYWFkMGU0ZWQwYzlmZWUxNDA5YzYyY2E3YTUyMmFiNzNjZTFlMmNhYTc4NjFkMTE0ZGUzZGVlYyIsImZvcm1hdHRlZFNoYTI1NiI6ImM1YzNkM2VmMzNiNzU5YmQzMTUxYzQyOTNhOGQxNjdlZjYwMzY1MzRkMmNjZDhlODM0YjNiYjdlODE0OWNlOTAiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export LoginTransaction from contracts
export SessionClaims from contracts
export home from endpoints
export me from endpoints
export logout from logout
export startLogin from login
export loginCallback from login
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZThjMTlmM2ExYWFkMGU0ZWQwYzlmZWUxNDA5YzYyY2E3YTUyMmFiNzNjZTFlMmNhYTc4NjFkMTE0ZGUzZGVlYyIsImZvcm1hdHRlZFNoYTI1NiI6ImM1YzNkM2VmMzNiNzU5YmQzMTUxYzQyOTNhOGQxNjdlZjYwMzY1MzRkMmNjZDhlODM0YjNiYjdlODE0OWNlOTAiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export LoginTransaction from contracts
export SessionClaims from contracts
export home from endpoints
export me from endpoints
export logout from logout
export startLogin from login
export loginCallback from login
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](export-diagrams.md)

### Exports

Export the declaration `LoginTransaction` from [`contracts.aug`](contracts.md#symbol-LoginTransaction). Export the declaration `SessionClaims` from [`contracts.aug`](contracts.md#symbol-SessionClaims). Export the declaration `home` from [`endpoints.aug`](endpoints.md#symbol-home). Export the declaration `me` from [`endpoints.aug`](endpoints.md#symbol-me).

Export the declaration `logout` from [`logout.aug`](logout.md#symbol-logout). Export the declaration `startLogin` from [`login.aug`](login.md#symbol-startLogin). Export the declaration `loginCallback` from [`login.aug`](login.md#symbol-loginCallback).

::::

:::::

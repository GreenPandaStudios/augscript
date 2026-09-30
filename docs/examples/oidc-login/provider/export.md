---
title: "provider/export.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/export.aug`

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
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export AuthorizationRequest from contracts
export AuthorizationCode from contracts
export AccessGrant from contracts
export IdClaims from contracts
export TokenResponse from contracts
export UserInfo from contracts
export Discovery from discovery
export discovery from discovery
export jwks from discovery
export authorize from authorization
export providerLogin from authorization
export token from token
export userinfo from userinfo
```

```aug [Braces]
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export AuthorizationRequest from contracts
export AuthorizationCode from contracts
export AccessGrant from contracts
export IdClaims from contracts
export TokenResponse from contracts
export UserInfo from contracts
export Discovery from discovery
export discovery from discovery
export jwks from discovery
export authorize from authorization
export providerLogin from authorization
export token from token
export userinfo from userinfo
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

Export the declaration `AuthorizationRequest` from [`contracts.aug`](contracts.md#symbol-AuthorizationRequest). Export the declaration `AuthorizationCode` from [`contracts.aug`](contracts.md#symbol-AuthorizationCode). Export the declaration `AccessGrant` from [`contracts.aug`](contracts.md#symbol-AccessGrant). Export the declaration `IdClaims` from [`contracts.aug`](contracts.md#symbol-IdClaims). Export the declaration `TokenResponse` from [`contracts.aug`](contracts.md#symbol-TokenResponse). Export the declaration `UserInfo` from [`contracts.aug`](contracts.md#symbol-UserInfo). Export the declaration `Discovery` from [`discovery.aug`](discovery.md#symbol-Discovery). Export the declaration `discovery` from [`discovery.aug`](discovery.md#symbol-discovery). Export the declaration `jwks` from [`discovery.aug`](discovery.md#symbol-jwks). Export the declaration `authorize` from [`authorization.aug`](authorization.md#symbol-authorize). Export the declaration `providerLogin` from [`authorization.aug`](authorization.md#symbol-providerLogin). Export the declaration `token` from [`token.aug`](token.md#symbol-token). Export the declaration `userinfo` from [`userinfo.aug`](userinfo.md#symbol-userinfo).

::::

:::::

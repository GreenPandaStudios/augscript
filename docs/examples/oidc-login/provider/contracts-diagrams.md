---
title: "provider/contracts.aug diagrams"
generated: true
source: "examples/oidc-login/provider/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/contracts.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](contracts.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### AuthorizationRequest constructor {#sequence-AuthorizationRequest-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

Receive fields: clientId, redirectUri, state, nonce, challenge, browser, csrf, expires. [Explanation](contracts.md).

### AuthorizationCode constructor {#sequence-AuthorizationCode-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L5)
:::

Receive fields: clientId, redirectUri, challenge, nonce, subject, name, expires. [Explanation](contracts.md).

### IdClaims constructor {#sequence-IdClaims-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L6)
:::

Receive fields: iss, sub, aud, exp, iat, nonce, name. [Explanation](contracts.md).

### AccessGrant constructor {#sequence-AccessGrant-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L7)
:::

Receive fields: subject, name, expires. [Explanation](contracts.md).

### TokenResponse constructor {#sequence-TokenResponse-20-constructor}

::: spec-paragraph specification-paragraph-5
[Source](contracts.md#source-L8)
:::

Receive fields: token\_type, access\_token, id\_token, expires\_in, scope. [Explanation](contracts.md).

### OAuthError constructor {#sequence-OAuthError-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](contracts.md#source-L9)
:::

Receive fields: error, error\_description. [Explanation](contracts.md).

### TokenForm constructor {#sequence-TokenForm-20-constructor}

::: spec-paragraph specification-paragraph-7
[Source](contracts.md#source-L10)
:::

Receive fields: grant\_type, code, redirect\_uri, client\_id, code\_verifier. [Explanation](contracts.md).

### LoginForm constructor {#sequence-LoginForm-20-constructor}

::: spec-paragraph specification-paragraph-8
[Source](contracts.md#source-L11)
:::

Receive fields: request\_id, csrf, username, password. [Explanation](contracts.md).

### UserInfo constructor {#sequence-UserInfo-20-constructor}

::: spec-paragraph specification-paragraph-9
[Source](contracts.md#source-L12)
:::

Receive fields: sub, name. [Explanation](contracts.md).

### LoginError constructor {#sequence-LoginError-20-constructor}

::: spec-paragraph specification-paragraph-10
[Source](contracts.md#source-L13)
:::

[Explanation](contracts.md).

### CodeError constructor {#sequence-CodeError-20-constructor}

::: spec-paragraph specification-paragraph-11
[Source](contracts.md#source-L15)
:::

[Explanation](contracts.md).

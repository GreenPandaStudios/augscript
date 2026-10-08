---
title: "client/endpoints.aug diagrams"
generated: true
source: "examples/oidc-login/client/endpoints.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/endpoints.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](endpoints.md)

## Class interactions

### home

#### View 1 of 2

```mermaid
flowchart LR
    n0["home"]
    n1["authenticate"]
    n2["LoginPage"]
    n3["Welcome"]
    n4["securityHeaders"]
    n5["SigningKeys"]
    n6["ExpiringStore"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n0 -->|"depends on"| n5
    n0 -->|"depends on"| n6
```

#### View 2 of 2

```mermaid
flowchart LR
    n0["home"]
    n1["Crypto"]
    n2["Clock"]
    n0 -->|"depends on"| n1
    n0 -->|"depends on"| n2
```

### me

```mermaid
flowchart LR
    n0["me"]
    n1["authenticate"]
    n2["securityHeaders"]
    n3["SigningKeys"]
    n4["ExpiringStore"]
    n5["Crypto"]
    n6["Clock"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"depends on"| n3
    n0 -->|"depends on"| n4
    n0 -->|"depends on"| n5
    n0 -->|"depends on"| n6
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### home {#sequence-home}

::: spec-paragraph specification-paragraph-1
[Source](endpoints.md#source-L12)
:::

`home` handles `GET /`.

The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null.

It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

It can also raise `HttpError`, `KeyError`, and `TimeError`.

```mermaid
sequenceDiagram
    participant p0 as home
    participant p1 as client/session
    participant p2 as client/views
    participant p3 as common/headers
    Note over p0: GET /
    opt Try body； stops on a checked failure
    p0->>p1: authenticate(token=token)
    p1-->>p0: session: SessionClaims
    p0->>p2: Welcome(session=session)
    p2-->>p0: Welcome result: Html
    p0->>p3: securityHeaders()
    p3-->>p0: securityHeaders result: Headers
    p0->>p0: HttpResponse(body=Welcome result,<br/>headers=securityHeaders result)
    p0-->>p0: HttpResponse result: HttpResponse‹Html›
    Note over p0: Return HttpResponse(body=Welcome(session),<br/>headers=securityHeaders())； required cleanup runs before<br/>exit
    end
    opt Catch SessionError
    p0->>p2: LoginPage()
    p2-->>p0: LoginPage result: Html
    p0->>p3: securityHeaders()
    p3-->>p0: securityHeaders result 2: Headers
    p0->>p0: HttpResponse(body=LoginPage result,<br/>headers=securityHeaders result 2)
    p0-->>p0: HttpResponse result 2: HttpResponse‹Html›
    Note over p0: Return HttpResponse(body=LoginPage(),<br/>headers=securityHeaders())； required cleanup runs before<br/>exit
    end
    Note over p0: May leave with checked errors: HttpError, KeyError,<br/>TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

### me {#sequence-me}

::: spec-paragraph specification-paragraph-2
[Source](endpoints.md#source-L20)
:::

`me` handles `GET /me`.

A protected JSON resource accepts only a live, verified application session.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null.

It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

The handler responds with HTTP 401 for [`SessionError`](contracts.md#symbol-SessionError).

It can also raise `HttpError`, `KeyError`, and `TimeError`.

```mermaid
sequenceDiagram
    participant p0 as me
    participant p1 as client/session
    participant p2 as common/headers
    Note over p0: GET /me
    p0->>p1: authenticate(token=token)
    p1-->>p0: session: SessionClaims
    p0->>p0: UserInfo(sub=session.sub, name=session.name) · construct<br/>value
    p0-->>p0: UserInfo result: UserInfo
    p0->>p2: securityHeaders()
    p2-->>p0: securityHeaders result: Headers
    p0->>p0: HttpResponse(body=UserInfo result,<br/>headers=securityHeaders result)
    p0-->>p0: HttpResponse result: HttpResponse‹UserInfo›
    Note over p0: Return HttpResponse(body=UserInfo(sub=session.sub,<br/>name=session.name), headers=securityHeaders())； required<br/>cleanup runs before exit
    Note over p0: May leave with checked errors: HttpError, KeyError,<br/>SessionError, TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

## Called contracts

- [authenticate](session-diagrams.md#sequence-authenticate) — client/session.aug
- [LoginPage](views-diagrams.md#sequence-LoginPage) — client/views.aug
- [Welcome](views-diagrams.md#sequence-Welcome) — client/views.aug
- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [UserInfo](../provider/contracts-diagrams.md#sequence-UserInfo-20-constructor) — provider/contracts.aug

---
title: "client/logout.aug diagrams"
generated: true
source: "examples/oidc-login/client/logout.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/logout.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](logout.md)

## Class interactions

```mermaid
flowchart TD
    n0["SessionError · client/contracts.aug"]
    n1["logout · client/logout.aug"]
    n2["authenticate · client/session.aug"]
    n3["securityHeaders · common/headers.aug"]
    n4["withCookie · common/headers.aug"]
    n5["SigningKeys · common/keys.aug"]
    n6["settings · common/settings.aug"]
    n7["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n8["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n9["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n3
    n1 -->|"calls"| n4
    n1 -->|"depends on"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n7
    n1 -->|"depends on"| n7
    n1 -->|"calls"| n8
    n1 -->|"depends on"| n8
    n1 -->|"calls"| n9
    n1 -->|"depends on"| n9
```

## API calls

```mermaid
flowchart TD
    n0["SessionError · client/contracts.aug"]
    n1["logout · client/logout.aug"]
    n2["authenticate · client/session.aug"]
    n3["securityHeaders · common/headers.aug"]
    n4["withCookie · common/headers.aug"]
    n5["settings · common/settings.aug"]
    n6["ExpiringStore.take · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n7["Crypto.equal · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n8["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n3
    n1 -->|"calls"| n4
    n1 -->|"calls"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n7
    n1 -->|"calls"| n8
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### logout {#sequence-logout}

::: spec-paragraph specification-paragraph-1
[Source](logout.md#source-L10)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as logout
    participant p1 as settings
    participant p2 as SessionError
    participant p3 as authenticate
    participant p4 as input.csrf.bytes
    participant p5 as session.csrf.bytes
    participant p6 as Crypto.equal
    participant p7 as Clock.now
    participant p8 as ExpiringStore.take
    participant p9 as securityHeaders
    participant p10 as securityHeaders().with
    participant p11 as withCookie
    Note over p0: POST /logout
    p0->>p1: settings()
    alt origin != config.baseUrl
    p0->>p2: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p3: authenticate(token)
    p0->>p4: input.csrf.bytes()
    p0->>p5: session.csrf.bytes()
    p0->>p6: equal(left, right) · interface dispatch
    alt not crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes())
    p0->>p2: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p7: now() · interface dispatch
    p0->>p8: take(key, now) · interface dispatch
    p0->>p9: securityHeaders()
    p0->>p10: securityHeaders().with(name, value)
    p0->>p11: withCookie(headers, name, value, path, maxAge, secure)
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as logout
    participant p1 as HttpResponse
    Note over p0: Sequence continued from the previous view
    p0->>p1: HttpResponse(body, status, headers)
    Note over p0: Return HttpResponse(body=#60;p#62;Signed out.#60;/p#62;, status=303, headers=headers)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: CryptoError, HttpError, KeyError, SessionError, TimeError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

## Called contracts

- [SessionError](contracts-diagrams.md#sequence-SessionError-20-constructor) — client/contracts.aug
- [authenticate](session-diagrams.md#sequence-authenticate) — client/session.aug
- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [withCookie](../common/headers-diagrams.md#sequence-withCookie) — common/headers.aug
- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.take](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.take) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

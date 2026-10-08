---
title: "provider/userinfo.aug diagrams"
generated: true
source: "examples/oidc-login/provider/userinfo.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/userinfo.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](userinfo.md)

## Class interactions

```mermaid
flowchart TD
    n0["securityHeaders"]
    n1["ExpiringStore"]
    n2["Clock"]
    n3["userinfo"]
    n3 -->|"calls"| n0
    n3 -->|"calls get； depends on"| n1
    n3 -->|"calls now； depends on"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### userinfo {#sequence-userinfo}

::: spec-paragraph specification-paragraph-1
[Source](userinfo.md#source-L8)
:::

`userinfo` handles `GET /provider/userinfo`.

The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response.

It takes `authorization` as `optional string` from the HTTP header. It gets `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)) and `access` ([`ExpiringStore<AccessGrant>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null.

It can call [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) and [`ExpiringStore<AccessGrant>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get).

It can also raise `HttpError` and `TimeError`.

#### Sequence 1 of 2

```mermaid
sequenceDiagram
    participant p0 as userinfo
    participant p1 as clock: Clock
    participant p2 as access: ExpiringStore
    participant p3 as common/headers
    Note over p0: GET /provider/userinfo
    alt Match when null:
    Note over p0: No operations in this branch
    else Match when some header:
    p0->>p0: header.split(separator=” ”)
    p0-->>p0: parts: List‹string›
    p0->>p0: parts.length()
    p0-->>p0: length result: int
    alt the number of elements in parts equals 2
    opt Try body； stops on a checked failure
    p0->>p0: parts.get(index=0)
    p0-->>p0: get result: string
    alt the item at index 0 in parts equals ”Bearer”
    p0->>p0: parts.get(index=1)
    p0-->>p0: token: string
    p0->>p0: token.isToken(min=43, max=43)
    p0-->>p0: isToken result: bool
    alt token is a URL-safe ASCII token with 43 to 43 characters
    p0->>p1: now() · interface dispatch
    p1-->>p0: now result: int
    p0->>p2: get(key=token, now=now result) · interface dispatch
    p2-->>p0: get result 3: optional AccessGrant
    alt Match when null:
    Note over p0: No operations in this branch
    else Match when some grant:
    p0->>p0: UserInfo(sub=grant.subject, name=grant.name) · construct<br/>value
    p0-->>p0: UserInfo result: UserInfo
    p0->>p0: Json(value=UserInfo result)
    p0-->>p0: Json result: Json
    p0->>p3: securityHeaders()
    p3-->>p0: securityHeaders result: Headers
    end
    end
    end
    end
    end
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as userinfo
    participant p1 as common/headers
    alt Continuing Match when some header:
    alt the number of elements in parts equals 2
    opt Try body； stops on a checked failure
    alt the item at index 0 in parts equals ”Bearer”
    alt token is a URL-safe ASCII token with 43 to 43 characters
    alt Continuing Match when some grant:
    Note over p0: Sequence continued from the previous view
    p0->>p0: HttpResponse(body=Json result, headers=securityHeaders<br/>result)
    p0-->>p0: HttpResponse result: HttpResponse‹Json›
    Note over p0: Return<br/>HttpResponse(body=Json(value=UserInfo(sub=grant.subject,<br/>name=grant.name)), headers=securityHeaders())； required<br/>cleanup runs before exit
    end
    end
    end
    end
    opt Catch IndexError
    Note over p0: No operations in this branch
    end
    end
    end
    p0->>p1: securityHeaders()
    p1-->>p0: securityHeaders result 2: Headers
    p0->>p0: securityHeaders result 2.with(name=”www-authenticate”,<br/>value=”Bearer error=＼”invalid_token＼””)
    p0-->>p0: headers: Headers
    p0->>p0: Json(value=｛”error”: ”invalid_token”｝)
    p0-->>p0: Json result 2: Json
    p0->>p0: HttpResponse(body=Json result 2, status=401,<br/>headers=headers)
    p0-->>p0: HttpResponse result 2: HttpResponse‹Json›
    Note over p0: Return HttpResponse(body=Json(value=｛”error”:<br/>”invalid_token”｝), status=401, headers=headers)；<br/>required cleanup runs before exit
    Note over p0: May leave with checked errors: HttpError, TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

## Called contracts

- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.get](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.get) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [UserInfo](contracts-diagrams.md#sequence-UserInfo-20-constructor) — provider/contracts.aug

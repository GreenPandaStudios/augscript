---
title: "Diagrams · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/userinfo.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# OpenID Connect login application diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](userinfo.md)

### Class interactions

```mermaid
flowchart TD
    n0["securityHeaders · common/headers.aug"]
    n1["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n2["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n3["UserInfo · provider/contracts.aug"]
    n4["userinfo · provider/userinfo.aug"]
    n4 -->|"calls"| n0
    n4 -->|"calls"| n1
    n4 -->|"depends on"| n1
    n4 -->|"calls"| n2
    n4 -->|"depends on"| n2
    n4 -->|"calls"| n3
```

### API calls

```mermaid
flowchart TD
    n0["securityHeaders · common/headers.aug"]
    n1["ExpiringStore.get · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n2["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n3["UserInfo · provider/contracts.aug"]
    n4["userinfo · provider/userinfo.aug"]
    n4 -->|"calls"| n0
    n4 -->|"calls"| n1
    n4 -->|"calls"| n2
    n4 -->|"calls"| n3
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### userinfo {#sequence-userinfo}

::: spec-paragraph specification-paragraph-1
[Source](userinfo.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as userinfo
    participant p1 as header.split
    participant p2 as parts.length
    participant p3 as parts.get
    participant p4 as token.isToken
    participant p5 as Clock.now
    participant p6 as ExpiringStore.get
    participant p7 as UserInfo
    participant p8 as Json
    participant p9 as securityHeaders
    participant p10 as HttpResponse
    participant p11 as securityHeaders().with
    Note over p0: GET /provider/userinfo
    alt Match when null:
    else Match when some header:
    p0->>p1: header.split(separator)
    p0->>p2: parts.length()
    alt parts.length() == 2
    opt Try body#59; stops on a checked failure
    p0->>p3: parts.get(index)
    alt parts.get(index=0) == #34;Bearer#34;
    p0->>p3: parts.get(index)
    p0->>p4: token.isToken(min, max)
    alt token.isToken(min=43, max=43)
    p0->>p5: now() · interface dispatch
    p0->>p6: get(key, now) · interface dispatch
    alt Match when null:
    else Match when some grant:
    p0->>p7: UserInfo(sub, name)
    p0->>p8: Json(value)
    p0->>p9: securityHeaders()
    p0->>p10: HttpResponse(body, headers)
    Note over p0: Return HttpResponse(body=Json(value=UserInfo(sub=grant.subject, name=grant.name)), headers=securityHeaders())#59; requir…
    end
    end
    end
    end
    opt Catch IndexError
    end
    end
    end
    p0->>p9: securityHeaders()
    p0->>p11: securityHeaders().with(name, value)
    p0->>p8: Json(value)
    p0->>p10: HttpResponse(body, status, headers)
    Note over p0: Return HttpResponse(body=Json(value=#123;#34;error#34;: #34;invalid_token#34;#125;), status=401, headers=headers)#59; required cleanup runs …
    Note over p0: May leave with checked errors: HttpError, TimeError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

### Called contracts

- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.get](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.get) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [UserInfo](contracts-diagrams.md#sequence-UserInfo-20-constructor) — provider/contracts.aug

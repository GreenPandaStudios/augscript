---
title: "client/contracts.aug diagrams"
generated: true
source: "examples/oidc-login/client/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/contracts.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](contracts.md)

## Class interactions

```mermaid
flowchart TD
    n0["LoginTransaction · client/contracts.aug"]
    n1["LogoutForm · client/contracts.aug"]
    n2["SessionClaims · client/contracts.aug"]
    n3["SessionError · client/contracts.aug"]

```

## API calls

No relationships at this level.

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### LoginTransaction constructor {#sequence-LoginTransaction-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as LoginTransaction constructor

    Note over p0: Receive fields: state, nonce, verifier, expires
```

### SessionClaims constructor {#sequence-SessionClaims-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as SessionClaims constructor

    Note over p0: Receive fields: iss, sub, aud, exp, iat, jti, csrf, name
```

### LogoutForm constructor {#sequence-LogoutForm-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as LogoutForm constructor

    Note over p0: Receive fields: csrf
```

### SessionError constructor {#sequence-SessionError-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as SessionError constructor

    Note over p0: No calls in this operation#59; see the source and specification
```


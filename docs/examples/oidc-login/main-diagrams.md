---
title: "main.aug diagrams"
generated: true
source: "examples/oidc-login/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[OpenID Connect login application](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["initializeKeys · common/keys.aug"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L20)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as initializeKeys
    participant p2 as print
    participant p3 as exit
    opt Try body#59; stops on a checked failure
    p0->>p1: initializeKeys()
    end
    opt Catch CryptoError
    p0->>p2: print(value)
    p0->>p3: exit(status)
    end
    opt Catch KeyError
    p0->>p2: print(value)
    p0->>p3: exit(status)
    end
    Note over p0: Serve endpoints: home, me, logout, startLogin, loginCallback, discovery, jwks, authorize, providerLogin, token, userinfo
```

## Called contracts

- [initializeKeys](common/keys-diagrams.md#sequence-initializeKeys) — common/keys.aug

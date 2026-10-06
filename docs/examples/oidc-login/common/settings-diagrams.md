---
title: "common/settings.aug diagrams"
generated: true
source: "examples/oidc-login/common/settings.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# common/settings.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](settings.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["Settings"]
    n1["settings"]
    n1 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Settings constructor {#sequence-Settings-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](settings.md#source-L3)
:::

Receive fields: baseUrl, issuer, clientId, callback, sessionSeconds, secureCookies. [Explanation](settings.md).

### settings {#sequence-settings}

::: spec-paragraph specification-paragraph-2
[Source](settings.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as settings
    participant p1 as Settings
    p0->>p1: Settings(baseUrl=”http://127.0.0.1:8787”,<br/>issuer=”http://127.0.0.1:8787/provider”,<br/>clientId=”august-login-app”, callb…
    p1-->>p0: Settings
    Note over p0: Return Settings(baseUrl=”http://127.0.0.1:8787”,<br/>issuer=”http://127.0.0.1:8787/provider”,<br/>clientId=”august-login-app”…
```

## Called contracts

- [Settings](settings-diagrams.md#sequence-Settings-20-constructor) — common/settings.aug

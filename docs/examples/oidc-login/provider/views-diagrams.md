---
title: "provider/views.aug diagrams"
generated: true
source: "examples/oidc-login/provider/views.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/views.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](views.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["Page"]
    n1["ProviderFailure"]
    n2["ProviderLogin"]
    n1 -->|"calls"| n0
    n2 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### ProviderLogin {#sequence-ProviderLogin}

::: spec-paragraph specification-paragraph-1
[Source](views.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as ProviderLogin
    participant p1 as common/views
    p0->>p1: Page(title=”Sign in with the August provider”,<br/>children=‹Page title=”Sign in with the August provider”›<br/>‹p›｛message｝‹…
    p1-->>p0: Html
    Note over p0: Return ‹Page title=”Sign in with the August provider”›<br/>‹p›｛message｝‹/p› ‹p<br/>style=”background:＃f3f5f9；padding:12px；bor…
```

### ProviderFailure {#sequence-ProviderFailure}

::: spec-paragraph specification-paragraph-2
[Source](views.md#source-L18)
:::

```mermaid
sequenceDiagram
    participant p0 as ProviderFailure
    participant p1 as common/views
    p0->>p1: Page(title=”Sign-in could not continue”, children=‹Page<br/>title=”Sign-in could not continue”›‹p›｛message｝‹/p›‹a<br/>href=”/…
    p1-->>p0: Html
    Note over p0: Return ‹Page title=”Sign-in could not<br/>continue”›‹p›｛message｝‹/p›‹a href=”/login/start”›Start a<br/>new sign-in‹/a›‹/Page›…
```

## Called contracts

- [Page](../common/views-diagrams.md#sequence-Page) — common/views.aug

---
title: "client/views.aug diagrams"
generated: true
source: "examples/oidc-login/client/views.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/views.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](views.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["logout"]
    n1["LoginPage"]
    n2["Welcome"]
    n3["Page"]
    n1 -->|"calls"| n3
    n2 -->|"defers HTTP call to"| n0
    n2 -->|"calls"| n3
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### LoginPage {#sequence-LoginPage}

::: spec-paragraph specification-paragraph-1
[Source](views.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as LoginPage
    participant p1 as common/views
    p0->>p1: Page(title=”Sign in”, children=‹Page title=”Sign in”›<br/>‹p›This August app is both an OpenID Connect provider<br/>and a log…
    p1-->>p0: Html
    Note over p0: Return ‹Page title=”Sign in”› ‹p›This August app is both<br/>an OpenID Connect provider and a login client.‹/p› ‹p›‹a<br/>hre…
```

### Welcome {#sequence-Welcome}

::: spec-paragraph specification-paragraph-2
[Source](views.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Welcome
    participant p1 as common/views
    Note over p0: Create browser action for POST /logout； called on<br/>submission
    p0->>p1: Page(title=”Welcome, ” + session.name, children=‹Page<br/>title=｛”Welcome, ” + session.name｝› ‹p›You are signed in<br/>as ‹st…
    p1-->>p0: Html
    Note over p0: Return ‹Page title=｛”Welcome, ” + session.name｝› ‹p›You<br/>are signed in as ‹strong›｛session.name｝‹/strong›.‹/p›<br/>‹p›Subj…
    Note over p0: May leave with checked errors: HttpError
```

## Called contracts

- [logout](logout-diagrams.md#sequence-logout) — client/logout.aug
- [Page](../common/views-diagrams.md#sequence-Page) — common/views.aug

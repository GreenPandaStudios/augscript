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

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["logout · client/logout.aug"]
    n1["LoginPage · client/views.aug"]
    n2["Welcome · client/views.aug"]
    n3["Page · common/views.aug"]
    n1 -->|"calls"| n3
    n2 -->|"defers HTTP call to"| n0
    n2 -->|"calls"| n3
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### LoginPage {#sequence-LoginPage}

::: spec-paragraph specification-paragraph-1
[Source](views.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as LoginPage
    participant p1 as Page
    p0->>p1: Page(title, children)
    Note over p0: Return #60;Page title=#34;Sign in#34;#62; #60;p#62;This August app is both an OpenID Connect provider and a login client.#60;/p#62; #60;p#62;#60;a hre…
```

### Welcome {#sequence-Welcome}

::: spec-paragraph specification-paragraph-2
[Source](views.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Welcome
    participant p1 as Page
    Note over p0: Create browser action for POST /logout#59; called on submission
    p0->>p1: Page(title, children)
    Note over p0: Return #60;Page title=#123;#34;Welcome, #34; + session.name#125;#62; #60;p#62;You are signed in as #60;strong#62;#123;session.name#125;#60;/strong#62;.#60;/p#62; #60;p#62;Subj…
    Note over p0: May leave with checked errors: HttpError
```

## Called contracts

- [logout](logout-diagrams.md#sequence-logout) — client/logout.aug
- [Page](../common/views-diagrams.md#sequence-Page) — common/views.aug

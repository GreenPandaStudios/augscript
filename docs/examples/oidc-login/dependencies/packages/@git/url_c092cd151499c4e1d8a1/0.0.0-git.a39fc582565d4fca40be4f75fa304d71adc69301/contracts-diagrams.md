---
title: "Diagrams · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# OpenID Connect login application diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

### Class interactions

```mermaid
flowchart TD
    n0["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1["SystemClock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n2["_aug_time_now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"implements"| n0
    n1 -->|"calls"| n2
```

### API calls

```mermaid
flowchart TD
    n0["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1["SystemClock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n2["_aug_time_now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n2
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Clock.now {#sequence-Clock.now}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Clock.now

    Note over p0: May leave with checked errors: TimeError
    Note over p0: Interface contract#59; implementation selected at runtime
```

#### \_aug\_time\_now {#sequence-_aug_time_now}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as _aug_time_now

    Note over p0: May leave with checked errors: TimeError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### SystemClock constructor {#sequence-SystemClock-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as SystemClock constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### SystemClock.now {#sequence-SystemClock.now}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as SystemClock.now
    participant p1 as _aug_time_now
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_time_now() · native boundary
    Note over p0: Return _aug_time_now()#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TimeError
```

### Called contracts

- [Clock](contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_time\_now](contracts-diagrams.md#sequence-_aug_time_now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

---
title: "package/@git/url\\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

## Class interactions

```mermaid
flowchart TD
    n0["Clock"]
    n1["SystemClock"]
    n2["_aug_time_now"]
    n1 -->|"implements"| n0
    n1 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Clock.now {#sequence-Clock.now}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L5)
:::

Read whole Unix seconds in UTC.

It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

May leave with checked errors: TimeError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### \_aug\_time\_now {#sequence-_aug_time_now}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L6)
:::

It is private to its defining scope.

It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

Native C implementation; only its declared contract is visible here.

May leave with checked errors: TimeError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### SystemClock constructor {#sequence-SystemClock-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L8)
:::

Operating-system wall clock. It implements [`Clock`](contracts.md#symbol-Clock).

[Explanation](contracts.md).

### SystemClock.now {#sequence-SystemClock.now}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L9)
:::

Read whole Unix seconds in UTC.

It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

```mermaid
sequenceDiagram
    participant p0 as SystemClock.now

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _aug_time_now() · native boundary
    p0-->>p0: _aug_time_now result: int
    Note over p0: Return _aug_time_now()； required cleanup runs before<br/>exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TimeError
```

## Called contracts

- [Clock](contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_time\_now](contracts-diagrams.md#sequence-_aug_time_now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

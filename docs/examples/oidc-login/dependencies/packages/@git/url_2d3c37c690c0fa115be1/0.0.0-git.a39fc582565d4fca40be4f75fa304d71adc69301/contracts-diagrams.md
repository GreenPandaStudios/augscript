---
title: "package/@git/url\\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@git/url\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["_aug_json_parse · package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1["parse · package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_aug\_json\_parse {#sequence-_aug_json_parse}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as _aug_json_parse

    Note over p0: May leave with checked errors: JsonError
    Note over p0: Native implementation#59; only the declared contract is known
```

### parse {#sequence-parse}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as parse
    participant p1 as _aug_json_parse
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_json_parse(input) · native boundary
    Note over p0: Return _aug_json_parse(input)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: JsonError
```

## Called contracts

- [\_aug\_json\_parse](contracts-diagrams.md#sequence-_aug_json_parse) — package/@git/url\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

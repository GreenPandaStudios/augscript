---
title: "routes.aug diagrams"
generated: true
source: "benchmarks/http/routes.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# routes.aug diagrams

[HTTP benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](routes.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Reply constructor {#sequence-Reply-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](routes.md#source-L2)
:::

It takes `id` as an integer, kept read-only and `message` as a string, kept read-only.

Receive fields: id, message. [Explanation](routes.md).

### reply {#sequence-reply}

::: spec-paragraph specification-paragraph-2
[Source](routes.md#source-L3)
:::

`reply` handles `GET /bench`.

```mermaid
sequenceDiagram
    participant p0 as reply

    Note over p0: GET /bench
    p0->>p0: Reply(id=7, message=”hello”) · construct value
    p0-->>p0: Reply result: Reply
    Note over p0: Return Reply(id=7, message=”hello”)； required cleanup<br/>runs before exit
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

## Called contracts

- [Reply](routes-diagrams.md#sequence-Reply-20-constructor) — routes.aug

---
title: "Diagrams · JSON benchmark"
generated: true
source: "benchmarks/json/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# JSON benchmark diagrams

[JSON benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["parse · package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as parse
    participant p2 as document.decode
    participant p3 as Json
    participant p4 as Json(value=payload).stringify
    participant p5 as encoded.length
    participant p6 as print
    participant p7 as exit
    opt Try body#59; stops on a checked failure
    loop While index #60; 5000
    p0->>p1: parse(input)
    p0->>p2: document.decode()
    p0->>p3: Json(value)
    p0->>p4: Json(value=payload).stringify()
    p0->>p5: encoded.length()
    end
    p0->>p6: print(value)
    end
    opt Catch JsonError
    p0->>p7: exit(status)
    end
```

### Called contracts

- [parse](dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-parse) — package/@git/url\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

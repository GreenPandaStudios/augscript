---
title: "Diagrams · Labeled calls and injection"
generated: true
source: "examples/new-syntax/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Labeled calls and injection diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

```mermaid
flowchart TD
    n0["Greeter · greeter.aug"]
    n1["increment · math.aug"]
    n2["main.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
```

### API calls

```mermaid
flowchart TD
    n0["Greeter · greeter.aug"]
    n1["Greeter.greet · greeter.aug"]
    n2["increment · math.aug"]
    n3["main.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Greeter
    participant p2 as Greeter.greet
    participant p3 as increment
    participant p4 as print
    p0->>p1: Greeter(x)
    p0->>p2: greet(name)
    p0->>p3: increment(value)
    p0->>p4: print(value)
```

### Called contracts

- [Greeter](greeter-diagrams.md#sequence-Greeter-20-constructor) — greeter.aug
- [Greeter.greet](greeter-diagrams.md#sequence-Greeter.greet) — greeter.aug
- [increment](math-diagrams.md#sequence-increment) — math.aug

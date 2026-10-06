---
title: "main.aug diagrams"
generated: true
source: "examples/developer-workflow/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[A small tested application](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Calculator · calculator.aug"]
    n1["load · calculator.aug"]
    n2["main.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
```

## API calls

```mermaid
flowchart TD
    n0["Calculator · calculator.aug"]
    n1["Calculator.add · calculator.aug"]
    n2["load · calculator.aug"]
    n3["main.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Calculator
    participant p2 as numbers.get
    participant p3 as Calculator.add
    participant p4 as print
    participant p5 as pair.get
    participant p6 as unique.length
    participant p7 as fruit.get
    participant p8 as load
    opt Try body#59; stops on a checked failure
    p0->>p1: Calculator()
    p0->>p2: numbers.get(index)
    p0->>p2: numbers.get(index)
    p0->>p3: add(right, left)
    p0->>p4: print(value)
    p0->>p5: pair.get(index)
    p0->>p4: print(value)
    p0->>p6: unique.length()
    p0->>p4: print(value)
    p0->>p7: fruit.get(key)
    p0->>p4: print(value)
    opt Try body#59; stops on a checked failure
    p0->>p8: load(fail)
    p0->>p4: print(value)
    end
    opt Catch FileError
    p0->>p4: print(value)
    end
    end
    opt Catch IndexError
    p0->>p4: print(value)
    end
```

## Called contracts

- [Calculator](calculator-diagrams.md#sequence-Calculator-20-constructor) — calculator.aug
- [Calculator.add](calculator-diagrams.md#sequence-Calculator.add) — calculator.aug
- [load](calculator-diagrams.md#sequence-load) — calculator.aug

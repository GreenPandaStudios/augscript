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
    n0["Calculator"]
    n1["load"]
    n2["main.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Calculator"]
    n1["Calculator.add"]
    n2["load"]
    n3["main.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

:::

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
    participant p3 as calculator: Calculator
    participant p4 as print
    participant p5 as pair.get
    participant p6 as unique.length
    participant p7 as fruit.get
    participant p8 as load
    opt Try body； stops on a checked failure
    p0->>p1: Calculator()
    p1-->>p0: calculator: Calculator
    p0->>p2: numbers.get(index=1)
    p0->>p2: numbers.get(index=0)
    p0->>p3: add(right=numbers.get(index=1), left=numbers.get(index=0))
    p3-->>p0: int
    p0->>p4: print(value=calculator.add(right=numbers.get(index=1), left=numbers.get(index=0)))
    p0->>p5: pair.get(index=1)
    p0->>p4: print(value=pair.get(index=1))
    p0->>p6: unique.length()
    p0->>p4: print(value=unique.length())
    p0->>p7: fruit.get(key=2)
    p0->>p4: print(value=fruit.get(key=2))
    opt Try body； stops on a checked failure
    p0->>p8: load(fail=true)
    p8-->>p0: string
    p0->>p4: print(value=load(fail=true))
    end
    opt Catch FileError
    p0->>p4: print(value=”load failed as expected”)
    end
    end
    opt Catch IndexError
    p0->>p4: print(value=”unexpected index failure”)
    end
```

## Called contracts

- [Calculator](calculator-diagrams.md#sequence-Calculator-20-constructor) — calculator.aug
- [Calculator.add](calculator-diagrams.md#sequence-Calculator.add) — calculator.aug
- [load](calculator-diagrams.md#sequence-load) — calculator.aug

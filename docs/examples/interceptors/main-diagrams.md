---
title: "main.aug diagrams"
generated: true
source: "examples/interceptors/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Greeter"]
    n1["describe"]
    n2["main.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Greeter"]
    n1["Greeter.greet"]
    n2["describe"]
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
[Source](main.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as app
    participant p2 as print
    participant p3 as Greeter
    participant p4 as greeter: Greeter
    opt Try body； stops on a checked failure
    p0->>p1: describe(label=”value”, x=6)
    p1-->>p0: string
    p0->>p2: print(value=describe(label=”value”, x=6))
    end
    opt Catch ValidationError
    p0->>p2: print(value=”rejected”)
    end
    p0->>p3: Greeter(name=”AugScript”)
    p3-->>p0: greeter: Greeter
    p0->>p4: greet()
    p4-->>p0: string
    p0->>p2: print(value=greeter.greet())
    opt Try body； stops on a checked failure
    p0->>p1: describe(x=-1, label=”invalid”)
    p1-->>p0: string
    end
    opt Catch ValidationError
    p0->>p2: print(value=”rejected”)
    end
```

## Called contracts

- [Greeter](app-diagrams.md#sequence-Greeter-20-constructor) — app.aug
- [Greeter.greet](app-diagrams.md#sequence-Greeter.greet) — app.aug
- [describe](app-diagrams.md#sequence-describe) — app.aug

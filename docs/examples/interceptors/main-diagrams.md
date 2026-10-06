---
title: "Diagrams · Function and constructor middleware"
generated: true
source: "examples/interceptors/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

```mermaid
flowchart TD
    n0["Greeter · app.aug"]
    n1["describe · app.aug"]
    n2["main.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
```

### API calls

```mermaid
flowchart TD
    n0["Greeter · app.aug"]
    n1["Greeter.greet · app.aug"]
    n2["describe · app.aug"]
    n3["main.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as describe
    participant p2 as print
    participant p3 as Greeter
    participant p4 as Greeter.greet
    opt Try body#59; stops on a checked failure
    p0->>p1: describe(label, x)
    p0->>p2: print(value)
    end
    opt Catch ValidationError
    p0->>p2: print(value)
    end
    p0->>p3: Greeter(name)
    p0->>p4: greet()
    p0->>p2: print(value)
    opt Try body#59; stops on a checked failure
    p0->>p1: describe(x, label)
    end
    opt Catch ValidationError
    p0->>p2: print(value)
    end
```

### Called contracts

- [Greeter](app-diagrams.md#sequence-Greeter-20-constructor) — app.aug
- [Greeter.greet](app-diagrams.md#sequence-Greeter.greet) — app.aug
- [describe](app-diagrams.md#sequence-describe) — app.aug

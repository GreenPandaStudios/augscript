---
title: "Hashing with Rust BLAKE3 diagrams"
generated: true
source: "examples/native-blake3/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hashing with Rust BLAKE3 diagrams

[Hashing with Rust BLAKE3](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`hashText`](../hashing.md#symbol-hashText) with `value` `"abc"`. If this work raises [`HashError`](../dependencies/packages/%40greenpandastudios/aug-blake3/0.2.0/contracts.md#symbol-HashError) as `error`, it prints `error.message`. [source](../main.md#source-L5-L8)
:::

## Data flow

```mermaid
flowchart TD
    n0["hashing"]
    n1["Startup"]
    n1 -->|"hashText(value) → string"| n0
```

### Package boundaries

::: details hashing package calls

```mermaid
flowchart LR
    n0["hashing"]
    n1["@greenpandastudios/aug-blake3"]
    n0 -->|"hash(input) → string"| n1
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| hashing | @greenpandastudios/aug-blake3 | 1 | [Inputs, results and call sites](index.md#boundary-479434ce6417) |
| Startup | hashing | 1 | [Inputs, results and call sites](index.md#boundary-0e1c118a244b) |

#### Data crossing these boundaries (2 contracts)

#### hashing → @greenpandastudios/aug-blake3 {#boundary-479434ce6417}

::: details 1 operation, 1 site

**[hash](../dependencies/packages/%40greenpandastudios/aug-blake3/0.2.0/api.md#symbol-hash)**

Inputs: input: Bytes. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| hashText | [Call site](../hashing.md#source-L6) · [Caller explanation](../hashing.md#symbol-hashText) |

:::

#### Startup → hashing {#boundary-0e1c118a244b}

::: details 1 operation, 1 site

**[hashText](../hashing.md#symbol-hashText)**

Inputs: value: string. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L6) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| hashing.aug | [Flow and sequences](../hashing-diagrams.md) · [Explanation](../hashing.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

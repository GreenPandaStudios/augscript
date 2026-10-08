---
title: "Compression with zlib diagrams"
generated: true
source: "examples/native-zlib/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Compression with zlib diagrams

[Compression with zlib](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints `text` on [`roundTrip`](../compression.md#symbol-roundTrip). If this work raises [`CompressionError`](../dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/contracts.md#symbol-CompressionError) as `error`, it prints `error.message`. If this work raises `ConversionError`, it prints `"Invalid UTF-8"`. [source](../main.md#source-L5-L10)
:::

## Data flow

```mermaid
flowchart TD
    n0["compression"]
    n1["Startup"]
    n1 -->|"roundTrip → Bytes"| n0
```

### Package boundaries

::: details compression package calls

```mermaid
flowchart LR
    n0["compression"]
    n1["@greenpandastudios/aug-zlib"]
    n0 -->|"compress(input) / decompress(input, maximumOutput) → Bytes"| n1
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| compression | @greenpandastudios/aug-zlib | 2 | [Inputs, results and call sites](index.md#boundary-edb52c0fcadd) |
| Startup | compression | 1 | [Inputs, results and call sites](index.md#boundary-51e19b84bedd) |

#### Data crossing these boundaries (3 contracts)

#### compression → @greenpandastudios/aug-zlib {#boundary-edb52c0fcadd}

::: details 2 operations, 2 sites

**[compress](../dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-compress)**

Inputs: input: Bytes. Result: Bytes.

| Caller or entry | Evidence |
| --- | --- |
| roundTrip | [Call site](../compression.md#source-L7) · [Caller explanation](../compression.md#symbol-roundTrip) |

**[decompress](../dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-decompress)**

Inputs: input: Bytes, maximumOutput: int. Result: Bytes.

| Caller or entry | Evidence |
| --- | --- |
| roundTrip | [Call site](../compression.md#source-L8) · [Caller explanation](../compression.md#symbol-roundTrip) |

:::

#### Startup → compression {#boundary-51e19b84bedd}

::: details 1 operation, 1 site

**[roundTrip](../compression.md#symbol-roundTrip)**

No caller-supplied inputs. Result: Bytes.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L6) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| compression.aug | [Flow and sequences](../compression-diagrams.md) · [Explanation](../compression.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

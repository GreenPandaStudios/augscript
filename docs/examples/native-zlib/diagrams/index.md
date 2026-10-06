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

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

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
    n1["url_43eae362d663f91d140b"]
    n0 -->|"compress(input) / decompress(input, maximumOutput) → Bytes"| n1
```

:::

::: details Data crossing these boundaries (3 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| compression | url\_43eae362d663f91d140b | [compress](../dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md) · input: Bytes | Bytes |
| compression | url\_43eae362d663f91d140b | [decompress](../dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md) · input: Bytes, maximumOutput: int | Bytes |
| Startup | compression | [roundTrip](../compression.md) | Bytes |

:::

## Open a module

| Module | Read |
| --- | --- |
| compression.aug | [Flow and sequences](../compression-diagrams.md) · [Explanation](../compression.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

---
title: "CPU benchmark diagrams"
generated: true
source: "benchmarks/cpu/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU benchmark diagrams

[CPU benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `state` to `123`. It sets `index` to `0`. While `index` is less than `2000000`, it sets `product` to `state` times `48271`; then it sets `state` to `product` minus ((`product` divided by `2147483647`) times `2147483647`); then it increases `index` by `1`. After the loop, it prints `state`. [source](../main.md#source-L3-L9)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

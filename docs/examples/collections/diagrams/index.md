---
title: "Lists, tuples, sets, and maps diagrams"
generated: true
source: "examples/collections/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Lists, tuples, sets, and maps diagrams

[Lists, tuples, sets, and maps](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `numbers` to a list of `int` containing `2`, `4`. With temporary permission to change `numbers`, it appends `6` to `numbers`. It prints the number of elements in `numbers`. It prints the item at index `1` in `numbers`. [source](../main.md#source-L2-L19)
:::

::: spec-paragraph specification-paragraph-2
It sets `scores` to an empty map from `string` to `int`. With temporary permission to change `scores`, it stores `42` in `scores` under `"ada"`. It prints whether `scores` contains the key `"ada"`. It prints the value under `"ada"` in `scores`. [source](../main.md#source-L9-L14)
:::

::: spec-paragraph specification-paragraph-3
It prints the number of elements in `scores`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](../main.md#source-L15-L18)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

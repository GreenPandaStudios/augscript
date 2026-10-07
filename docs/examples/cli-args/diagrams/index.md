---
title: "Command-line arguments diagrams"
generated: true
source: "examples/cli-args/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Command-line arguments diagrams

[Command-line arguments](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `args` to `arguments`. It prints the number of elements in `args`. If the number of elements in `args` is positive, it prints the item at index `0` in `args`. It sets `numbers` to a list of `int` containing `1`, `2`. [source](../main.md#source-L2-L16)
:::

::: spec-paragraph specification-paragraph-2
With temporary permission to change `numbers`, it appends `3` to `numbers`. It prints the item at index `2` in `numbers`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](../main.md#source-L9-L15)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

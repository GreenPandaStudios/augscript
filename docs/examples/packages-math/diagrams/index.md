---
title: "Create a package diagrams"
generated: true
source: "examples/packages/math/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Create a package diagrams

[Create a package](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| src/arithmetic.aug | [Flow and sequences](../src/arithmetic-diagrams.md) · [Explanation](../src/arithmetic.md) |
| src/export.aug | [Flow and sequences](../src/export-diagrams.md) · [Explanation](../src/export.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

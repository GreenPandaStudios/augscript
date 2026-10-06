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

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| src/arithmetic.aug | [Flow and sequences](../src/arithmetic-diagrams.md) · [Explanation](../src/arithmetic.md) |
| src/export.aug | [Flow and sequences](../src/export-diagrams.md) · [Explanation](../src/export.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

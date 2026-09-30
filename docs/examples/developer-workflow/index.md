---
title: "A small tested application"
generated: true
source: "examples/developer-workflow"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A small tested application

A calculator logs each addition. Its nearby tests replace the logger and verify both labeled inputs and fresh setup.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Follow the program

Read [`main.aug`](main.md). Startup supplies providers, uses collections, invokes the calculator, and catches a simulated load failure.

Read [`calculator.aug`](calculator.md). Read the arithmetic contract, the injected logger, and the same-file cases together. The private silent adapter keeps tests independent of output.

Read [`logging/logger.aug`](logging/logger.md). This is the contract used by both the production logger and the test adapter.

## Project files

- [`main.aug`](main.md)
- [`calculator.aug`](calculator.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/developer-workflow
aug spec examples/developer-workflow
aug test examples/developer-workflow
aug run examples/developer-workflow
```

[Browse all examples](../index.md)

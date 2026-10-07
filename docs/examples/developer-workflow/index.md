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

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

## Follow the program

Read the explanation of [`main.aug`](main.md#specification). Startup supplies providers, uses collections, invokes the calculator, and catches a simulated load failure.

Read the explanation of [`calculator.aug`](calculator.md#specification). The calculator receives a logger and adds two inputs. Its tests supply a private silent logger.

Read the explanation of [`logging/logger.aug`](logging/logger.md#specification). The production logger and test adapter implement this interface.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`calculator.aug`](calculator.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)


## Try this project

[Download this project](/downloads/developer-workflow.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd developer-workflow
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

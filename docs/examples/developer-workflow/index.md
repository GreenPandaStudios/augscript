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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Follow the program

Read [`main.aug`](main.md). Startup supplies providers, uses collections, invokes the calculator, and catches a simulated load failure.

Read [`calculator.aug`](calculator.md). The calculator receives a logger and adds two inputs. Its tests supply a private silent logger.

Read [`logging/logger.aug`](logging/logger.md). The production logger and test adapter implement this interface.

[Explore the generated project diagrams](diagrams/index.md) to move from areas and modules to class interactions and API sequences.

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

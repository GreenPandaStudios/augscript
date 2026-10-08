---
title: "Labeled calls and injection"
generated: true
source: "examples/new-syntax"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Labeled calls and injection

Construct an object with an injected dependency, call functions with labeled inputs, and run same-file tests.

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)


## Try this project

[Download this project](/downloads/new-syntax.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd new-syntax
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

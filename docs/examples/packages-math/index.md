---
title: "Create a package"
generated: true
source: "examples/packages/math"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Create a package

Export an arithmetic function from a library and test it.

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`src/arithmetic.aug`](src/arithmetic.md)
- [`src/export.aug`](src/export.md)

- [`aug-package.json`](aug-package-json.md)
- [`package.json`](package-json.md)

## Try this project

[Download this project](/downloads/packages-math.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. Both the application and its neighboring arithmetic library are included. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd packages-math/math
aug check .
aug spec .
aug test .
aug pack .
```

[Browse all examples](../index.md)

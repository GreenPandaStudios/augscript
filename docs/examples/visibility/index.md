---
title: "Private state and helpers"
generated: true
source: "examples/visibility"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Private state and helpers

Keep underscore-prefixed implementation details inside their scope.

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)


## Try this project

[Download this project](/downloads/visibility.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd visibility
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

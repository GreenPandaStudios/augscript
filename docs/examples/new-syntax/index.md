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

Constructor injection, named inputs, ordinary functions, and same-file tests.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)


## Try this project

[Download this project](/downloads/new-syntax.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd new-syntax
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

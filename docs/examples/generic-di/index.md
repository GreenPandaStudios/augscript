---
title: "Generic dependency injection"
generated: true
source: "examples/generic-di"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic dependency injection

Bind a generic interface and resolve a class that uses it.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`types.aug`](types.md)


## Try this project

[Download this project](/downloads/generic-di.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd generic-di
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

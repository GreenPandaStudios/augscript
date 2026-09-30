---
title: "Move ownership"
generated: true
source: "examples/ownership-transfer"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Move ownership

Transfer an owned resource between labeled calls.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)


## Try this project

[Download this project](/downloads/ownership-transfer.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd ownership-transfer
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

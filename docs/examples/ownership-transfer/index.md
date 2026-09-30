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

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/ownership-transfer
aug spec examples/ownership-transfer
aug run examples/ownership-transfer
```

[Browse all examples](../index.md)

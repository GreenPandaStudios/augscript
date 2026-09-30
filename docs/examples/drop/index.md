---
title: "Resource cleanup"
generated: true
source: "examples/drop"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Resource cleanup

Release an owned resource when its lifetime ends.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/drop
aug spec examples/drop
aug run examples/drop
```

[Browse all examples](../index.md)

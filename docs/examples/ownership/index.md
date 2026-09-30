---
title: "Read access and mutable borrows"
generated: true
source: "examples/ownership"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Read access and mutable borrows

Share a reference for reading and grant explicit access for mutation.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/ownership
aug spec examples/ownership
aug run examples/ownership
```

[Browse all examples](../index.md)

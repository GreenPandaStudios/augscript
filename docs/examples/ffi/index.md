---
title: "A native C boundary"
generated: true
source: "examples/ffi"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A native C boundary

Declare a C operation and call it inside an unsafe block.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`native.aug`](native.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/ffi
aug spec examples/ffi
aug run examples/ffi
```

[Browse all examples](../index.md)

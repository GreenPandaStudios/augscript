---
title: "Function and constructor middleware"
generated: true
source: "examples/interceptors"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware

Layer interceptors, map inputs, and keep logging dependencies explicit.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/interceptors
aug spec examples/interceptors
aug run examples/interceptors
```

[Browse all examples](../index.md)

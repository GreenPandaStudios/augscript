---
title: "Checked failures"
generated: true
source: "examples/errors"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked failures

Declare errors with unless, catch them, and run cleanup.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/errors
aug spec examples/errors
aug run examples/errors
```

[Browse all examples](../index.md)

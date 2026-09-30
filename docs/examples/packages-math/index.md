---
title: "Create a package"
generated: true
source: "examples/packages/math"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Create a package

Publish a small arithmetic library through export.aug and test its public surface.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`src/arithmetic.aug`](src/arithmetic.md)
- [`src/export.aug`](src/export.md)

- [`aug-package.json`](aug-package-json.md)
- [`package.json`](package-json.md)

## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/packages/math
aug spec examples/packages/math
aug test examples/packages/math
aug pack examples/packages/math
```

[Browse all examples](../index.md)

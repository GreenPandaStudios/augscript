---
title: "Use a package"
generated: true
source: "examples/packages/app"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Use a package

Install the neighboring arithmetic package and import it through a local alias.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug install examples/packages/app --offline
aug check examples/packages/app
aug spec examples/packages/app
aug run examples/packages/app
```

[Browse all examples](../index.md)

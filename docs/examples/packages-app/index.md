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

Read a file below to see its highlighted source and the Markdown produced by `aug spec`. Choose **Indentation** or **Braces** above the code. Both views describe the same checked program; your choice is kept when you open another file.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

From a repository checkout with August installed:

```sh
aug install examples/packages/app --offline
aug check examples/packages/app
aug spec examples/packages/app
aug run examples/packages/app
```

[Browse all examples](../index.md)

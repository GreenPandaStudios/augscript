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

Read a file below to see its highlighted source and the Markdown produced by `aug spec`. Choose **Indentation** or **Braces** above the code. Both views describe the same checked program; your choice is kept when you open another file.

## Project files

- [`src/arithmetic.aug`](src/arithmetic.md)
- [`src/export.aug`](src/export.md)

- [`aug-package.json`](aug-package-json.md)
- [`package.json`](package-json.md)

## Try this project

From a repository checkout with August installed:

```sh
aug check examples/packages/math
aug spec examples/packages/math
aug test examples/packages/math
aug pack examples/packages/math
```

[Browse all examples](../index.md)

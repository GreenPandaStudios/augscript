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

Export an arithmetic function from a library and test it.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Project files

- [`src/arithmetic.aug`](src/arithmetic.md)
- [`src/export.aug`](src/export.md)

- [`aug-package.json`](aug-package-json.md)
- [`package.json`](package-json.md)

## Try this project

[Download this project](/downloads/packages-math.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. Both the application and its neighboring arithmetic library are included. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd packages-math/math
aug check .
aug spec .
aug test .
aug pack .
```

[Browse all examples](../index.md)

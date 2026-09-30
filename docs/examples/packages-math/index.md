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

[Download this project](/downloads/packages-math.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Both the application and its neighboring arithmetic library are included. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd packages-math/math
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next test .
npx @greenpandastudios/aug-cli@next pack .
```

[Browse all examples](../index.md)

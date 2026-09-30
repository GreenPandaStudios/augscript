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

[Download this project](/downloads/ffi.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd ffi
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

[Browse all examples](../index.md)

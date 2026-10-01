---
title: "Compression with zlib"
generated: true
source: "examples/native-zlib"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Compression with zlib

Compress a buffer with zlib and verify the restored bytes. A fixed output limit bounds decompression.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

This project requires the August `0.21.0` LLVM preview on macOS 14+ with Apple Silicon. The library archive is public; the matching compiler release is still being qualified.

## Project files

- [`main.aug`](main.md)
- [`compression.aug`](compression.md)


## Try this project

[Download this project](/downloads/native-zlib.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-zlib
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

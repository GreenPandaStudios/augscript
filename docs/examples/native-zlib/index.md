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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

This project runs with August `0.23.0` on macOS 14+ with Apple Silicon, or GNU/Linux x64 or ARM64 with glibc 2.36+. The CLI obtains the verified compiler and library artifacts automatically.

## Project files

- [`main.aug`](main.md)
- [`compression.aug`](compression.md)


## Try this project

[Download this project](/downloads/native-zlib.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-zlib
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

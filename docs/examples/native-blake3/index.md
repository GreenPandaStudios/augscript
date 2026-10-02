---
title: "Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hashing with Rust BLAKE3

Import a Rust implementation through an ordinary August package and verify a published BLAKE3 hash vector.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

This project requires the August `0.21.0` LLVM preview on macOS 14+ with Apple Silicon, or Debian/Ubuntu GNU/Linux x64 or ARM64 with glibc 2.36+. The library archives are public; the matching compiler release is still being qualified.

## Project files

- [`main.aug`](main.md)
- [`hashing.aug`](hashing.md)


## Try this project

[Download this project](/downloads/native-blake3.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-blake3
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

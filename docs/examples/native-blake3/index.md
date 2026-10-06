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

Hash a buffer with the Rust BLAKE3 crate and compare a known digest.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

This project runs with August `0.23.0` on macOS 14+ with Apple Silicon, or GNU/Linux x64 or ARM64 with glibc 2.36+. The CLI obtains the verified compiler and library artifacts automatically.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`hashing.aug`](hashing.md)


## Try this project

[Download this project](/downloads/native-blake3.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-blake3
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

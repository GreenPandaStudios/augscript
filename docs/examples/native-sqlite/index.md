---
title: "A database with SQLite"
generated: true
source: "examples/native-sqlite"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A database with SQLite

Create an in-memory database, insert a labeled bound value, and query it through the real SQLite implementation. Mutation requires a borrow; scope exit closes the database.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

This project requires the August `0.21.0` LLVM preview on macOS 14+ with Apple Silicon, or Debian/Ubuntu GNU/Linux x64 or ARM64 with glibc 2.36+. The library archives are public; the matching compiler release is still being qualified.

## Project files

- [`main.aug`](main.md)
- [`database.aug`](database.md)


## Try this project

[Download this project](/downloads/native-sqlite.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-sqlite
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

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

Create an in-memory SQLite database, insert a bound value, and query it. Borrow the database for updates; scope exit closes it.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

This project runs with August `0.23.0` on macOS 14+ with Apple Silicon, or GNU/Linux x64 or ARM64 with glibc 2.36+. The CLI obtains the verified compiler and library artifacts automatically.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`database.aug`](database.md)


## Try this project

[Download this project](/downloads/native-sqlite.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-sqlite
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

---
title: "Hello world with dependencies"
generated: true
source: "examples/hello"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hello world with dependencies

A greeter, a logger, narrow folder exports, and explicit application bindings.

Read a file below to see its highlighted source and the Markdown produced by `aug spec`. Choose **Indentation** or **Braces** above the code. Both views describe the same checked program; your choice is kept when you open another file.

## Project files

- [`main.aug`](main.md)
- [`app/export.aug`](app/export.md)
- [`app/greeter.aug`](app/greeter.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)


## Try this project

From a repository checkout with August installed:

```sh
aug check examples/hello
aug spec examples/hello
aug run examples/hello
```

[Browse all examples](../index.md)

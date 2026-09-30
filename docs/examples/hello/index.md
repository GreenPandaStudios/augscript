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

The application prints a greeting through an injected logger. Its entry point selects the providers, and each folder exposes a small public surface.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Follow the program

Read [`main.aug`](main.md). Startup binds the console, logger, and application, then resolves the greeter and calls it.

Read [`app/greeter.aug`](app/greeter.md). The greeter receives its logger in the header and delegates the greeting to it. The interface states the console effect.

Read [`logging/export.aug`](logging/export.md). This is the logging folder's public surface. Callers can import the exported contract and provider.

Read [`logging/logger.aug`](logging/logger.md). The contract describes the log operation and its output capability; the console provider implements it.

## Project files

- [`main.aug`](main.md)
- [`app/export.aug`](app/export.md)
- [`app/greeter.aug`](app/greeter.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/hello
aug spec examples/hello
aug run examples/hello
```

[Browse all examples](../index.md)

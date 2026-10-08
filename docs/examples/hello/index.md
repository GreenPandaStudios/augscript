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

Print a greeting through an injected logger. Startup selects the providers, and export files choose what each folder makes public.

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

## Follow the program

Read the explanation of [`main.aug`](main.md#specification). Startup binds the console, logger, and application, then resolves the greeter and calls it.

Read the explanation of [`app/greeter.aug`](app/greeter.md#specification). The greeter receives its logger in the header and delegates the greeting to it. The interface states the console effect.

Read the explanation of [`logging/export.aug`](logging/export.md#specification). The logging folder exports Logger and ConsoleLogger for callers.

Read the explanation of [`logging/logger.aug`](logging/logger.md#specification). Logger requires a log method. ConsoleLogger writes the message through its injected console.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`app/export.aug`](app/export.md)
- [`app/greeter.aug`](app/greeter.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)


## Try this project

[Download this project](/downloads/hello.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd hello
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

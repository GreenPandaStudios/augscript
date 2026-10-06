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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Follow the program

Read [`main.aug`](main.md). Startup binds the console, logger, and application, then resolves the greeter and calls it.

Read [`app/greeter.aug`](app/greeter.md). The greeter receives its logger in the header and delegates the greeting to it. The interface states the console effect.

Read [`logging/export.aug`](logging/export.md). The logging folder exports Logger and ConsoleLogger for callers.

Read [`logging/logger.aug`](logging/logger.md). Logger requires a log method. ConsoleLogger writes the message through its injected console.

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

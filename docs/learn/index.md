---
next:
  text: Your first project
  link: /getting-started
---

# The August book

This book teaches you to read, write, and change August programs. It assumes you have written code in another language. You do not need to know C to follow the lessons; the toolchain uses a C compiler when you run a program.

Start with a working application. Then add one idea at a time: labeled inputs, data and failures, module boundaries, dependencies, and controlled mutation. Each chapter contains a complete small project. Save its files together, run the commands, and compare your result with the output shown.

## Read in order

| Chapter | What you will do |
| --- | --- |
| [Your first project](../getting-started.md) | Install the toolchain, run a greeting, test it, and generate its specification. |
| [Values and functions](values-and-functions.md) | Write a calculation and read labeled calls and conditions. |
| [Data and failures](data-and-errors.md) | Return an immutable record, distinguish null from a value, and recover from a checked failure. |
| [Modules and dependencies](modules-and-dependencies.md) | Export a folder's public surface and supply an implementation at startup. |
| [State and tests](state-and-tests.md) | Change an object through a borrow and verify that test setup is fresh for each case. |
| [Change an unfamiliar module](../guides/change-a-module.md) | Trace a dependency, make a bounded change, and review its tests and updated spec. |

Chapters use indentation to keep the first examples compact. [Indentation and braces](../reference.md#blocks-and-statement-boundaries) have the same meaning, and the [gallery](../examples/index.md) displays both. Semicolons are optional. These are syntax choices; they do not change an application's contracts.

## Use the rest of the documentation

The [task guides](../guides/index.md) cover testing, services, packages, specifications, and measurement. The [language reference](../reference.md) states detailed rules, including cases these lessons leave for later. Library API pages describe exported operations. You can use those pages without reading the book from beginning to end.

August is still experimental. The lessons teach the implemented language; [readiness](../production-readiness.md) describes the limits of deploying it. The lessons' complete source examples are checked and run by the repository's documentation tests.

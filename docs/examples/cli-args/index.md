---
title: "Command-line arguments"
generated: true
source: "examples/cli-args"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Command-line arguments

Read arguments, inspect collections, and return a process exit status.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

[Download this project](/downloads/cli-args.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd cli-args
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

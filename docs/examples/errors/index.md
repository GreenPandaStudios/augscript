---
title: "Checked failures"
generated: true
source: "examples/errors"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked failures

Declare errors with unless, catch them, and run cleanup.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to move from areas and modules to class interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)


## Try this project

[Download this project](/downloads/errors.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd errors
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

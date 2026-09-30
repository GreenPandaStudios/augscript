---
title: "Function and constructor middleware"
generated: true
source: "examples/interceptors"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware

Layer interceptors, map inputs, and keep logging dependencies explicit.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)


## Try this project

[Download this project](/downloads/interceptors.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd interceptors
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

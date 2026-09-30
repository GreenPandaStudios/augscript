---
title: "Resource cleanup"
generated: true
source: "examples/drop"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Resource cleanup

Release an owned resource when its lifetime ends.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)


## Try this project

[Download this project](/downloads/drop.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd drop
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

---
title: "Modules and composition"
generated: true
source: "examples/approved-design"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Modules and composition

Combine domain modules, generic values, explicit capabilities, and scoped providers.

Read a file below to see its highlighted source and the Markdown produced by `aug spec`. Choose **Indentation** or **Braces** above the code. Both views describe the same checked program; your choice is kept when you open another file.

## Project files

- [`main.aug`](main.md)
- [`counters.aug`](counters.md)
- [`domain/app.aug`](domain/app.md)
- [`domain/export.aug`](domain/export.md)
- [`domain/models.aug`](domain/models.md)
- [`domain/numbers.aug`](domain/numbers.md)

- [`main.yaml`](main-yaml.md)

## Try this project

From a repository checkout with August installed:

```sh
aug check examples/approved-design
aug spec examples/approved-design
aug test examples/approved-design
aug run examples/approved-design
```

[Browse all examples](../index.md)

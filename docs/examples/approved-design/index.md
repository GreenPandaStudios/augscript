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

Startup combines narrow domain exports with a scoped counter provider. Records and validation keep data and checked failures visible.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Follow the program

Read [`main.aug`](main.md). Follow the domain imports, provider choices, explicit scope, and checked failure before opening the implementation files.

Read [`domain/export.aug`](domain/export.md). The export file gives callers the folder's deliberate public API.

Read [`domain/numbers.aug`](domain/numbers.md). The validation interceptor rejects a negative input. Tests cover successful doubling and recovery from that failure.

## Project files

- [`main.aug`](main.md)
- [`counters.aug`](counters.md)
- [`domain/app.aug`](domain/app.md)
- [`domain/export.aug`](domain/export.md)
- [`domain/models.aug`](domain/models.md)
- [`domain/numbers.aug`](domain/numbers.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/approved-design.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd approved-design
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next test .
npx @greenpandastudios/aug-cli@next run .
```

[Browse all examples](../index.md)

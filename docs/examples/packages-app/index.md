---
title: "Use a package"
generated: true
source: "examples/packages/app"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Use a package

Install the neighboring arithmetic package and import it through a local alias.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/packages-app.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. Both the application and its neighboring arithmetic library are included. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd packages-app/app
aug install . --offline
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)

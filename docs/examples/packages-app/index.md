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

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/packages-app.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Both the application and its neighboring arithmetic library are included. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd packages-app/app
npx @greenpandastudios/aug-cli@next install . --offline
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

[Browse all examples](../index.md)

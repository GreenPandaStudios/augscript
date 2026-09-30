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

[Download this project](/downloads/drop.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd drop
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

[Browse all examples](../index.md)

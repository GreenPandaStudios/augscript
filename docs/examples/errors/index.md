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

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)


## Try this project

[Download this project](/downloads/errors.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd errors
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

[Browse all examples](../index.md)

---
title: "package.json · Create a package"
generated: true
source: "examples/packages/math/package.json"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `package.json`

[Create a package](index.md) · Project configuration

```json
{
  "name": "@example/aug-math",
  "version": "0.1.0",
  "description": "An August package authoring example",
  "license": "MIT",
  "files": ["src", "aug-package.json", "README.md"],
  "exports": { "./aug-package.json": "./aug-package.json" },
  "dependencies": {}
}
```

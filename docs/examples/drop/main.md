---
title: "main.aug · Resource cleanup"
generated: true
source: "examples/drop/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `resource` of type [`Resource`](resource.md#symbol-Resource) to a [`Resource`](resource.md#symbol-Resource). `resource` of type [`Resource`](resource.md#symbol-Resource) owns this value. It prints `"using resource"`.

### Dependencies

It uses [`Resource`](resource.md#symbol-Resource) from `resource`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

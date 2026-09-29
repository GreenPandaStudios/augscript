---
title: "app/export.aug · Hello world with dependencies"
generated: true
source: "examples/hello/app/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `app/export.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](export.md)
- [`app/greeter.aug`](greeter.md)
- [`logging/console.aug`](../logging/console.md)
- [`logging/export.aug`](../logging/export.md)
- [`logging/logger.aug`](../logging/logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
export Greeter from greeter
```

```aug [Braces]
export Greeter from greeter
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

- Export the declaration `Greeter` from [`greeter.aug`](greeter.md#symbol-Greeter).

::::

:::::

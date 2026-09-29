---
title: "main.aug · Startup benchmark"
generated: true
source: "benchmarks/startup/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Startup benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
print(value=7)
```

```aug [Braces]
print(value=7)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

- Call `print` with `value` as `7`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::

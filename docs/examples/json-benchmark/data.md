---
title: "data.aug · JSON benchmark"
generated: true
source: "benchmarks/json/data.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `data.aug`

[JSON benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
record Payload(int id, string message, List<int> values)
```

```aug [Braces]
record Payload(int id, string message, List<int> values)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Payload"></a>
### `Payload` · immutable record · [source](data.md#code)

**Inputs:** Take `id` (`int`); store read-only. Take `message` (`string`); store read-only. Take `values` (`List<int>`); store read-only.

::::

:::::

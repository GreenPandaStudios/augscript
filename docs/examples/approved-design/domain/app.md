---
title: "domain/app.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `domain/app.aug`

[Modules and composition](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`counters.aug`](../counters.md)
- [`domain/app.aug`](app.md)
- [`domain/export.aug`](export.md)
- [`domain/models.aug`](models.md)
- [`domain/numbers.aug`](numbers.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
import Fruit from models
/** The application's explicit startup operation. */
interface Application:
    /** Writes the fruit names through the selected console. */
    start() uses Console.write
/** Construction stores dependencies; start performs the visible external work. */
ApplicationImpl(resolve Console console) implements Application:
    start() uses console.write:
        fruit to [Fruit(code=1, name="apple"), Fruit(name="pear", code=2)]
        for item in fruit:
            console.write(value=item.name)
```

```aug [Braces]
import Console from august.io
import Fruit from models
/** The application's explicit startup operation. */
interface Application {
    /** Writes the fruit names through the selected console. */
    start() uses Console.write
}
/** Construction stores dependencies; start performs the visible external work. */
ApplicationImpl(resolve Console console) implements Application {
    start() uses console.write {
        fruit to [Fruit(code=1, name="apple"), Fruit(name="pear", code=2)]
        for item in fruit {
            console.write(value=item.name)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Application"></a>
### `Application` · interface · [source](app.md#code)

The application's explicit startup operation.

<a id="symbol-Application.start"></a>
#### `Application.start` · [source](app.md#code)

Writes the fruit names through the selected console.

Uses [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-ApplicationImpl"></a>
### `ApplicationImpl` · class · [source](app.md#code)

Construction stores dependencies; start performs the visible external work. Implements [`Application`](app.md#symbol-Application).

**Inputs:** Resolve [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`; store read-only.

<a id="symbol-ApplicationImpl.start"></a>
#### `ApplicationImpl.start` · [source](app.md#code)

Writes the fruit names through the selected console.

Uses [`console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Set `fruit` to a list containing a new [`Fruit`](models.md#symbol-Fruit) with `code` as `1`, `name` as `"apple"`, a new [`Fruit`](models.md#symbol-Fruit) with `name` as `"pear"`, `code` as `2`.
- For each `item` in a snapshot of `fruit`:
  - Call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` as `name` of `item`.

### Dependencies

- [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`Fruit`](models.md#symbol-Fruit) from `models`: construct with `code`: `int`, `name`: `string`; read `name` (`string`).

::::

:::::

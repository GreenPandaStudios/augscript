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
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Writes the fruit names through the selected console. It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-ApplicationImpl"></a>
### `ApplicationImpl` · class · [source](app.md#code)

Construction stores dependencies; start performs the visible external work. Implements [`Application`](app.md#symbol-Application). Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console), stored read-only.

<a id="symbol-ApplicationImpl.start"></a>
#### `ApplicationImpl.start` · [source](app.md#code)

Writes the fruit names through the selected console. It can use [`console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It sets `fruit` to a list containing a new [`Fruit`](models.md#symbol-Fruit) (`code` set to `1` and `name` set to `"apple"`), a new [`Fruit`](models.md#symbol-Fruit) (`name` set to `"pear"` and `code` set to `2`). For each `item` in a snapshot of `fruit`, it calls [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to `item.name`).

### Dependencies

The file uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`Fruit`](models.md#symbol-Fruit) from `models`. Construction takes `code` as `int` and `name` as `string`. `name` is a read-only field of type `string`.

::::

:::::

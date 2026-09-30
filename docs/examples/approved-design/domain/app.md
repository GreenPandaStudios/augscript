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

Writes the fruit names through the selected console. It can call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-ApplicationImpl"></a>
### `ApplicationImpl` · class · [source](app.md#code)

Construction stores dependencies; start performs the visible external work. It implements [`Application`](app.md#symbol-Application). The `console` dependency is injected as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) and stored read-only.

<a id="symbol-ApplicationImpl.start"></a>
#### `ApplicationImpl.start` · [source](app.md#code)

Writes the fruit names through the selected console. It sets `fruit` to a list containing a [`Fruit`](models.md#symbol-Fruit) with `code` `1` and `name` `"apple"`, a [`Fruit`](models.md#symbol-Fruit) with `name` `"pear"` and `code` `2`. For each `item` in a snapshot of `fruit`, it passes `item.name` to [`console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Fruit`](models.md#symbol-Fruit) (`name`) from `models`. These links explain the full dependency contracts.

::::

:::::

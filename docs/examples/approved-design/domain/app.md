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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Application`](app.md#symbol-Application) is an interface.
- [`ApplicationImpl`](app.md#symbol-ApplicationImpl) is a class implementing `Application`.

### `Application` {#symbol-Application}

[source](app.md#code)

Interface.

**Author documentation**

The application's explicit startup operation.

#### `Application.start` {#symbol-Application.start}

[source](app.md#code)

Returns: no value.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Writes the fruit names through the selected console.

### `ApplicationImpl` {#symbol-ApplicationImpl}

[source](app.md#code)

Behavioral class.

Satisfies [`Application`](app.md#symbol-Application).

**Author documentation**

Construction stores dependencies; start performs the visible external work.

**Inputs**

- `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it — stored as `console` and read-only after initialization.

#### `ApplicationImpl.start` {#symbol-ApplicationImpl.start}

[source](app.md#code)

Returns: no value.

Capabilities: [`console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Set `fruit` to a list containing call [`Fruit`](models.md#symbol-Fruit) with `code` = `1`; `name` = `"apple"`, call [`Fruit`](models.md#symbol-Fruit) with `name` = `"pear"`; `code` = `2`.
- For each `item` in a snapshot of `fruit`, in iteration order:
  - Call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` = `name` of `item`.

**Author documentation**

Writes the fruit names through the selected console.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`Fruit`](models.md#symbol-Fruit)

Record from `models`.

- Construct with `code`: `int`, `name`: `string` → [`Fruit`](models.md#symbol-Fruit).
- Read `name` (`string`).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

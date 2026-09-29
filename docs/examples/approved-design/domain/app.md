---
title: "domain/app.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`Fruit`](models.md#symbol-Fruit)

Available from `models`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `code`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Fruit`](models.md#symbol-Fruit).

Field `name`: `string`. Read-only after initialization.

### `Application` {#symbol-Application}

[source](app.md#code)

Interface.

**Author documentation**

The application's explicit startup operation.

#### `Application.start` {#symbol-Application.start}

[source](app.md#code)

Result: finish without a result.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

Writes the fruit names through the selected console.

Interface contract. A selected implementation supplies the behavior.

### `ApplicationImpl` {#symbol-ApplicationImpl}

[source](app.md#code)

Behavioral class.

Satisfies [`Application`](app.md#symbol-Application).

**Author documentation**

Construction stores dependencies; start performs the visible external work.

**Inputs and dependencies**

- `console`: [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them. Store it as `console`. The field is read-only after initialization.

#### `ApplicationImpl.start` {#symbol-ApplicationImpl.start}

[source](app.md#code)

Result: finish without a result.

Capabilities: [`console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

Writes the fruit names through the selected console.

**Behavior when execution reaches this operation**

- Set `fruit` to a list containing the result of call [`Fruit`](models.md#symbol-Fruit) with `code` set to `1`; `name` set to `"apple"`, the result of call [`Fruit`](models.md#symbol-Fruit) with `name` set to `"pear"`; `code` set to `2`.
- For each `item` in a snapshot of `fruit`, in iteration order:
  - Call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` set to `name` of `item`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

---
title: "main.aug · Modules and composition"
generated: true
source: "examples/approved-design/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Modules and composition](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counters.aug`](counters.md)
- [`domain/app.aug`](domain/app.md)
- [`domain/export.aug`](domain/export.md)
- [`domain/models.aug`](domain/models.md)
- [`domain/numbers.aug`](domain/numbers.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console and SystemConsole from august.io
import Application and ApplicationImpl and Fruit and double and RangeError from domain
import Counter and Counters from counters
implement Console with SystemConsole
implement Application with ApplicationImpl
include Counters
resolve Application to app
app.start()
names to {1: "apple", 2: "pear"}
match names.get(key=2):
    when null:
        print(value="missing fruit")
    when some name:
        print(value=name)
(code, label) to (3, "plum")
print(value={Fruit(code=code, name=label), Fruit(name=label, code=code)}.length())
scope:
    resolve Counter to counter
    borrow counter:
        counter.increment()
    print(value=counter.value())
try:
    print(value=double(amount=7))
    double(amount=-1)
catch RangeError error:
    print(value="negative amount rejected")
```

```aug [Braces]
import Console and SystemConsole from august.io
import Application and ApplicationImpl and Fruit and double and RangeError from domain
import Counter and Counters from counters
implement Console with SystemConsole
implement Application with ApplicationImpl
include Counters
resolve Application to app
app.start()
names to {1: "apple", 2: "pear"}
match names.get(key=2) {
    when null {
        print(value="missing fruit")
    }
    when some name {
        print(value=name)
    }
}
(code, label) to (3, "plum")
print(value={Fruit(code=code, name=label), Fruit(name=label, code=code)}.length())
scope {
    resolve Counter to counter
    borrow counter {
        counter.increment()
    }
    print(value=counter.value())
}
try {
    print(value=double(amount=7))
    double(amount=-1)
}
catch RangeError error {
    print(value="negative amount rejected")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Include providers from `Counters`.
- Register 2 dependency providers before startup.
- Run startup operations with checked error recovery.
- Run 7 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) when `Application` is requested. Reuse one instance. Required dependencies: `Console`.
- Include the providers from [`Counters`](counters.md#symbol-Counters) before execution.

### Startup, in source order

- Set `app` to the instance provided for `Application`.
- Call [`Application.start`](domain/app.md#symbol-Application.start) on `app`.
- Set `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`.
- Select the matching case for call `get` on `names` with `key` = `2`:
  - A null value, including omitted optional input:
    - Call `print` with `value` = `"missing fruit"`.
  - A present, non-null value, named `name`:
    - Call `print` with `value` = `name`.
- Split a tuple containing `3`, `"plum"` into `code`, `label`, in that order.
- Call `print` with `value` = call `length` on a set containing call [`Fruit`](domain/models.md#symbol-Fruit) with `code` = `code`; `name` = `label`, call [`Fruit`](domain/models.md#symbol-Fruit) with `name` = `label`; `code` = `code`.
- Create a dependency and task scope. Join its child tasks and release scoped values before leaving:
  - Set `counter` to the instance provided for `Counter`.
  - Grant exclusive mutable access to `counter` for this block, then end the borrow:
    - Call [`Counter.increment`](counters.md#symbol-Counter.increment) on `counter`.
  - Call `print` with `value` = call [`Counter.value`](counters.md#symbol-Counter.value) on `counter`.
- Try these operations:
  - Call `print` with `value` = call [`double`](domain/numbers.md#symbol-double) with `amount` = `7`.
  - Call [`double`](domain/numbers.md#symbol-double) with `amount` = `-1`.
- If they fail with [`RangeError`](domain/numbers.md#symbol-RangeError), name the failure `error` and recover:
  - Call `print` with `value` = `"negative amount rejected"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`Counter`](counters.md#symbol-Counter)

Interface from `counters`.

- [`Counter.increment`](counters.md#symbol-Counter.increment) (no caller inputs) → `void`; changes `self`.
- [`Counter.value`](counters.md#symbol-Counter.value) (no caller inputs) → `int`.

#### [`Counters`](counters.md#symbol-Counters)

Composition from `counters`.

Used as a type or provider.

#### [`Application`](domain/app.md#symbol-Application)

Interface from `domain`.

- [`Application.start`](domain/app.md#symbol-Application.start) (no caller inputs) → `void`; uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl)

Class from `domain`.

Used as a type or provider.

#### [`Fruit`](domain/models.md#symbol-Fruit)

Record from `domain`.

- Construct with `code`: `int`, `name`: `string` → [`Fruit`](domain/models.md#symbol-Fruit).

#### [`RangeError`](domain/numbers.md#symbol-RangeError)

Class from `domain`.

Used as a type or provider.

#### [`double`](domain/numbers.md#symbol-double)

Function from `domain`.

- [`double`](domain/numbers.md#symbol-double) (`amount`: `int`) → `int`; can fail with `RangeError`.

### Built-in operations used by this file

- `Map<int, string>.get` (`key`: `int`) → `optional string`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Set<Fruit>.length` (no inputs) → `int`: Read the number of elements.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

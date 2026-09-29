---
title: "main.aug · Modules and composition"
generated: true
source: "examples/approved-design/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`Counter`](counters.md#symbol-Counter)

Available from `counters`.

Interface. Follow the linked specification for its full explanation.

**[`Counter.increment`](counters.md#symbol-Counter.increment)**

Result: finish without a result.

Changes: `self`.

**[`Counter.value`](counters.md#symbol-Counter.value)**

Result: `int`.

#### [`Counters`](counters.md#symbol-Counters)

Available from `counters`.

Composition. Follow the linked specification for its full explanation.

#### [`Application`](domain/app.md#symbol-Application)

Available from `domain`.

Interface. Follow the linked specification for its full explanation.

**[`Application.start`](domain/app.md#symbol-Application.start)**

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl)

Available from `domain`.

Class. Follow the linked specification for its full explanation.

#### [`Fruit`](domain/models.md#symbol-Fruit)

Available from `domain`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `code`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Fruit`](domain/models.md#symbol-Fruit).

#### [`RangeError`](domain/numbers.md#symbol-RangeError)

Available from `domain`.

Class. Follow the linked specification for its full explanation.

#### [`double`](domain/numbers.md#symbol-double)

Available from `domain`.

**Inputs and dependencies**

- `amount`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

Possible failures: `RangeError`. The caller must catch or propagate them.

### Built-in operations used by this file

#### `Map<int, string>.get`

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

Inputs: `key`: `int`.

Result: `optional string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Set<Fruit>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) when `Application` is requested. Reuse one instance. Required dependencies: `Console`.
- Include the providers from [`Counters`](counters.md#symbol-Counters) before execution.

### Startup, in source order

- Set `app` to the instance provided for `Application`.
- Call [`Application.start`](domain/app.md#symbol-Application.start) on `app`.
- Set `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`.
- Select the matching case for the result of call `get` on `names` with `key` set to `2`:
  - A null value, including omitted optional input:
    - Call `print` with `value` set to `"missing fruit"`.
  - A present, non-null value, named `name`:
    - Call `print` with `value` set to `name`.
- Split a tuple containing `3`, `"plum"` into `code`, `label`, in that order.
- Call `print` with `value` set to the result of call `length` on a set containing the result of call [`Fruit`](domain/models.md#symbol-Fruit) with `code` set to `code`; `name` set to `label`, the result of call [`Fruit`](domain/models.md#symbol-Fruit) with `name` set to `label`; `code` set to `code`.
- Create a dependency and task scope. Join its child tasks and release scoped values before leaving:
  - Set `counter` to the instance provided for `Counter`.
  - Grant exclusive mutable access to `counter` for this block, then end the borrow:
    - Call [`Counter.increment`](counters.md#symbol-Counter.increment) on `counter`.
  - Call `print` with `value` set to the result of call [`Counter.value`](counters.md#symbol-Counter.value) on `counter`.
- Try these operations:
  - Call `print` with `value` set to the result of call [`double`](domain/numbers.md#symbol-double) with `amount` set to `7`.
  - Call [`double`](domain/numbers.md#symbol-double) with `amount` set to `-1`.
- If they fail with [`RangeError`](domain/numbers.md#symbol-RangeError), name the failure `error` and recover:
  - Call `print` with `value` set to `"negative amount rejected"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

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

### Providers

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) for `Application`. Share one instance. Needs `Console`.
- Include providers from [`Counters`](counters.md#symbol-Counters).

### Startup

- Set `app` to the instance provided for `Application`.
- Call [`Application.start`](domain/app.md#symbol-Application.start) on `app`.
- Set `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`.
- Match the result of `get` on `names` with `key` as `2`:
  - A null value, including omitted optional input:
    - Call `print` with `value` as `"missing fruit"`.
  - A present, non-null value, named `name`:
    - Call `print` with `value` as `name`.
- Split a tuple containing `3`, `"plum"` into `code`, `label` in order.
- Call `print` with `value` as the result of `length` on a set containing a new [`Fruit`](domain/models.md#symbol-Fruit) with `code`, `name` as `label`, a new [`Fruit`](domain/models.md#symbol-Fruit) with `name` as `label`, `code`.
- In a scope that joins child tasks and releases local values on exit:
  - Set `counter` to the instance provided for `Counter`.
  - Mutably borrow `counter` for this block:
    - Call [`Counter.increment`](counters.md#symbol-Counter.increment) on `counter`.
  - Call `print` with `value` as the result of [`Counter.value`](counters.md#symbol-Counter.value) on `counter`.
- Try:
  - Call `print` with `value` as the result of [`double`](domain/numbers.md#symbol-double) with `amount` as `7`.
  - Call [`double`](domain/numbers.md#symbol-double) with `amount` as `-1`.
- Catch [`RangeError`](domain/numbers.md#symbol-RangeError) as `error`:
  - Call `print` with `value` as `"negative amount rejected"`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Counter`](counters.md#symbol-Counter) from `counters`: [`increment`](counters.md#symbol-Counter.increment) (no caller inputs) → `void`; [`value`](counters.md#symbol-Counter.value) (no caller inputs) → `int`.
- [`Counters`](counters.md#symbol-Counters) from `counters`.
- [`Application`](domain/app.md#symbol-Application) from `domain`: [`start`](domain/app.md#symbol-Application.start) (no caller inputs) → `void`.
- [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) from `domain`.
- [`Fruit`](domain/models.md#symbol-Fruit) from `domain`: construct with `code`: `int`, `name`: `string`.
- [`RangeError`](domain/numbers.md#symbol-RangeError) from `domain`.
- [`double`](domain/numbers.md#symbol-double) (`amount`: `int`) → `int`; can fail with `RangeError` from `domain`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Map<int, string>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Set<Fruit>.length`: Read the number of elements.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::

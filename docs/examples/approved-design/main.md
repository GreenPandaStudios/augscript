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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) for `Application`. Share one instance. Needs `Console`. Include providers from [`Counters`](counters.md#symbol-Counters).

### Startup

It sets `app` to the instance provided for `Application`. It calls [`Application.start`](domain/app.md#symbol-Application.start) on `app`. It sets `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`.

Select the first matching case for the value from `get` on `names` (`key` set to `2`). If the selected value is null, it calls `print` (`value` set to `"missing fruit"`). If the selected value is not null, it names it `name` and calls `print` (`value` set to `name`).

After the match, execution continues unless the selected case returned or failed. It splits a tuple containing `3`, `"plum"` into `code` and `label` in order. It calls `print` (`value` set to the number of elements in a set containing a new [`Fruit`](domain/models.md#symbol-Fruit) (`code` and `name` set to `label`), a new [`Fruit`](domain/models.md#symbol-Fruit) (`name` set to `label` and `code`)).

Within a task and ownership scope, it follows these steps. It sets `counter` to the instance provided for `Counter`. While mutably borrowing `counter`, it calls [`Counter.increment`](counters.md#symbol-Counter.increment) on `counter`.

The mutable borrow ends when this block exits. It calls `print` (`value` set to the value from [`Counter.value`](counters.md#symbol-Counter.value) on `counter`).

This ends the block.

On leaving this scope, join its child tasks and release its local values.

It tries to call `print` (`value` set to the value from [`double`](domain/numbers.md#symbol-double) (`amount` set to `7`)), then call [`double`](domain/numbers.md#symbol-double) (`amount` set to `-1`). If this attempt raises [`RangeError`](domain/numbers.md#symbol-RangeError), it catches it as `error` and calls `print` (`value` set to `"negative amount rejected"`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Counter`](counters.md#symbol-Counter) from `counters`. [`increment`](counters.md#symbol-Counter.increment) takes no caller inputs. It returns no value. It may change `self`. [`value`](counters.md#symbol-Counter.value) takes no caller inputs. It returns `int`. The file uses [`Counters`](counters.md#symbol-Counters) from `counters`. The file uses [`Application`](domain/app.md#symbol-Application) from `domain`. [`start`](domain/app.md#symbol-Application.start) takes no caller inputs. It returns no value. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

The file uses [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl) from `domain`. The file uses [`Fruit`](domain/models.md#symbol-Fruit) from `domain`. Construction takes `code` as `int` and `name` as `string`. The file uses [`RangeError`](domain/numbers.md#symbol-RangeError) from `domain`. [`double`](domain/numbers.md#symbol-double) from `domain` takes `amount` as `int`. It returns `int`. It can fail with `RangeError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Map<int, string>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null. `Set<Fruit>.length`: Read the number of elements. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::

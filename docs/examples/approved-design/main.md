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
print(
    value={Fruit(code=code, name=label), Fruit(name=label, code=code)}.length()
)
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
print(
    value={Fruit(code=code, name=label), Fruit(name=label, code=code)}.length()
)
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

`Console` is provided by [`SystemConsole`](dependencies/august/0.20.1/io/contracts.md#symbol-SystemConsole). The same instance is shared.

`Application` is provided by [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl). The same instance is shared. It requires bindings for `Console`. Include providers from [`Counters`](counters.md#symbol-Counters).

### Startup

It sets `app` to the instance provided for `Application`. It calls [`app.start`](domain/app.md#symbol-Application.start). It sets `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`. If the value under `2` in `names` is null, it prints `"missing fruit"`.

If the value under `2` in `names` is not null, using `name` for it prints `name`. It splits a tuple containing `3`, `"plum"` into `code` and `label` in order. It prints the number of elements in a set containing a [`Fruit`](domain/models.md#symbol-Fruit) with `code` and `name` from `label`, a [`Fruit`](domain/models.md#symbol-Fruit) with `name` from `label` and `code`. Within a task and ownership scope, it sets `counter` to the instance provided for `Counter`.

With temporary permission to change `counter`, it calls [`counter.increment`](counters.md#symbol-Counter.increment). It prints [`counter.value`](counters.md#symbol-Counter.value). On leaving this scope, join its child tasks and release its local values. It prints [`double`](domain/numbers.md#symbol-double) with `amount` `7`.

It calls [`double`](domain/numbers.md#symbol-double) with `amount` `-1`. If this work raises [`RangeError`](domain/numbers.md#symbol-RangeError), it prints `"negative amount rejected"`.

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.20.1/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Counter`](counters.md#symbol-Counter) ([`increment`](counters.md#symbol-Counter.increment) and [`value`](counters.md#symbol-Counter.value)) and [`Counters`](counters.md#symbol-Counters) from `counters`. It uses [`Application`](domain/app.md#symbol-Application) ([`start`](domain/app.md#symbol-Application.start)), [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl), [`Fruit`](domain/models.md#symbol-Fruit), [`RangeError`](domain/numbers.md#symbol-RangeError), and [`double`](domain/numbers.md#symbol-double) from `domain`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

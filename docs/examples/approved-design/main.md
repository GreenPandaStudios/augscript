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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzljNmFkZDU2MWM5ZWUwYTc2N2ZjYWQ2MjNkNzQ4N2RiMDVmNThkNWRkZGNlZjdmMWU3MWEwYjBkNjdhMmEwMyIsImZvcm1hdHRlZFNoYTI1NiI6IjA2NDIwOWJhZjczOGRjMGMyNGQwMTM3YTc1ZDg4NTU4ZDlhODFjMjU3ZjlhN2VjNTQ1Y2ZkMDdjNDA3ZGY0YWUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTkyNDkwNmJiNzMwNyIsImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgxZDRhZmQxODhmNSJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoxNywibGFzdCI6MTksImJhY2tsaW5rcyI6WyJkaWFncmFtcy9mb2xkZXJzL2RvbWFpbi9pbmRleC5tZCNib3VuZGFyeS0yMTc1ZDk5YzJhYjQiLCJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04MWQ0YWZkMTg4ZjUiXX0seyJpZCI6InNvdXJjZS1MMjQiLCJmaXJzdCI6MjYsImxhc3QiOjI2LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvZm9sZGVycy9kb21haW4vaW5kZXgubWQjYm91bmRhcnktMTE1ZGI0YTg0ODVmIiwiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktODFkNGFmZDE4OGY1Il19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjI3LCJsYXN0IjoyNywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTExNWRiNGE4NDg1ZiIsImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgxZDRhZmQxODhmNSJdfSx7ImlkIjoic291cmNlLUw4LUwxNSIsImZpcnN0Ijo4LCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxNS1MMjIiLCJmaXJzdCI6MTUsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE4LUwyNyIsImZpcnN0IjoyMCwibGFzdCI6MjksImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMjUtTDI3IiwiZmlyc3QiOjI3LCJsYXN0IjoyOSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwyMSIsImZpcnN0IjoyMywibGFzdCI6MjMsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1iN2JmZTNhMDQ5YjQiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjQsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYjdiZmUzYTA0OWI0Il19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzljNmFkZDU2MWM5ZWUwYTc2N2ZjYWQ2MjNkNzQ4N2RiMDVmNThkNWRkZGNlZjdmMWU3MWEwYjBkNjdhMmEwMyIsImZvcm1hdHRlZFNoYTI1NiI6IjIyYzQ0Mjk1YTVmZWE1MDYzNmM1MWVmZDdhMmNhOWM2ZTU0MjFiZWEyZTk2NTQzM2QwMWMyNmEwNmVkODAzMDAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTkyNDkwNmJiNzMwNyIsImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgxZDRhZmQxODhmNSJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoyMCwibGFzdCI6MjIsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9mb2xkZXJzL2RvbWFpbi9pbmRleC5tZCNib3VuZGFyeS0yMTc1ZDk5YzJhYjQiLCJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04MWQ0YWZkMTg4ZjUiXX0seyJpZCI6InNvdXJjZS1MMjQiLCJmaXJzdCI6MzEsImxhc3QiOjMxLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvZm9sZGVycy9kb21haW4vaW5kZXgubWQjYm91bmRhcnktMTE1ZGI0YTg0ODVmIiwiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktODFkNGFmZDE4OGY1Il19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjMyLCJsYXN0IjozMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTExNWRiNGE4NDg1ZiIsImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgxZDRhZmQxODhmNSJdfSx7ImlkIjoic291cmNlLUw4LUwxNSIsImZpcnN0Ijo4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxNS1MMjIiLCJmaXJzdCI6MTYsImxhc3QiOjI5LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE4LUwyNyIsImZpcnN0IjoyMywibGFzdCI6MzYsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMjUtTDI3IiwiZmlyc3QiOjMyLCJsYXN0IjozNiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwyMSIsImZpcnN0IjoyNiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1iN2JmZTNhMDQ5YjQiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjgsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYjdiZmUzYTA0OWI0Il19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
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

[Interactions and sequences](main-diagrams.md)

### Providers {#providers}

`Console` is provided by [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared.

`Application` is provided by [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl). The same instance is shared. It requires bindings for `Console`. Include providers from [`Counters`](counters.md#symbol-Counters).

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `app` to the instance provided for `Application`. It calls [`app.start`](domain/app.md#symbol-Application.start). It sets `names` to a map with `1` mapped to `"apple"`; `2` mapped to `"pear"`. If the value under `2` in `names` is null, it prints `"missing fruit"`. [source](main.md#source-L8-L15)
:::

::: spec-paragraph specification-paragraph-2
If the value under `2` in `names` is not null, using `name` for it prints `name`. It reads a tuple containing `3`, `"plum"` once and binds `[0]` as `code` and `[1]` as `label`. It prints the number of elements in a set containing a [`Fruit`](domain/models.md#symbol-Fruit) with `code` and `name` from `label`, a [`Fruit`](domain/models.md#symbol-Fruit) with `name` from `label` and `code`. Within a task and ownership scope, it sets `counter` to the instance provided for `Counter`. [source](main.md#source-L15-L22)
:::

::: spec-paragraph specification-paragraph-3
With temporary permission to change `counter`, it calls [`counter.increment`](counters.md#symbol-Counter.increment). It prints [`counter.value`](counters.md#symbol-Counter.value). On leaving this scope, join its child tasks and release its local values. It prints [`double`](domain/numbers.md#symbol-double) with `amount` `7`. [source](main.md#source-L18-L27)
:::

::: spec-paragraph specification-paragraph-4
It calls [`double`](domain/numbers.md#symbol-double) with `amount` `-1`. If this work raises [`RangeError`](domain/numbers.md#symbol-RangeError), it prints `"negative amount rejected"`. [source](main.md#source-L25-L27)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Counter`](counters.md#symbol-Counter) ([`increment`](counters.md#symbol-Counter.increment) and [`value`](counters.md#symbol-Counter.value)) and [`Counters`](counters.md#symbol-Counters) from `counters`. It uses [`Application`](domain/app.md#symbol-Application) ([`start`](domain/app.md#symbol-Application.start)), [`ApplicationImpl`](domain/app.md#symbol-ApplicationImpl), [`Fruit`](domain/models.md#symbol-Fruit), [`RangeError`](domain/numbers.md#symbol-RangeError), and [`double`](domain/numbers.md#symbol-double) from `domain`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

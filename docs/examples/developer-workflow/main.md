---
title: "main.aug · A small tested application"
generated: true
source: "examples/developer-workflow/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A small tested application](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`calculator.aug`](calculator.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDczOWJlZTc2MTRkNmRiMTk5MjlhYzAzMmY4MzdkZDNiOTBmZjFlMjUxYzM3MDYxNzcyZjZjOGU0OTE5MDA2ZCIsImZvcm1hdHRlZFNoYTI1NiI6ImIwOTg3MzE5ZTM0NzFmNzU2YjVhNmM5ODViNTM2YzhjNGNjNWRmYzdkZGI2NDY5MjVlNzNhNjJjMDI4NmJiY2YiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDctTDI2IiwiZmlyc3QiOjcsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTItTDE1IiwiZmlyc3QiOjEyLCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2LUwyNSIsImZpcnN0IjoxOCwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger and ConsoleLogger from logging
import Arithmetic and Calculator and load from calculator
implement Logger with ConsoleLogger
try:
    List<int> numbers = [1, 2]
    Tuple<int,string> pair = (1, "apple")
    Set<int> unique = {1, 2, 1}
    Map<int,string> fruit = {1: "apples", 2: "pears"}
    calculator = Calculator()
    print(
        value=calculator.add(right=numbers.get(index=1), left=numbers.get(index=0))
    )
    print(value=pair.get(index=1))
    print(value=unique.length())
    print(value=fruit.get(key=2))
    try:
        print(value=load(fail=true))
    catch FileError error:
        print(value="load failed as expected")
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDczOWJlZTc2MTRkNmRiMTk5MjlhYzAzMmY4MzdkZDNiOTBmZjFlMjUxYzM3MDYxNzcyZjZjOGU0OTE5MDA2ZCIsImZvcm1hdHRlZFNoYTI1NiI6ImI1NDEzYTY5M2QwMWZkYjNlNTIyZTAyYjBiMGNjMDc2MmE1Njk2YTllMzkwNjVlM2QwNjUzNjJmZmU5MjE4NTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDctTDI2IiwiZmlyc3QiOjcsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTItTDE1IiwiZmlyc3QiOjEyLCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2LUwyNSIsImZpcnN0IjoxOCwibGFzdCI6MjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger and ConsoleLogger from logging
import Arithmetic and Calculator and load from calculator
implement Logger with ConsoleLogger
try {
    List<int> numbers = [1, 2]
    Tuple<int,string> pair = (1, "apple")
    Set<int> unique = {1, 2, 1}
    Map<int,string> fruit = {1: "apples", 2: "pears"}
    calculator = Calculator()
    print(
        value=calculator.add(right=numbers.get(index=1), left=numbers.get(index=0))
    )
    print(value=pair.get(index=1))
    print(value=unique.length())
    print(value=fruit.get(key=2))
    try {
        print(value=load(fail=true))
    }
    catch FileError error {
        print(value="load failed as expected")
    }
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

`Console` is provided by [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger). The same instance is shared.

### Startup

::: spec-paragraph specification-paragraph-1
It sets `numbers` of type `List<int>` to a list containing `1`, `2`. It sets `pair` of type `Tuple<int,string>` to a tuple containing `1`, `"apple"`. It sets `unique` of type `Set<int>` to a set containing `1`, `2`, `1`. It sets `fruit` of type `Map<int,string>` to a map with `1` mapped to `"apples"`; `2` mapped to `"pears"`. [source](main.md#source-L7-L26)
:::

::: spec-paragraph specification-paragraph-2
It sets `calculator` to a [`Calculator`](calculator.md#symbol-Calculator) using injected `Logger` for `_logger`. It prints [`calculator.add`](calculator.md#symbol-Calculator.add) with `right` from the item at index `1` in `numbers` and `left` from the item at index `0` in `numbers` using injected `Console` for `console`. It prints `pair.get` with `index` `1`. It prints the number of elements in `unique`. [source](main.md#source-L12-L15)
:::

::: spec-paragraph specification-paragraph-3
It prints the value under `2` in `fruit`. It prints [`load`](calculator.md#symbol-load) with `fail` `true`. If this work raises `FileError`, it prints `"load failed as expected"`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](main.md#source-L16-L25)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Calculator`](calculator.md#symbol-Calculator) ([`add`](calculator.md#symbol-Calculator.add)) and [`load`](calculator.md#symbol-load) from `calculator`. It uses [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

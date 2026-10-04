---
title: "counter.aug · Private state and helpers"
generated: true
source: "examples/visibility/counter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `counter.aug`

[Private state and helpers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiODM4NmZjZjU5MjIwMGRiMzgxMDk4NWVhYmYwZWFjMDE0ODI4NDY2MjNlYjQ3MGVhNTk5ZjNhYmIwOTlmMWE2MyIsImZvcm1hdHRlZFNoYTI1NiI6ImVlMDQzZGI5NjQwZjI1OTVmNjc3ZjhkZTEyNjIzNGNiMzA1ZjNlZDhkNGQyMTQ0Y2Y4OGJhYjBlYmE2ZWIxZjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUNvdW50ZXIiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0IjozLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JQ291bnRlci5sYWJlbCJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjQsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXIiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo1LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Db3VudGVyLl9sYWJlbCJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjcsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXIubGFiZWwiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjksImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1fcHJlZml4Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface ICounter:
    label() returns string
Counter(mutable int value) implements ICounter:
    _label():
        return _prefix()
    label():
        return self._label()
_prefix():
    return "count"
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiODM4NmZjZjU5MjIwMGRiMzgxMDk4NWVhYmYwZWFjMDE0ODI4NDY2MjNlYjQ3MGVhNTk5ZjNhYmIwOTlmMWE2MyIsImZvcm1hdHRlZFNoYTI1NiI6IjFjYmFiNTQ4ZmU2MmM5NjdlZDg4MGU3YzM4N2FlYTJhYWZiZGNiMDg4ZDQxYzg4MzcxOWU0MjUzMzA0ZGE1ZmYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUNvdW50ZXIiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0IjozLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JQ291bnRlci5sYWJlbCJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Db3VudGVyIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlci5fbGFiZWwiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlci5sYWJlbCJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMywibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9wcmVmaXgiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface ICounter {
    label() returns string
}
Counter(mutable int value) implements ICounter {
    _label() {
        return _prefix()
    }
    label() {
        return self._label()
    }
}
_prefix() {
    return "count"
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `ICounter` · interface · [source](counter.md#source-L2) {#symbol-ICounter}

#### `ICounter.label` · [source](counter.md#source-L3) {#symbol-ICounter.label}

It returns `string`.

### `Counter` · class · [source](counter.md#source-L5) {#symbol-Counter}

It implements [`ICounter`](counter.md#symbol-ICounter). It takes `value` as an integer, kept mutable.

#### `Counter._label` · [source](counter.md#source-L6) {#symbol-Counter._label}

::: spec-paragraph specification-paragraph-1
It is private to its defining scope. It returns [`_prefix`](counter.md#symbol-_prefix). [source](counter.md#source-L7)
:::

::: details Checked interface

```text
_label() returns string
```

:::

#### `Counter.label` · [source](counter.md#source-L9) {#symbol-Counter.label}

::: spec-paragraph specification-paragraph-2
It returns [`self._label`](counter.md#symbol-Counter._label). [source](counter.md#source-L10)
:::

::: details Checked interface

```text
label() returns string
```

:::

### `_prefix` · [source](counter.md#source-L13) {#symbol-_prefix}

::: spec-paragraph specification-paragraph-3
It is private to its defining scope. It returns `"count"`. [source](counter.md#source-L14)
:::

::: details Checked interface

```text
_prefix() returns string
```

:::

::::

:::::

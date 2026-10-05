---
title: "types.aug · Generic types and functions"
generated: true
source: "examples/generics/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `types.aug`

[Generic types and functions](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOGE5YzQ2OWVhOGRlNWY0MjJmNDMxNTg1NWI4ZTliZTE5MzIyOGQ5ZmI3NzhiNDFkNGIyYjUxNGE5NDBkOWYyYiIsImZvcm1hdHRlZFNoYTI1NiI6Ijc4MjA1ZTFmMDQzYzlkMWIzYWUxYmE4ZTgxYjQwNjU5NDU0NDQxYjBkNWIwOWI1YTk5M2Q2MmE1MWM4M2FmZDAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtRm9ybWF0dGVyIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtRm9ybWF0dGVyLmZvcm1hdCJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUZvcm1hdHRlci50aXRsZSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjYsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVRleHRGb3JtYXR0ZXIiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo3LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1UZXh0Rm9ybWF0dGVyLmZvcm1hdCJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6OSwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUJveCJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMCwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUJveC5nZXQiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MTEsImxhc3QiOjExLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MTIsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JQm94Il19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUJveC5nZXQiXX1dfQ
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter:
    format<T>(T value) returns string
    title():
        return "formatted"
TextFormatter() implements Formatter:
    format<T>(T value):
        return "generic method called"
Box<T>(T value) implements IBox<T>:
    get():
        return value
interface IBox<T>:
    get() returns T
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOGE5YzQ2OWVhOGRlNWY0MjJmNDMxNTg1NWI4ZTliZTE5MzIyOGQ5ZmI3NzhiNDFkNGIyYjUxNGE5NDBkOWYyYiIsImZvcm1hdHRlZFNoYTI1NiI6IjE1YTVhOWQ3NzllZTg5ODY2ZjI5ZjVhYmJiNzA3OTc4ZDlkZTY5Nzg4MGQ3MDQzN2E3ZDE2YjRmYmY3MDE1NzYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtRm9ybWF0dGVyIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtRm9ybWF0dGVyLmZvcm1hdCJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUZvcm1hdHRlci50aXRsZSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1UZXh0Rm9ybWF0dGVyIl19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVRleHRGb3JtYXR0ZXIuZm9ybWF0Il19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQm94Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQm94LmdldCJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxOCwibGFzdCI6MjAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUlCb3giXX0seyJpZCI6InNvdXJjZS1MMTkiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JQm94LmdldCJdfV19
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter {
    format<T>(T value) returns string
    title() {
        return "formatted"
    }
}
TextFormatter() implements Formatter {
    format<T>(T value) {
        return "generic method called"
    }
}
Box<T>(T value) implements IBox<T> {
    get() {
        return value
    }
}
interface IBox<T> {
    get() returns T
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Formatter` · interface · [source](types.md#source-L2) {#symbol-Formatter}

#### `Formatter.format` · [source](types.md#source-L3) {#symbol-Formatter.format}

The type parameters are `T`. It takes `value` as `T`. It returns `string`.

#### `Formatter.title` · [source](types.md#source-L4) {#symbol-Formatter.title}

::: spec-paragraph specification-paragraph-1
It returns `"formatted"`. [source](types.md#source-L5)
:::

::: details Checked interface

```text
title() returns string
```

:::

### `TextFormatter` · class · [source](types.md#source-L8) {#symbol-TextFormatter}

It implements [`Formatter`](types.md#symbol-Formatter). It inherits the default implementations of [`Formatter.title`](types.md#symbol-Formatter.title).

#### `TextFormatter.format` · [source](types.md#source-L9) {#symbol-TextFormatter.format}

::: spec-paragraph specification-paragraph-2
It takes `value` as `T`. It returns `"generic method called"`. [source](types.md#source-L10)
:::

::: details Checked interface

```text
format<T>(T value) returns string
```

The type parameters are `T`. It takes `value` as `T`.

:::

### `Box` · class · [source](types.md#source-L13) {#symbol-Box}

It implements [`IBox<T>`](types.md#symbol-IBox). The type parameters are `T`. It takes `value` as `T`, kept read-only.

#### `Box.get` · [source](types.md#source-L14) {#symbol-Box.get}

::: spec-paragraph specification-paragraph-3
It returns `value`. [source](types.md#source-L15)
:::

::: details Checked interface

```text
get() returns T
```

:::

### `IBox` · interface · [source](types.md#source-L18) {#symbol-IBox}

The type parameters are `T`.

#### `IBox.get` · [source](types.md#source-L19) {#symbol-IBox.get}

It returns `T`.

::::

:::::

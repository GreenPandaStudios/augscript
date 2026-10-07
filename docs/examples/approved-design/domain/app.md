---
title: "domain/app.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYWQzZjFmMWFlOWE2ZWNiNGE2MWIwODY5YjU5OGNmMjlkYjIyNTdhMmZmN2ZlNDRkYTA5MjgxMjJmZDExZGY3YiIsImZvcm1hdHRlZFNoYTI1NiI6ImI3ODU2YmVlNzQ5ZDJlMDY3MjY0NjZjYzdjYmU0ZThmOWE1YzlhNDlhZmZkOWU2MzE3N2I1NjUyMDMxZTUzZTIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTBiZWUxOWRkMzVjZSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA2MTk5NzI4MjlhOSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMSwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2RvbWFpbi9pbmRleC5tZCNib3VuZGFyeS0xMDE4MjI2ZWFhYzkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiYXBwLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUFwcGxpY2F0aW9uLnN0YXJ0Il19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6MTMsImJhY2tsaW5rcyI6WyJhcHAtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtQXBwbGljYXRpb25JbXBsIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImFwcC1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1BcHBsaWNhdGlvbkltcGwuc3RhcnQiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BcHBsaWNhdGlvbiJdfSx7ImlkIjoic291cmNlLUwxMS1MMTMiLCJmaXJzdCI6MTEsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Fruit from models
/** The application's explicit startup operation. */
interface Application:
    /** Writes the fruit names through the selected console. */
    start() uses Console.write
/** Construction stores dependencies; start performs the visible external work. */
ApplicationImpl(resolve Console console) implements Application:
    start():
        fruit to [Fruit(code=1, name="apple"), Fruit(name="pear", code=2)]
        for item in fruit:
            console.write(value=item.name)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYWQzZjFmMWFlOWE2ZWNiNGE2MWIwODY5YjU5OGNmMjlkYjIyNTdhMmZmN2ZlNDRkYTA5MjgxMjJmZDExZGY3YiIsImZvcm1hdHRlZFNoYTI1NiI6ImQ3N2EyYTYxZDMxNTYxNjc5YjFmZWVmNWY1NmZmZmY1MjNiOGNkMmQzOWI1ZmM2NWFlOTgxNjE4MWI3MDFkMzYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvZG9tYWluL2luZGV4Lm1kI2JvdW5kYXJ5LTBiZWUxOWRkMzVjZSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA2MTk5NzI4MjlhOSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2RvbWFpbi9pbmRleC5tZCNib3VuZGFyeS0xMDE4MjI2ZWFhYzkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiYXBwLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUFwcGxpY2F0aW9uLnN0YXJ0Il19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6MTAsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiYXBwLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUFwcGxpY2F0aW9uSW1wbCJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMSwibGFzdCI6MTYsImJhY2tsaW5rcyI6WyJhcHAtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQXBwbGljYXRpb25JbXBsLnN0YXJ0Il19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXBwbGljYXRpb24iXX0seyJpZCI6InNvdXJjZS1MMTEtTDEzIiwiZmlyc3QiOjEyLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Fruit from models
/** The application's explicit startup operation. */
interface Application {
    /** Writes the fruit names through the selected console. */
    start() uses Console.write
}
/** Construction stores dependencies; start performs the visible external work. */
ApplicationImpl(resolve Console console) implements Application {
    start() {
        fruit to [Fruit(code=1, name="apple"), Fruit(name="pear", code=2)]
        for item in fruit {
            console.write(value=item.name)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](app-diagrams.md)

### `Application` · interface · [source](app.md#source-L5) {#symbol-Application}

The application's explicit startup operation.

#### `Application.start` · [source](app.md#source-L7) {#symbol-Application.start}

Writes the fruit names through the selected console. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### `ApplicationImpl` · class · [source](app.md#source-L9) {#symbol-ApplicationImpl}

Construction stores dependencies; start performs the visible external work. It implements [`Application`](app.md#symbol-Application). The `console` dependency is injected as [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) and stored read-only.

#### `ApplicationImpl.start` · [source](app.md#source-L10) {#symbol-ApplicationImpl.start}

::: spec-paragraph specification-paragraph-1
Writes the fruit names through the selected console. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It sets `fruit` to a list containing a [`Fruit`](models.md#symbol-Fruit) with `code` `1` and `name` `"apple"`, a [`Fruit`](models.md#symbol-Fruit) with `name` `"pear"` and `code` `2`. For each `item` in a snapshot of `fruit`, it passes `item.name` to [`console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](app.md#source-L11-L13)
:::

::: details Checked interface

```text
start() returns void uses Console.write
```

It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### Dependencies

It uses [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Fruit`](models.md#symbol-Fruit) (`name`) from `models`.

::::

:::::

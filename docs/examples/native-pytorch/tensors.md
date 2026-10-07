---
title: "tensors.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/tensors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `tensors.aug`

[CPU tensors with PyTorch](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`tensors.aug`](tensors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYzJmYTVjNGI5ZTcyMjZlMjM1NGU1ZDlkODM4YmIxZTBkMjQ3YWVjMTQwYTA4MzZlZTk5NGViZGE0NDRmNzhlOCIsImZvcm1hdHRlZFNoYTI1NiI6ImNkNDg3ZmZiOWE2MjUzNmQ3ODQxZTJjYTVmN2U4MmEyYjNlZGVkZWYyNGNlMzkzNzIxOGEyN2Q5MTViYmQ5ZWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIwLCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjEyLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxMywibGFzdCI6MTMsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTUsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbInRlbnNvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDYtTDkiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjksImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLWNhbGN1bGF0ZSJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMSwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNC1MMTciLCJmaXJzdCI6MTIsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMTgtTDIxIiwiZmlyc3QiOjE2LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDIyLUwyMyIsImZpcnN0IjoyMCwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfV19
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702"
/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)
test calculate:
    when "cpu":
        it "adds_and_reads_real_tensors":
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYzJmYTVjNGI5ZTcyMjZlMjM1NGU1ZDlkODM4YmIxZTBkMjQ3YWVjMTQwYTA4MzZlZTk5NGViZGE0NDRmNzhlOCIsImZvcm1hdHRlZFNoYTI1NiI6IjkwOGI1MTZkNjg2MTgwMzM3YmZiZjUzZDUyM2JhMDBiOGU5YmIzNjg5YWIzZDk3ZTgyM2E4YzNhMDFmNTQ0NzkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxNSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIxLCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LWFiMWI4ZTJmMTQxNiJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1hYjFiOGUyZjE0MTYiXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTYsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYWIxYjhlMmYxNDE2Il19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbInRlbnNvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDYtTDkiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjEwLCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1jYWxjdWxhdGUiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTIsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTQtTDE3IiwiZmlyc3QiOjEzLCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDE4LUwyMSIsImZpcnN0IjoxNywibGFzdCI6MjAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwyMi1MMjMiLCJmaXJzdCI6MjEsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX1dfQ
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702"
/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError {
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)
}
test calculate {
    when "cpu" {
        it "adds_and_reads_real_tensors" {
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](tensors-diagrams.md)

### `calculate` · [source](tensors.md#source-L5) {#symbol-calculate}

Add two CPU tensors using LibTorch and return the sum of their elements. Failures can raise [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError).

::: spec-paragraph specification-paragraph-1
It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It returns [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-sum) with `tensor` from `result`. [source](tensors.md#source-L6-L9)
:::

::: details Checked interface

```text
calculate() returns float unless TensorError
```

Failures can raise [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError).

:::

### `test calculate` · [source](tensors.md#source-L11) {#symbol-test-20-calculate}

Tests [`calculate`](tensors.md#symbol-calculate). Each case gets fresh setup and dependencies.

#### `cpu`

::: spec-paragraph specification-paragraph-2
##### `adds_and_reads_real_tensors` · [source](tensors.md#source-L13)
:::

::: spec-paragraph specification-paragraph-3
It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor)). It sets `output` of type `List<float>` to [`values`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-values) with `tensor` from `result`. [source](tensors.md#source-L14-L17)
:::

::: spec-paragraph specification-paragraph-4
The test requires the number of elements in `output` equals `3`. The test requires the item at index `0` in `output` equals `5.0`. The test requires the item at index `1` in `output` equals `7.0`. The test requires the item at index `2` in `output` equals `9.0`. [source](tensors.md#source-L18-L21)
:::

::: spec-paragraph specification-paragraph-5
The test requires [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-sum) with `tensor` from `result` equals `21.0`. The test requires [`calculate`](tensors.md#symbol-calculate) equals `21.0`. [source](tensors.md#source-L22-L23)
:::

### Dependencies

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-add), [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-sum), [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor), [`values`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-values), [`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor), and [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) from `https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

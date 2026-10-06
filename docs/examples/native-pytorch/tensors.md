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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZTk5MTIwZTIyYmFhYTgyN2JhNjMxMzRhNTE5MTVlNmVjNTg0NmUxZDc4YTBmZTZkNTI1ZmZhMjVjYzlkNTMyZiIsImZvcm1hdHRlZFNoYTI1NiI6IjI5ZmExN2I1Mzc0NDM0NTc1MGI1NTAxYmQ1YWI0N2IzZmVmZDQ4ODNmZGNkYWZkNjFkYTk1Y2M0OWFkZmRmOWUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbInRlbnNvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDYtTDkiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjksImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLWNhbGN1bGF0ZSJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMSwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNC1MMTciLCJmaXJzdCI6MTIsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMTgtTDIxIiwiZmlyc3QiOjE2LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDIyLUwyMyIsImZpcnN0IjoyMCwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfV19
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZTk5MTIwZTIyYmFhYTgyN2JhNjMxMzRhNTE5MTVlNmVjNTg0NmUxZDc4YTBmZTZkNTI1ZmZhMjVjYzlkNTMyZiIsImZvcm1hdHRlZFNoYTI1NiI6IjNmMGJiZTdlMTM4YjBjYTkxZTFjZDUwODA2ZDdkN2M2OGFjNGJkZjRiODVmYTM3MWZhYmI0YmIwZjZmOWEyYjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbInRlbnNvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDYtTDkiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjEwLCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1jYWxjdWxhdGUiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTIsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTQtTDE3IiwiZmlyc3QiOjEzLCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDE4LUwyMSIsImZpcnN0IjoxNywibGFzdCI6MjAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwyMi1MMjMiLCJmaXJzdCI6MjEsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX1dfQ
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"
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

Add two CPU tensors using LibTorch and return the sum of their elements.

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

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-add), [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-sum), [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor), [`values`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-values), [`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/bindings.md#symbol-Tensor), and [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) from `https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

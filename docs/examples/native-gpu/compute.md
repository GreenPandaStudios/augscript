---
title: "compute.aug · GPU workers"
generated: true
source: "examples/native-gpu/compute.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `compute.aug`

[GPU workers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compute.aug`](compute.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYzljNmViNjRmMTg1MTVkNWI1NDg1MzQ3N2RmZmZhNzBjZTg1ZWZiNzgxNmI0M2MxNTkxZDdiNGFjMjA5OGU0MCIsImZvcm1hdHRlZFNoYTI1NiI6ImJkMzg1MzAzNmZhYjY2MTUzYmRjMmQyYTA2MGQ2M2RhYjA5NmRjZGM3ODA1MDBiOGE4ZTNhZWUxMGU0Mzc5OTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbImNvbXB1dGUtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDYtTDkiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMCwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtY2FsY3VsYXRlIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjEyLCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDE2LUwxOSIsImZpcnN0IjoxMywibGFzdCI6MTYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoxNywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfV19
// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float>:
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
test calculate:
    when "native":
        it "copies_the_GPU_result":
            List<float> result = calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
            assert(result.length() == 3)
            assert(result.get(index=0) == 5.0)
            assert(result.get(index=1) == 7.0)
            assert(result.get(index=2) == 9.0)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYzljNmViNjRmMTg1MTVkNWI1NDg1MzQ3N2RmZmZhNzBjZTg1ZWZiNzgxNmI0M2MxNTkxZDdiNGFjMjA5OGU0MCIsImZvcm1hdHRlZFNoYTI1NiI6ImZjNjc0ZDc4MWQzZGY2ZmZlZmRhMjljOGI5MjY1OTYzMzg1NDBhZWMyMWI2NWM2MmNhMTc0NzZhODEyNjE1ZjEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJjb21wdXRlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWNhbGN1bGF0ZSJdfSx7ImlkIjoic291cmNlLUw2LUw5IiwiZmlyc3QiOjUsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTEsImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLWNhbGN1bGF0ZSJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxMywibGFzdCI6MTksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwxNi1MMTkiLCJmaXJzdCI6MTQsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX0seyJpZCI6InNvdXJjZS1MMjAiLCJmaXJzdCI6MTgsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX1dfQ
// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float> {
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
}
test calculate {
    when "native" {
        it "copies_the_GPU_result" {
            List<float> result = calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
            assert(result.length() == 3)
            assert(result.get(index=0) == 5.0)
            assert(result.get(index=1) == 7.0)
            assert(result.get(index=2) == 9.0)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](compute-diagrams.md)

### `calculate` · [source](compute.md#source-L5) {#symbol-calculate}

Add two lists on a GPU and return copied values. GPU resources stay local. It takes `left` and `right` as `List<float>`.

::: spec-paragraph specification-paragraph-1
It calls [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-openDevice) and stores the result in owned `device` ([`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Device)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-upload) with `device` and `values` from `left` and stores the result in owned `first` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Buffer)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-upload) with `device` and `values` from `right` and stores the result in owned `second` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Buffer)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-add) with `left` from `first` and `right` from `second` and stores the result in owned `result` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Buffer)). [source](compute.md#source-L6-L9)
:::

::: spec-paragraph specification-paragraph-2
It returns [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-download) with `buffer` from `result`. [source](compute.md#source-L10)
:::

::: details Checked interface

```text
calculate(List<float> left, List<float> right) returns List<float> unless GpuError
```

It takes `left` and `right` as `List<float>`. Failures can raise [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError).

:::

### `test calculate` · [source](compute.md#source-L13) {#symbol-test-20-calculate}

Tests [`calculate`](compute.md#symbol-calculate). Each case gets fresh setup and dependencies.

#### `native`

::: spec-paragraph specification-paragraph-3
##### `copies_the_GPU_result` · [source](compute.md#source-L15)
:::

::: spec-paragraph specification-paragraph-4
It sets `result` of type `List<float>` to [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `1.0`, `2.0`, `3.0` and `right` from a list containing `4.0`, `5.0`, `6.0`. The test requires the number of elements in `result` equals `3`. The test requires the item at index `0` in `result` equals `5.0`. The test requires the item at index `1` in `result` equals `7.0`. [source](compute.md#source-L16-L19)
:::

::: spec-paragraph specification-paragraph-5
The test requires the item at index `2` in `result` equals `9.0`. [source](compute.md#source-L20)
:::

### Dependencies

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-add), [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-download), [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-openDevice), [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api.md#symbol-upload), [`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Buffer), and [`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/bindings.md#symbol-Device) from `https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462`. It uses [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError).

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

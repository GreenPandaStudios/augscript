---
title: "native.aug · A native C boundary"
generated: true
source: "examples/ffi/native.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `native.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYTVmMWRjYjlhZTZhM2Q2YTM3NjBmYzdiOTU1MTc4YjVlYmMyNmIzZmIxNzY5YzY0NWVkOGVhNTg3NDA1YTExNSIsImZvcm1hdHRlZFNoYTI1NiI6ImM0MzVlYWFhOTgzNWE1YjkwY2EyNTA1YzUyYjdiYzZjMDk5YmRjYmQ5ZDkwZGE2YzVmZWJkN2Y4YTRjZjU0MGEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm5hdGl2ZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1wdXRzIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIm5hdGl2ZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1hbm5vdW5jZSJdfSx7ImlkIjoic291cmNlLUw0LUw2IiwiZmlyc3QiOjQsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "native.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C puts(string message) returns c_int
announce():
    unsafe:
        puts(message="hello from C FFI")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYTVmMWRjYjlhZTZhM2Q2YTM3NjBmYzdiOTU1MTc4YjVlYmMyNmIzZmIxNzY5YzY0NWVkOGVhNTg3NDA1YTExNSIsImZvcm1hdHRlZFNoYTI1NiI6IjdkMzZhYmZkMGEwOWExNjA2M2E4YjViZGI5MDA0Y2Q0M2E3NzNlYjlhYjFkYzYzZmRiNTIxZWQwMTEyYmI2NDQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm5hdGl2ZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1wdXRzIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NywiYmFja2xpbmtzIjpbIm5hdGl2ZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1hbm5vdW5jZSJdfSx7ImlkIjoic291cmNlLUw0LUw2IiwiZmlyc3QiOjQsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "native.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C puts(string message) returns c_int
announce() {
    unsafe {
        puts(message="hello from C FFI")
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](native-diagrams.md)

### `puts` · [source](native.md#source-L2) {#symbol-puts}

It takes `message` as a string. It returns `c_int`. Native C implementation; only its declared contract is visible here.

### `announce` · [source](native.md#source-L3) {#symbol-announce}

::: spec-paragraph specification-paragraph-1
It can call `C.puts`. Within an unsafe block, it calls [`puts`](native.md#symbol-puts) with `message` `"hello from C FFI"`. Native operations must satisfy their declared C contracts. [source](native.md#source-L4-L6)
:::

::: details Checked interface

```text
announce() returns void uses C.puts
```

It can call `C.puts`.

:::

::::

:::::

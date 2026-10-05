---
title: "main.aug · Map and Set benchmark"
generated: true
source: "benchmarks/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Map and Set benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZTliZmMwYmVjMmNlZGZiODU3YzBlZWJkNDJjYWYwODQ2MDVmOWJkMjEyZmQ5OTc3NjRhNDk4NGQ0MmIyMmEzNSIsImZvcm1hdHRlZFNoYTI1NiI6IjMwOTI0NGYxYTkzNDQ3NmQ5YjBlZjZlMjZlZWM3MDY2ODEyMTkwZTBmNWQ4ZDQ4ZjYwYTQzYzJlMGVlNGI4ODMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDgiLCJmaXJzdCI6MiwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDktTDE0IiwiZmlyc3QiOjksImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000:
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
int checksum = 0
for (key, value) in values:
    if unique.contains(value=key):
        checksum = checksum + value
print(value=checksum)
print(value=values.length() == unique.length())
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZTliZmMwYmVjMmNlZGZiODU3YzBlZWJkNDJjYWYwODQ2MDVmOWJkMjEyZmQ5OTc3NjRhNDk4NGQ0MmIyMmEzNSIsImZvcm1hdHRlZFNoYTI1NiI6ImQwMjEwOWZkMjQ4YmM5OTlmMTIwNzBmMjQ4MDhjNGEwYmRjMzczMGZlZWVjMzU3YjVmMTdiNjY4YWMzN2I4NzUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDgiLCJmaXJzdCI6MiwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDktTDE0IiwiZmlyc3QiOjEwLCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000 {
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
}
int checksum = 0
for (key, value) in values {
    if unique.contains(value=key) {
        checksum = checksum + value
    }
}
print(value=checksum)
print(value=values.length() == unique.length())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

::: spec-paragraph specification-paragraph-1
It stores a context-typed empty collection with no items in owned `values` (`Map<int,int>`). It stores a context-typed empty collection with no items in owned `unique` (`Set<int>`). It sets `index` to `0`. While `index` is less than `20000`, it stores `index` times `3` in `values` under `index`; then it adds `index` to `unique`; then it increases `index` by `1`. [source](main.md#source-L2-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `key` and `value` in a snapshot of `values`, if whether `unique` contains `key` returns true, it increases `checksum` by `value`. After the loop, it prints `checksum`. It prints the number of elements in `values` equals the number of elements in `unique`. [source](main.md#source-L9-L14)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

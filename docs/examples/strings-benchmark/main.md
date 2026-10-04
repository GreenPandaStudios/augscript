---
title: "main.aug · String processing benchmark"
generated: true
source: "benchmarks/strings/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[String processing benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 20000
int index = 0
int checksum = 0
while index < iterations:
    parts = "August,clear,local,checked".split(separator=",")
    for part in parts:
        checksum = checksum + part.length()
    index = index + 1
print(value=checksum)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 20000
int index = 0
int checksum = 0
while index < iterations {
    parts = "August,clear,local,checked".split(separator=",")
    for part in parts {
        checksum = checksum + part.length()
    }
    index = index + 1
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `20000`. It sets `index` and `checksum` separately, each to `0`. While `index` is less than `iterations`, it sets `parts` to `split` on `"August,clear,local,checked"` with `separator` `","`. For each `part` in a snapshot of `parts`, it increases `checksum` by the byte length of `part`. [source](main.md#code)

After the loop, it increases `index` by `1`. After the loop, it prints `checksum`. [source](main.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

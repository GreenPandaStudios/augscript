---
title: "main.aug · A million greetings"
generated: true
source: "benchmarks/greetings/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A million greetings](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
greetings = 0
while greetings < 1000000:
    print(value="Hello, August! 👋")
    greetings = greetings + 1
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
greetings = 0
while greetings < 1000000 {
    print(value="Hello, August! 👋")
    greetings = greetings + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `greetings` to `0`. While `greetings` is less than `1000000`, it prints `"Hello, August! 👋"`; then it increases `greetings` by `1`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

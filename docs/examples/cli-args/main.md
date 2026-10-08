---
title: "main.aug · Command-line arguments"
generated: true
source: "examples/cli-args/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Command-line arguments](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZGY3MTYzMTA3OGM3MGI5NGUwMGUyMjljYTVmODg0MzhkMGFjODZjNzVjYWQ2MTg1Njg2ZDVkYTA5MjAwMTJkMyIsImZvcm1hdHRlZFNoYTI1NiI6ImY3NjFmODU3NjRkNjFhODZhNTUyYjJkYmFkN2NhNTUwMjdlZTZlNWY0NGExOWI5ZmZlNzJkMDdmN2E3NTY0N2UiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDE2IiwiZmlyc3QiOjIsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDktTDE1IiwiZmlyc3QiOjgsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try:
    args = arguments()
    print(value=args.length())
    if args.length() > 0:
        print(value=args.get(index=0))
    numbers = List<int>(1, 2)
    borrow numbers:
        numbers.append(value=3)
    print(value=numbers.get(index=2))
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZGY3MTYzMTA3OGM3MGI5NGUwMGUyMjljYTVmODg0MzhkMGFjODZjNzVjYWQ2MTg1Njg2ZDVkYTA5MjAwMTJkMyIsImZvcm1hdHRlZFNoYTI1NiI6ImYyMWM1MmM2MzY1OWQ0MDY2ZWQxZGVjZmE4YmQwOWJhMDgxZDkxZjFlNmI0NDEyYjVhZWE5YWY2MGI5OGM0NjciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDE2IiwiZmlyc3QiOjIsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDktTDE1IiwiZmlyc3QiOjksImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MTYsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try {
    args = arguments()
    print(value=args.length())
    if args.length() > 0 {
        print(value=args.get(index=0))
    }
    numbers = List<int>(1, 2)
    borrow numbers {
        numbers.append(value=3)
    }
    print(value=numbers.get(index=2))
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `args` to `arguments`. It prints the number of elements in `args`. If the number of elements in `args` is positive, it prints the item at index `0` in `args`. It sets `numbers` to a list of `int` containing `1`, `2`. [source](main.md#source-L2-L16)
:::

::: spec-paragraph specification-paragraph-2
With temporary permission to change `numbers`, it appends `3` to `numbers`. It prints the item at index `2` in `numbers`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](main.md#source-L9-L15)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

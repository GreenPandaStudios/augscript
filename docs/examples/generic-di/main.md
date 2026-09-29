---
title: "main.aug · Generic dependency injection"
generated: true
source: "examples/generic-di/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Generic dependency injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Repository from types
import NumberRepository from types
import Program from types
implement Repository<int> with NumberRepository
implement app with Program
resolve app to program
program.start()
```

```aug [Braces]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Repository from types
import NumberRepository from types
import Program from types
implement Repository<int> with NumberRepository
implement app with Program
resolve app to program
program.start()
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`NumberRepository`](types.md#symbol-NumberRepository) for `Repository<int>`. Share one instance.
- Provide [`Program`](types.md#symbol-Program) for `app`. Share one instance. Needs `Repository<int>`.

### Startup

- Set `program` to the instance provided for `app`.
- Call [`Program.start`](types.md#symbol-Program.start) on `program` using `Console` for `console`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`NumberRepository`](types.md#symbol-NumberRepository) from `types`.
- [`Program`](types.md#symbol-Program) from `types`: [`start`](types.md#symbol-Program.start) (no caller inputs) → `void`.

::::

:::::

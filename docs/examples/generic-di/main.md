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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`NumberRepository`](types.md#symbol-NumberRepository) for `Repository<int>`. Share one instance. Provide [`Program`](types.md#symbol-Program) for `app`. Share one instance. Needs `Repository<int>`.

### Startup

It sets `program` to the instance provided for `app`. It calls [`Program.start`](types.md#symbol-Program.start) on `program` using `Console` for `console`.

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`NumberRepository`](types.md#symbol-NumberRepository) from `types`. The file uses [`Program`](types.md#symbol-Program) from `types`. [`start`](types.md#symbol-Program.start) takes no caller inputs. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::

---
title: "main.aug · Generic dependency injection"
generated: true
source: "examples/generic-di/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Generic dependency injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 3 dependency providers before startup.
- Run 2 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`NumberRepository`](types.md#symbol-NumberRepository) when `Repository<int>` is requested. Reuse one instance.
- Provide [`Program`](types.md#symbol-Program) when `app` is requested. Reuse one instance. Required dependencies: `Repository<int>`.

### Startup, in source order

- Set `program` to the instance provided for `app`.
- Call [`Program.start`](types.md#symbol-Program.start) on `program`; inject `console` from `Console`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`NumberRepository`](types.md#symbol-NumberRepository)

Class from `types`.

Used as a type or provider.

#### [`Program`](types.md#symbol-Program)

Class from `types`.

- [`Program.start`](types.md#symbol-Program.start) (no caller inputs) → `void`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

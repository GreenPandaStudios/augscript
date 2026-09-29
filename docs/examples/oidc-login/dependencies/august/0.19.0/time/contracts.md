---
title: "august/0.19.0/time/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/time/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/time/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
/** An explicit clock dependency makes time-based behavior replaceable in tests. */
capability Clock:
    /** Read whole Unix seconds in UTC. */
    now() returns int uses Clock.now unless TimeError
extern C value _aug_time_now() returns int uses Clock.now unless TimeError
/** Operating-system wall clock. */
SystemClock() implements Clock:
    now() returns int unless TimeError:
        unsafe:
            return _aug_time_now()
```

```aug [Braces]
/** An explicit clock dependency makes time-based behavior replaceable in tests. */
capability Clock {
    /** Read whole Unix seconds in UTC. */
    now() returns int uses Clock.now unless TimeError
}
extern C value _aug_time_now() returns int uses Clock.now unless TimeError
/** Operating-system wall clock. */
SystemClock() implements Clock {
    now() returns int unless TimeError {
        unsafe {
            return _aug_time_now()
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Clock`](contracts.md#symbol-Clock) is a capability interface.
- [`_aug_time_now`](contracts.md#symbol-_aug_time_now) is a function returning `int`.
- [`SystemClock`](contracts.md#symbol-SystemClock) is a class implementing `Clock`.

### `Clock` {#symbol-Clock}

[source](contracts.md#code)

Capability interface.

**Author documentation**

An explicit clock dependency makes time-based behavior replaceable in tests.

#### `Clock.now` {#symbol-Clock.now}

[source](contracts.md#code)

Returns: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Can fail with `TimeError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Read whole Unix seconds in UTC.

### `SystemClock` {#symbol-SystemClock}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Clock`](contracts.md#symbol-Clock).

**Author documentation**

Operating-system wall clock.

#### `SystemClock.now` {#symbol-SystemClock.now}

[source](contracts.md#code)

Returns: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Can fail with `TimeError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_time_now`](contracts.md#symbol-_aug_time_now).

**Author documentation**

Read whole Unix seconds in UTC.

### `_aug_time_now` {#symbol-_aug_time_now}

[source](contracts.md#code)

Private to its defining scope.

Returns: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Can fail with `TimeError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

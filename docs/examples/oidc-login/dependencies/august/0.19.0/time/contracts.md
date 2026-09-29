---
title: "august/0.19.0/time/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/time/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/time/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Clock` {#symbol-Clock}

[source](contracts.md#code)

Capability interface.

**Author documentation**

An explicit clock dependency makes time-based behavior replaceable in tests.

#### `Clock.now` {#symbol-Clock.now}

[source](contracts.md#code)

Result: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

**Author documentation**

Read whole Unix seconds in UTC.

Interface contract. A selected implementation supplies the behavior.

### `SystemClock` {#symbol-SystemClock}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Clock`](contracts.md#symbol-Clock).

**Author documentation**

Operating-system wall clock.

#### `SystemClock.now` {#symbol-SystemClock.now}

[source](contracts.md#code)

Result: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

**Author documentation**

Read whole Unix seconds in UTC.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_time_now`](contracts.md#symbol-_aug_time_now) and finish this operation.

### `_aug_time_now` {#symbol-_aug_time_now}

[source](contracts.md#code)

Private to its defining scope.

Result: `int`.

Capabilities: [`Clock.now`](contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

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
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

<a id="symbol-Clock"></a>
### `Clock` · capability interface · [source](contracts.md#code)

An explicit clock dependency makes time-based behavior replaceable in tests.

<a id="symbol-Clock.now"></a>
#### `Clock.now` · [source](contracts.md#code)

Read whole Unix seconds in UTC. It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

<a id="symbol-SystemClock"></a>
### `SystemClock` · class · [source](contracts.md#code)

Operating-system wall clock. It implements [`Clock`](contracts.md#symbol-Clock).

<a id="symbol-SystemClock.now"></a>
#### `SystemClock.now` · [source](contracts.md#code)

Read whole Unix seconds in UTC. Failures can raise `TimeError`. Within an unsafe block, it returns [`_aug_time_now`](contracts.md#symbol-_aug_time_now). Native operations must satisfy their declared C contracts.

<a id="symbol-_aug_time_now"></a>
### `_aug_time_now` · [source](contracts.md#code)

It is private to its defining scope. It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

Native C implementation; only its declared contract is visible here.

::::

:::::

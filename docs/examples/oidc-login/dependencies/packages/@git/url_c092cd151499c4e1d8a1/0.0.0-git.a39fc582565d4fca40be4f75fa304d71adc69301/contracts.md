---
title: "packages/@git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug`

[OpenID Connect login application](../../../../../index.md) · Dependency source and specification

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

### `Clock` · capability interface · [source](contracts.md#code) {#symbol-Clock}

An explicit clock dependency makes time-based behavior replaceable in tests.

#### `Clock.now` · [source](contracts.md#code) {#symbol-Clock.now}

Read whole Unix seconds in UTC. It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

### `SystemClock` · class · [source](contracts.md#code) {#symbol-SystemClock}

Operating-system wall clock. It implements [`Clock`](contracts.md#symbol-Clock).

#### `SystemClock.now` · [source](contracts.md#code) {#symbol-SystemClock.now}

Read whole Unix seconds in UTC. Within an unsafe block, it returns [`_aug_time_now`](contracts.md#symbol-_aug_time_now). Native operations must satisfy their declared C contracts. [source](contracts.md#code)

::: details Checked interface

```text
now() returns int unless TimeError uses Clock.now
```

Failures can raise `TimeError`.

:::

### `_aug_time_now` · [source](contracts.md#code) {#symbol-_aug_time_now}

It is private to its defining scope. It returns `int`. It can call [`Clock.now`](contracts.md#symbol-Clock.now). Failures can raise `TimeError`.

Native C implementation; only its declared contract is visible here.

::::

:::::

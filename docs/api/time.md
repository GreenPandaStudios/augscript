---
generated: true
source: src/stdlib/time
editLink: false
---

# august.time

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/time --as time`, then import its public names from `time`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## Clock {#api-Clock}

```text
capability Clock
```

An explicit clock dependency makes time-based behavior replaceable in tests.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L3)

### Clock.now

```text
now() returns int unless TimeError
```

Read whole Unix seconds in UTC.

Uses `Clock.now`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L5)

## SystemClock {#api-SystemClock}

```text
SystemClock() implements Clock
```

Operating-system wall clock.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L8)

### SystemClock.now

```text
now() returns int unless TimeError
```

Read whole Unix seconds in UTC.

Uses `Clock.now`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L9)

---
generated: true
source: src/stdlib/time
editLink: false
---

# august.time

Public declarations exported by this module. Import names explicitly from `august.time`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [Clock](#api-Clock)
- [SystemClock](#api-SystemClock)

## Clock {#api-Clock}

```text
capability Clock
```

An explicit clock dependency makes time-based behavior replaceable in tests.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L2)

### Clock.now

```text
now() returns int uses Clock.now unless TimeError
```

Read whole Unix seconds in UTC.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L4)

## SystemClock {#api-SystemClock}

```text
SystemClock() implements Clock
```

Operating-system wall clock.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L7)

### SystemClock.now

```text
now() returns int uses Clock.now unless TimeError
```

Read whole Unix seconds in UTC.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/time/contracts.aug#L8)

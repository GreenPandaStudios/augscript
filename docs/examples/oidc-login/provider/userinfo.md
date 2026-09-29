---
title: "provider/userinfo.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/userinfo.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `provider/userinfo.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import UserInfo and AccessGrant from contracts
import securityHeaders from common
import Clock from august.time
import ExpiringStore from august.memory
/** The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. */
endpoint GET "/provider/userinfo" as userinfo(optional string authorization from header, resolve Clock clock, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> uses clock.now and access.get unless TimeError and HttpError:
    match authorization:
        when null:
            pass
        when some header:
            parts = header.split(separator=" ")
            if parts.length() == 2:
                try:
                    if parts.get(index=0) == "Bearer":
                        token = parts.get(index=1)
                        if token.isToken(min=43, max=43):
                            match access.get(key=token, now=clock.now()):
                                when null:
                                    pass
                                when some grant:
                                    return HttpResponse(body=Json(value=UserInfo(sub=grant.subject, name=grant.name)), headers=securityHeaders())
                catch IndexError error:
                    pass
    headers = securityHeaders().with(name="www-authenticate", value="Bearer error=\"invalid_token\"")
    return HttpResponse(body=Json(value={"error": "invalid_token"}), status=401, headers=headers)
```

```aug [Braces]
import UserInfo and AccessGrant from contracts
import securityHeaders from common
import Clock from august.time
import ExpiringStore from august.memory
/** The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. */
endpoint GET "/provider/userinfo" as userinfo(optional string authorization from header, resolve Clock clock, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> uses clock.now and access.get unless TimeError and HttpError {
    match authorization {
        when null {
            pass
        }
        when some header {
            parts = header.split(separator=" ")
            if parts.length() == 2 {
                try {
                    if parts.get(index=0) == "Bearer" {
                        token = parts.get(index=1)
                        if token.isToken(min=43, max=43) {
                            match access.get(key=token, now=clock.now()) {
                                when null {
                                    pass
                                }
                                when some grant {
                                    return HttpResponse(body=Json(value=UserInfo(sub=grant.subject, name=grant.name)), headers=securityHeaders())
                                }
                            }
                        }
                    }
                }
                catch IndexError error {
                    pass
                }
            }
        }
    }
    headers = securityHeaders().with(name="www-authenticate", value="Bearer error=\"invalid_token\"")
    return HttpResponse(body=Json(value={"error": "invalid_token"}), status=401, headers=headers)
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Available from `august.memory`.

Interface. Follow the linked specification for its full explanation.

**[`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Available from `august.time`.

Interface. Follow the linked specification for its full explanation.

**[`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)**

Result: `int`.

Capabilities: [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Available from `common`.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`AccessGrant`](contracts.md#symbol-AccessGrant)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `subject`: `string`. Read-only after initialization.

Field `name`: `string`. Read-only after initialization.

#### [`UserInfo`](contracts.md#symbol-UserInfo)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`UserInfo`](contracts.md#symbol-UserInfo).

### Built-in operations used by this file

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<string>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `string`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<string>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.isToken`

Require an ASCII RFC 3986 unreserved token with a bounded length.

Inputs: `min`: `int`; `max`: `int`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.split`

Split at an exact separator, preserving empty parts.

Inputs: `separator`: `string`.

Result: `List<string>`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `userinfo` {#symbol-userinfo}

[source](userinfo.md#code)

**Inputs and dependencies**

- `authorization`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `access`: [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Json>`.

Capabilities: [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`access.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `TimeError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/userinfo`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

**Author documentation**

The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response.

**Behavior when execution reaches this operation**

- Select the matching case for `authorization`:
  - A null value, including omitted optional input:
    - Continue without another operation.
  - A present, non-null value, named `header`:
    - Set `parts` to the result of call `split` on `header` with `separator` set to `" "`.
    - If (the result of call `length` on `parts` equals `2`) is true:
      - Try these operations:
        - If (the result of call `get` on `parts` with `index` set to `0` equals `"Bearer"`) is true:
          - Set `token` to the result of call `get` on `parts` with `index` set to `1`.
          - If the result of call `isToken` on `token` with `min` set to `43`; `max` set to `43` is true:
            - Select the matching case for the result of call [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `access` with `key` set to `token`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
              - A null value, including omitted optional input:
                - Continue without another operation.
              - A present, non-null value, named `grant`:
                - Return the result of call `HttpResponse` with `body` set to the result of call `Json` with `value` set to the result of call [`UserInfo`](contracts.md#symbol-UserInfo) with `sub` set to `subject` of `grant`; `name` set to `name` of `grant`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
      - If they fail with `IndexError`, name the failure `error` and recover:
        - Continue without another operation.
- Set `headers` to the result of call `with` on the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` set to `"www-authenticate"`; `value` set to `"Bearer error=\"invalid_token\""`.
- Return the result of call `HttpResponse` with `body` set to the result of call `Json` with `value` set to a map with `"error"` mapped to `"invalid_token"`; `status` set to `401`; `headers` set to `headers` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

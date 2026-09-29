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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`userinfo`](userinfo.md#symbol-userinfo) handles `GET` `/provider/userinfo` returning `HttpResponse<Json>`.

### `userinfo` {#symbol-userinfo}

[source](userinfo.md#code)

**Inputs**

- `authorization` (`optional string`) — read from the HTTP header; absent value becomes null.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `access` ([`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Json>`.

Capabilities: [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`access.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Can fail with `TimeError`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/provider/userinfo`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

**What it does**

- Select the matching case for `authorization`:
  - A null value, including omitted optional input:
    - Continue without another operation.
  - A present, non-null value, named `header`:
    - Set `parts` to call `split` on `header` with `separator` = `" "`.
    - If call `length` on `parts` equals `2`:
      - Try these operations:
        - If call `get` on `parts` with `index` = `0` equals `"Bearer"`:
          - Set `token` to call `get` on `parts` with `index` = `1`.
          - If call `isToken` on `token` with `min` = `43`; `max` = `43` is true:
            - Select the matching case for call [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `access` with `key` = `token`; `now` = call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
              - A null value, including omitted optional input:
                - Continue without another operation.
              - A present, non-null value, named `grant`:
                - Return call `HttpResponse` with `body` = call `Json` with `value` = call [`UserInfo`](contracts.md#symbol-UserInfo) with `sub` = `subject` of `grant`; `name` = `name` of `grant`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - If they fail with `IndexError`, name the failure `error` and recover:
        - Continue without another operation.
- Set `headers` to call `with` on call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` = `"www-authenticate"`; `value` = `"Bearer error=\"invalid_token\""`.
- Return call `HttpResponse` with `body` = call `Json` with `value` = a map with `"error"` mapped to `"invalid_token"`; `status` = `401`; `headers` = `headers`.

**Author documentation**

The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Capability interface from `august.memory`.

- [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Capability interface from `august.time`.

- [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Function from `common`.

- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError`.

#### [`AccessGrant`](contracts.md#symbol-AccessGrant)

Record from `contracts`.

- Read `name` (`string`).
- Read `subject` (`string`).

#### [`UserInfo`](contracts.md#symbol-UserInfo)

Record from `contracts`.

- Construct with `sub`: `string`, `name`: `string` → [`UserInfo`](contracts.md#symbol-UserInfo).

### Built-in operations used by this file

- `Headers.with` (`name`: `string`, `value`: `string`) → `Headers`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. Can fail with `HttpError`.
- `List<string>.get` (`index`: `int`) → `string`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<string>.length` (no inputs) → `int`: Read the number of elements.
- `string.isToken` (`min`: `int`, `max`: `int`) → `bool`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.split` (`separator`: `string`) → `List<string>`: Split at an exact separator, preserving empty parts.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

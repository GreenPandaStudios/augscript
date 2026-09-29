---
title: "provider/userinfo.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/userinfo.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-userinfo"></a>
### `userinfo` · [source](userinfo.md#code)

The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response.

**Inputs:** Take `authorization` (`optional string`) from HTTP header; omitted means null. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `access`.

Returns `HttpResponse<Json>`. Uses [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`access.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). Can fail with `TimeError`, `HttpError`.

HTTP route: `GET` `/provider/userinfo`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

- Match `authorization`:
  - A null value, including omitted optional input:
    - Continue.
  - A present, non-null value, named `header`:
    - Set `parts` to the result of `split` on `header` with `separator` as `" "`.
    - If the result of `length` on `parts` equals `2`:
      - Try:
        - If the result of `get` on `parts` with `index` as `0` equals `"Bearer"`:
          - Set `token` to the result of `get` on `parts` with `index` as `1`.
          - If the result of `isToken` on `token` with `min` as `43`, `max` as `43` is true:
            - Match the result of [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `access` with `key` as `token`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
              - A null value, including omitted optional input:
                - Continue.
              - A present, non-null value, named `grant`:
                - Return a new `HttpResponse` with `body` as a new `Json` with `value` as a new [`UserInfo`](contracts.md#symbol-UserInfo) with `sub` as `subject` of `grant`, `name` as `name` of `grant`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - Catch `IndexError` as `error`:
        - Continue.
- Set `headers` to the result of `with` on the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` as `"www-authenticate"`, `value` as `"Bearer error=\"invalid_token\""`.
- Return a new `HttpResponse` with `body` as a new `Json` with `value` as a map with `"error"` mapped to `"invalid_token"`, `status` as `401`, `headers`.

### Dependencies

- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`AccessGrant`](contracts.md#symbol-AccessGrant) from `contracts`: read `name` (`string`); read `subject` (`string`).
- [`UserInfo`](contracts.md#symbol-UserInfo) from `contracts`: construct with `sub`: `string`, `name`: `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.
- `List<string>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<string>.length`: Read the number of elements.
- `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.split`: Split at an exact separator, preserving empty parts.

::::

:::::

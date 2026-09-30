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
// aug-spec: "userinfo.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "userinfo.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. The caller supplies `authorization` as `optional string` from HTTP header (omitted means null). Dependency injection supplies `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) and `access` as [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<Json>`. It can use [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) and [`access.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `TimeError` and `HttpError`.

This handles `GET` requests at `/provider/userinfo`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. Select the first matching case for `authorization`. If the selected value is null, it continues without an operation.

If the selected value is not null, it names it `header` and follows these steps. It sets `parts` to the value from `split` on `header` (`separator` set to `" "`).

If the number of elements in `parts` equals `2`, it follows these steps.

It tries the following steps.

If the value from `get` on `parts` (`index` set to `0`) equals `"Bearer"`, it follows these steps. It sets `token` to the value from `get` on `parts` (`index` set to `1`).

If the value from `isToken` on `token` (`min` set to `43` and `max` set to `43`) is true, it follows these steps.

Select the first matching case for the value from [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `access` (`key` set to `token` and `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`). If the selected value is null, it continues without an operation. If the selected value is not null, it names it `grant` and returns a new `HttpResponse` (`body` set to a new `Json` (`value` set to a new [`UserInfo`](contracts.md#symbol-UserInfo) (`sub` set to `grant.subject` and `name` set to `grant.name`)) and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

This ends that branch.

This ends that branch. If this attempt raises `IndexError`, it catches it as `error` and continues without an operation.

This ends that branch.

This ends the case that names `header`.

After the match, execution continues unless the selected case returned or failed. It sets `headers` to the value from `with` on the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (`name` set to `"www-authenticate"` and `value` set to `"Bearer error=\"invalid_token\""`). It returns a new `HttpResponse` (`body` set to a new `Json` (`value` set to a map with `"error"` mapped to `"invalid_token"`), `status` set to `401`, and `headers`).

### Dependencies

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`.

The file uses [`AccessGrant`](contracts.md#symbol-AccessGrant) from `contracts`. `name` is a read-only field of type `string`. `subject` is a read-only field of type `string`. The file uses [`UserInfo`](contracts.md#symbol-UserInfo) from `contracts`. Construction takes `sub` and `name` as `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. `List<string>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<string>.length`: Read the number of elements. `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length. `string.split`: Split at an exact separator, preserving empty parts.

::::

:::::

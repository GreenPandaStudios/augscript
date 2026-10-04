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
import Clock from time
import ExpiringStore from memory
/** The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. */
endpoint GET "/provider/userinfo" as userinfo(optional string authorization from header, resolve Clock clock, resolve ExpiringStore<AccessGrant> access):
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
                                    return HttpResponse(
                                        body=Json(
                                            value=UserInfo(sub=grant.subject, name=grant.name)
                                        ),
                                        headers=securityHeaders()
                                    )
                catch IndexError error:
                    pass
    headers = securityHeaders().with(
        name="www-authenticate",
        value="Bearer error=\"invalid_token\""
    )
    return HttpResponse(
        body=Json(value={"error": "invalid_token"}),
        status=401,
        headers=headers
    )
```

```aug [Braces]
// aug-spec: "userinfo.aug.md" explains this file. Read it before changes; refresh with aug spec.
import UserInfo and AccessGrant from contracts
import securityHeaders from common
import Clock from time
import ExpiringStore from memory
/** The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. */
endpoint GET "/provider/userinfo" as userinfo(optional string authorization from header, resolve Clock clock, resolve ExpiringStore<AccessGrant> access) {
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
                                    return HttpResponse(
                                        body=Json(
                                            value=UserInfo(sub=grant.subject, name=grant.name)
                                        ),
                                        headers=securityHeaders()
                                    )
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
    headers = securityHeaders().with(
        name="www-authenticate",
        value="Bearer error=\"invalid_token\""
    )
    return HttpResponse(
        body=Json(value={"error": "invalid_token"}),
        status=401,
        headers=headers
    )
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `userinfo` · [source](userinfo.md#code) {#symbol-userinfo}

`userinfo` handles `GET /provider/userinfo`. The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response.

It takes `authorization` as `optional string` from the HTTP header. It gets `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)) and `access` ([`ExpiringStore<AccessGrant>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null.

If `authorization` is null, it continues without an operation. If `authorization` is not null, using `header` for it sets `parts` to `header.split` with `separator` `" "`. If the number of elements in `parts` equals `2`, if the item at index `0` in `parts` equals `"Bearer"`, it sets `token` to the item at index `1` in `parts`. If `token` is a URL-safe ASCII token with `43` to `43` characters, if [`access.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get) with `key` from `token` and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) is null, it continues without an operation. [source](userinfo.md#code)

If [`access.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get) with `key` from `token` and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) is not null, using `grant` for it returns HTTP 200 with a `Json` with `value` from an [`UserInfo`](contracts.md#symbol-UserInfo) with `sub` from `grant.subject` and `grant.name` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. If this work raises `IndexError`, it continues without an operation. It sets `headers` to [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"www-authenticate"` set to `"Bearer error=\"invalid_token\""`. It returns HTTP 401 with a `Json` with `value` from a map with `"error"` mapped to `"invalid_token"` and `headers` headers. [source](userinfo.md#code)

::: details Checked interface

```text
userinfo(optional string authorization, resolve Clock clock, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> unless HttpError and TimeError uses Clock.now, ExpiringStore<AccessGrant>.get
```

It takes `authorization` as `optional string` from the HTTP header. It gets `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)) and `access` ([`ExpiringStore<AccessGrant>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can also raise `HttpError` and `TimeError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get)) from `memory`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common`. It uses [`AccessGrant`](contracts.md#symbol-AccessGrant) (`name` and `subject`) and [`UserInfo`](contracts.md#symbol-UserInfo) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

---
title: "common/headers.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/headers.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `common/headers.aug`

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
- [`common/export.aug`](export.md)
- [`common/headers.aug`](headers.md)
- [`common/keys.aug`](keys.md)
- [`common/settings.aug`](settings.md)
- [`common/views.aug`](views.md)
- [`provider/authorization.aug`](../provider/authorization.md)
- [`provider/contracts.aug`](../provider/contracts.md)
- [`provider/credentials.aug`](../provider/credentials.md)
- [`provider/discovery.aug`](../provider/discovery.md)
- [`provider/export.aug`](../provider/export.md)
- [`provider/token.aug`](../provider/token.md)
- [`provider/userinfo.aug`](../provider/userinfo.md)
- [`provider/views.aug`](../provider/views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders() returns Headers unless HttpError:
    return Headers().with(name="cache-control", value="no-store").with(name="pragma", value="no-cache").with(name="x-content-type-options", value="nosniff").with(name="referrer-policy", value="no-referrer").with(name="content-security-policy", value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError:
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie"):
        result = result.with(name="set-cookie", value=content)
    return result
import cookie from august.web
```

```aug [Braces]
// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders() returns Headers unless HttpError {
    return Headers().with(name="cache-control", value="no-store").with(name="pragma", value="no-cache").with(name="x-content-type-options", value="nosniff").with(name="referrer-policy", value="no-referrer").with(name="content-security-policy", value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
}
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError {
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie") {
        result = result.with(name="set-cookie", value=content)
    }
    return result
}
import cookie from august.web
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-securityHeaders"></a>
### `securityHeaders` · [source](headers.md#code)

Responses containing identity data are never cached or embedded by another site. The result is `Headers`. It can fail with `HttpError`. It returns headers starting with a new `Headers` and adding these fields in order: `"cache-control"` to `"no-store"`, `"pragma"` to `"no-cache"`, `"x-content-type-options"` to `"nosniff"`, `"referrer-policy"` to `"no-referrer"`, and `"content-security-policy"` to `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"`.

<a id="symbol-withCookie"></a>
### `withCookie` · [source](headers.md#code)

Add a checked cookie without losing duplicate Set-Cookie response fields. The caller supplies `headers` as `Headers`, `name`, `value`, and `path` as `string`, `maxAge` as `int`, and `secure` as `bool`. The result is `Headers`. It can fail with `HttpError`.

It sets `result` to `headers`. For each `content` in a snapshot of the value from `all` on the value from [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) (`name`, `value`, `path`, `maxAge`, and `secure`) (`name` set to `"set-cookie"`), it sets `result` to the value from `with` on `result` (`name` set to `"set-cookie"` and `value` set to `content`). It returns `result`.

### Dependencies

[`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) from `august.web` takes `name`, `value`, and `path` as `string`, `maxAge` as `int`, and `secure` as `bool`. It returns `Headers`. It can fail with `HttpError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Headers.all`: Read every value of this header in wire order. `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

::::

:::::

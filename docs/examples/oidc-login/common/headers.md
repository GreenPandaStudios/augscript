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
securityHeaders():
    return Headers().with(name="cache-control", value="no-store").with(name="pragma", value="no-cache").with(name="x-content-type-options", value="nosniff").with(name="referrer-policy", value="no-referrer").with(name="content-security-policy", value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure):
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie"):
        result = result.with(name="set-cookie", value=content)
    return result
import cookie from august.web
```

```aug [Braces]
// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders() {
    return Headers().with(name="cache-control", value="no-store").with(name="pragma", value="no-cache").with(name="x-content-type-options", value="nosniff").with(name="referrer-policy", value="no-referrer").with(name="content-security-policy", value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
}
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) {
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

### `securityHeaders` · [source](headers.md#code) {#symbol-securityHeaders}

Responses containing identity data are never cached or embedded by another site. Failures can raise `HttpError`. It returns headers starting with a `Headers` and adding these fields in order: `"cache-control"` to `"no-store"`, `"pragma"` to `"no-cache"`, `"x-content-type-options"` to `"nosniff"`, `"referrer-policy"` to `"no-referrer"`, and `"content-security-policy"` to `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"`.

### `withCookie` · [source](headers.md#code) {#symbol-withCookie}

Add a checked cookie without losing duplicate Set-Cookie response fields. It takes `headers` as `Headers`, `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean. Failures can raise `HttpError`.

It sets `result` to `headers`. For each `content` in a snapshot of `all` on [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) with `name`, `value`, `path`, `maxAge`, and `secure` with `name` `"set-cookie"`, it sets `result` to `result` with the header `"set-cookie"` set to `content`. After the loop, it returns `result`.

### Dependencies

It uses [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) from `august.web`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

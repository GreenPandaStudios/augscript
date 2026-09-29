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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`securityHeaders`](headers.md#symbol-securityHeaders) is a function returning `Headers`.
- [`withCookie`](headers.md#symbol-withCookie) is a function returning `Headers`.

### `securityHeaders` {#symbol-securityHeaders}

[source](headers.md#code)

Returns: `Headers`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Return call `with` on call `with` on call `with` on call `with` on call `with` on call `Headers` with `name` = `"cache-control"`; `value` = `"no-store"` with `name` = `"pragma"`; `value` = `"no-cache"` with `name` = `"x-content-type-options"`; `value` = `"nosniff"` with `name` = `"referrer-policy"`; `value` = `"no-referrer"` with `name` = `"content-security-policy"`; `value` = `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"`.

**Author documentation**

Responses containing identity data are never cached or embedded by another site.

### `withCookie` {#symbol-withCookie}

[source](headers.md#code)

**Inputs**

- `headers` (`Headers`) — required labeled input.
- `name` (`string`) — required labeled input.
- `value` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `maxAge` (`int`) — required labeled input.
- `secure` (`bool`) — required labeled input.

Returns: `Headers`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Set `result` to `headers`.
- For each `content` in a snapshot of call `all` on call [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) with `name` = `name`; `value` = `value`; `path` = `path`; `maxAge` = `maxAge`; `secure` = `secure` with `name` = `"set-cookie"`, in iteration order:
  - Set `result` to call `with` on `result` with `name` = `"set-cookie"`; `value` = `content`.
- Return `result`.

**Author documentation**

Add a checked cookie without losing duplicate Set-Cookie response fields.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie)

Function from `august.web`.

- [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) (`name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError`.

### Built-in operations used by this file

- `Headers.all` (`name`: `string`) → `List<string>`: Read every value of this header in wire order.
- `Headers.with` (`name`: `string`, `value`: `string`) → `Headers`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. Can fail with `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

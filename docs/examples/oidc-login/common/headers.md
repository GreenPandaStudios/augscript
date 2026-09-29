---
title: "common/headers.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/headers.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie)

Available from `august.web`.

**Inputs and dependencies**

- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

### Built-in operations used by this file

#### `Headers.all`

Read every value of this header in wire order.

Inputs: `name`: `string`.

Result: `List<string>`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `securityHeaders` {#symbol-securityHeaders}

[source](headers.md#code)

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Responses containing identity data are never cached or embedded by another site.

**Behavior when execution reaches this operation**

- Return the result of call `with` on the result of call `with` on the result of call `with` on the result of call `with` on the result of call `with` on the result of call `Headers` with `name` set to `"cache-control"`; `value` set to `"no-store"` with `name` set to `"pragma"`; `value` set to `"no-cache"` with `name` set to `"x-content-type-options"`; `value` set to `"nosniff"` with `name` set to `"referrer-policy"`; `value` set to `"no-referrer"` with `name` set to `"content-security-policy"`; `value` set to `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"` and finish this operation.

### `withCookie` {#symbol-withCookie}

[source](headers.md#code)

**Inputs and dependencies**

- `headers`: `Headers`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Add a checked cookie without losing duplicate Set-Cookie response fields.

**Behavior when execution reaches this operation**

- Set `result` to `headers`.
- For each `content` in a snapshot of the result of call `all` on the result of call [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) with `name` set to `name`; `value` set to `value`; `path` set to `path`; `maxAge` set to `maxAge`; `secure` set to `secure` with `name` set to `"set-cookie"`, in iteration order:
  - Set `result` to the result of call `with` on `result` with `name` set to `"set-cookie"`; `value` set to `content`.
- Return `result` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

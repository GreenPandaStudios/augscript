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

<a id="symbol-securityHeaders"></a>
### `securityHeaders` · [source](headers.md#code)

Responses containing identity data are never cached or embedded by another site.

Returns `Headers`. Can fail with `HttpError`.

- Return headers starting with a new `Headers` and adding these fields in order:
  1. `"cache-control"` to `"no-store"`
  2. `"pragma"` to `"no-cache"`
  3. `"x-content-type-options"` to `"nosniff"`
  4. `"referrer-policy"` to `"no-referrer"`
  5. `"content-security-policy"` to `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"`

<a id="symbol-withCookie"></a>
### `withCookie` · [source](headers.md#code)

Add a checked cookie without losing duplicate Set-Cookie response fields.

**Inputs:** Take `headers` (`Headers`). Take `name` (`string`). Take `value` (`string`). Take `path` (`string`). Take `maxAge` (`int`). Take `secure` (`bool`).

Returns `Headers`. Can fail with `HttpError`.

- Set `result` to `headers`.
- For each `content` in a snapshot of the result of `all` on the result of [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) with `name`, `value`, `path`, `maxAge`, `secure` with `name` as `"set-cookie"`:
  - Set `result` to the result of `with` on `result` with `name` as `"set-cookie"`, `value` as `content`.
- Return `result`.

### Dependencies

- [`cookie`](../dependencies/august/0.19.0/web/contracts.md#symbol-cookie) (`name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError` from `august.web`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Headers.all`: Read every value of this header in wire order.
- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

::::

:::::

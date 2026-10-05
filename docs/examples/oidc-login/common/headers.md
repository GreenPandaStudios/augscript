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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYmUxZDRjNjdjMzI4NTcxMWJiOTkxNjY1NzNiZGY4NWY4NzQ5MWMwNWQwMjc1YzMxZmIwZmI5MzQ3YTE1MTM4NSIsImZvcm1hdHRlZFNoYTI1NiI6IjNjZWM2NTlhOGM3YTVhYmM5ZGQ3YWY5YjgzMTA5ZjYzNjE2NmI0MmE2OTkxZThjYjY3OWIyNWNmOTNhZmY1MWQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MTYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXNlY3VyaXR5SGVhZGVycyJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0IjoxOCwibGFzdCI6MjIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXdpdGhDb29raWUiXX0seyJpZCI6InNvdXJjZS1MOC1MMTEiLCJmaXJzdCI6MTksImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders():
    return Headers().with(name="cache-control", value="no-store").with(
        name="pragma",
        value="no-cache"
    ).with(
        name="x-content-type-options",
        value="nosniff"
    ).with(
        name="referrer-policy",
        value="no-referrer"
    ).with(
        name="content-security-policy",
        value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    )
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure):
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie"):
        result = result.with(name="set-cookie", value=content)
    return result
import cookie from web
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYmUxZDRjNjdjMzI4NTcxMWJiOTkxNjY1NzNiZGY4NWY4NzQ5MWMwNWQwMjc1YzMxZmIwZmI5MzQ3YTE1MTM4NSIsImZvcm1hdHRlZFNoYTI1NiI6ImJmNjFiYmZiODYzMjUzZjZiMDJlYmY4OTYxYjAwM2RmZDhkZDA1NDAwYzUxMGJlYjE4NTI0ZjZlZGVkOWM3NjEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXNlY3VyaXR5SGVhZGVycyJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0IjoxOSwibGFzdCI6MjUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXdpdGhDb29raWUiXX0seyJpZCI6InNvdXJjZS1MOC1MMTEiLCJmaXJzdCI6MjAsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders() {
    return Headers().with(name="cache-control", value="no-store").with(
        name="pragma",
        value="no-cache"
    ).with(
        name="x-content-type-options",
        value="nosniff"
    ).with(
        name="referrer-policy",
        value="no-referrer"
    ).with(
        name="content-security-policy",
        value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    )
}
/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) {
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie") {
        result = result.with(name="set-cookie", value=content)
    }
    return result
}
import cookie from web
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `securityHeaders` · [source](headers.md#source-L3) {#symbol-securityHeaders}

::: spec-paragraph specification-paragraph-1
Responses containing identity data are never cached or embedded by another site. It returns headers starting with a `Headers` and adding these fields in order: `"cache-control"` to `"no-store"`, `"pragma"` to `"no-cache"`, `"x-content-type-options"` to `"nosniff"`, `"referrer-policy"` to `"no-referrer"`, and `"content-security-policy"` to `"default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"`. [source](headers.md#source-L4)
:::

::: details Checked interface

```text
securityHeaders() returns Headers unless HttpError
```

Failures can raise `HttpError`.

:::

### `withCookie` · [source](headers.md#source-L7) {#symbol-withCookie}

Add a checked cookie without losing duplicate Set-Cookie response fields. It takes labeled inputs `headers`, `name`, `value`, `path`, `maxAge`, and `secure`.

::: spec-paragraph specification-paragraph-2
It sets `result` to `headers`. For each `content` in a snapshot of `all` on [`cookie`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-cookie) with `name`, `value`, `path`, `maxAge`, and `secure` with `name` `"set-cookie"`, it sets `result` to `result` with the header `"set-cookie"` set to `content`. After the loop, it returns `result`. [source](headers.md#source-L8-L11)
:::

::: details Checked interface

```text
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError
```

It takes `headers` as `Headers`, `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean. Failures can raise `HttpError`.

:::

### Dependencies

It uses [`cookie`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-cookie) from `web`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

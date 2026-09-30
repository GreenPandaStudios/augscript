---
title: "common/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `common/views.aug`

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
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Small server components keep each page's behavior and dependencies visible. */
Page(string title, List<Html> children) returns Html:
    return <html lang={"en"}><head><meta charset={"utf-8"} /><meta name={"viewport"} content={"width=device-width, initial-scale=1"} /><title>{title} — August</title></head><body style={"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"}><main style={"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"}><nav><a href={"/"} style={"color:#4852d7;font-weight:750;text-decoration:none"}>August · OpenID Connect</a></nav><h1>{title}</h1>{children}</main></body></html>
```

```aug [Braces]
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Small server components keep each page's behavior and dependencies visible. */
Page(string title, List<Html> children) returns Html {
    return <html lang={"en"}><head><meta charset={"utf-8"} /><meta name={"viewport"} content={"width=device-width, initial-scale=1"} /><title>{title} — August</title></head><body style={"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"}><main style={"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"}><nav><a href={"/"} style={"color:#4852d7;font-weight:750;text-decoration:none"}>August · OpenID Connect</a></nav><h1>{title}</h1>{children}</main></body></html>
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Page"></a>
### `Page` · [source](views.md#code)

Small server components keep each page's behavior and dependencies visible. The caller supplies `title` as `string` and `children` as `List<Html>`. The result is `Html`.

It returns the HTML element `html` with `lang` = `"en"` containing the HTML element `head` containing the HTML element `meta` with `charset` = `"utf-8"` (server-rendered; text escaped), the HTML element `meta` with `name` = `"viewport"`, `content` = `"width=device-width, initial-scale=1"` (server-rendered; text escaped), the HTML element `title` containing `title`, ` — August` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `body` with `style` = `"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"` containing the HTML element `main` with `style` = `"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"` containing the HTML element `nav` containing the HTML element `a` with `href` = `"/"`, `style` = `"color:#4852d7;font-weight:750;text-decoration:none"` containing `August · OpenID Connect` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `h1` containing `title` (server-rendered; text escaped), `children` (server-rendered; text escaped) (server-rendered; text escaped) (server-rendered; text escaped).

::::

:::::

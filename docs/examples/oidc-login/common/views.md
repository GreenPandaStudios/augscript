---
title: "common/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Code {#code}

::: code-group

```aug [Indentation]
/** Small server components keep each page's behavior and dependencies visible. */
Page(string title, List<Html> children) returns Html:
    return <html lang={"en"}><head><meta charset={"utf-8"} /><meta name={"viewport"} content={"width=device-width, initial-scale=1"} /><title>{title} — August</title></head><body style={"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"}><main style={"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"}><nav><a href={"/"} style={"color:#4852d7;font-weight:750;text-decoration:none"}>August · OpenID Connect</a></nav><h1>{title}</h1>{children}</main></body></html>
```

```aug [Braces]
/** Small server components keep each page's behavior and dependencies visible. */
Page(string title, List<Html> children) returns Html {
    return <html lang={"en"}><head><meta charset={"utf-8"} /><meta name={"viewport"} content={"width=device-width, initial-scale=1"} /><title>{title} — August</title></head><body style={"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"}><main style={"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"}><nav><a href={"/"} style={"color:#4852d7;font-weight:750;text-decoration:none"}>August · OpenID Connect</a></nav><h1>{title}</h1>{children}</main></body></html>
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Page` {#symbol-Page}

[source](views.md#code)

**Inputs and dependencies**

- `title`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `children`: `List<Html>`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

**Author documentation**

Small server components keep each page's behavior and dependencies visible.

**Behavior when execution reaches this operation**

- Return the HTML element `html` with `lang` set to `"en"`; children: the HTML element `head`; children: the HTML element `meta` with `charset` set to `"utf-8"`. Escape embedded text; render components on the server; the HTML element `meta` with `name` set to `"viewport"`, `content` set to `"width=device-width, initial-scale=1"`. Escape embedded text; render components on the server; the HTML element `title`; children: `title`; ` — August`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `body` with `style` set to `"margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6"`; children: the HTML element `main` with `style` set to `"max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12"`; children: the HTML element `nav`; children: the HTML element `a` with `href` set to `"/"`, `style` set to `"color:#4852d7;font-weight:750;text-decoration:none"`; children: `August · OpenID Connect`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `h1`; children: `title`. Escape embedded text; render components on the server; `children`. Escape embedded text; render components on the server. Escape embedded text; render components on the server. Escape embedded text; render components on the server and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

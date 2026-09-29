---
title: "provider/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `provider/views.aug`

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

## Code {#code}

::: code-group

```aug [Indentation]
import Page from common
/** A server form with a checked HTTP action. The browser submits to the provider endpoint. */
ProviderLogin(string requestId, string csrf, string message, HttpAction submit) returns Html:
    return <Page title={"Sign in with the August provider"}><p>{message}</p><p style={"background:#f3f5f9;padding:12px;border-radius:8px"}>Demo account: <strong>ada</strong> · password <strong>august-demo</strong></p><form method={"post"} action={"/provider/login"} onSubmit={submit}><input type={"hidden"} name={"request_id"} value={requestId} /><input type={"hidden"} name={"csrf"} value={csrf} /><p><label for={"username"}>Username</label><br /><input id={"username"} name={"username"} autocomplete={"username"} value={"ada"} maxlength={"64"} required={true} style={"padding:10px;width:90%"} /></p><p><label for={"password"}>Password</label><br /><input id={"password"} type={"password"} name={"password"} autocomplete={"current-password"} maxlength={"256"} required={true} style={"padding:10px;width:90%"} /></p><button type={"submit"} style={"padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit"}>Sign in and return to the app</button></form><p style={"font-size:14px;color:#677189"}>The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.</p></Page>
ProviderFailure(string message) returns Html:
    return <Page title={"Sign-in could not continue"}><p>{message}</p><a href={"/login/start"}>Start a new sign-in</a></Page>
```

```aug [Braces]
import Page from common
/** A server form with a checked HTTP action. The browser submits to the provider endpoint. */
ProviderLogin(string requestId, string csrf, string message, HttpAction submit) returns Html {
    return <Page title={"Sign in with the August provider"}><p>{message}</p><p style={"background:#f3f5f9;padding:12px;border-radius:8px"}>Demo account: <strong>ada</strong> · password <strong>august-demo</strong></p><form method={"post"} action={"/provider/login"} onSubmit={submit}><input type={"hidden"} name={"request_id"} value={requestId} /><input type={"hidden"} name={"csrf"} value={csrf} /><p><label for={"username"}>Username</label><br /><input id={"username"} name={"username"} autocomplete={"username"} value={"ada"} maxlength={"64"} required={true} style={"padding:10px;width:90%"} /></p><p><label for={"password"}>Password</label><br /><input id={"password"} type={"password"} name={"password"} autocomplete={"current-password"} maxlength={"256"} required={true} style={"padding:10px;width:90%"} /></p><button type={"submit"} style={"padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit"}>Sign in and return to the app</button></form><p style={"font-size:14px;color:#677189"}>The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.</p></Page>
}
ProviderFailure(string message) returns Html {
    return <Page title={"Sign-in could not continue"}><p>{message}</p><a href={"/login/start"}>Start a new sign-in</a></Page>
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Page`](../common/views.md#symbol-Page)

Available from `common`.

**Inputs and dependencies**

- `title`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `children`: `List<Html>`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

### `ProviderLogin` {#symbol-ProviderLogin}

[source](views.md#code)

**Inputs and dependencies**

- `requestId`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `submit`: `HttpAction`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

**Author documentation**

A server form with a checked HTTP action. The browser submits to the provider endpoint.

**Behavior when execution reaches this operation**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` set to `"Sign in with the August provider"`; children: the HTML element `p`; children: `message`. Escape embedded text; render components on the server; the HTML element `p` with `style` set to `"background:#f3f5f9;padding:12px;border-radius:8px"`; children: `Demo account: `; the HTML element `strong`; children: `ada`. Escape embedded text; render components on the server; ` · password `; the HTML element `strong`; children: `august-demo`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `form` with `method` set to `"post"`, `action` set to `"/provider/login"`, `onSubmit` set to `submit`; children: the HTML element `input` with `type` set to `"hidden"`, `name` set to `"request_id"`, `value` set to `requestId`. Escape embedded text; render components on the server; the HTML element `input` with `type` set to `"hidden"`, `name` set to `"csrf"`, `value` set to `csrf`. Escape embedded text; render components on the server; the HTML element `p`; children: the HTML element `label` with `for` set to `"username"`; children: `Username`. Escape embedded text; render components on the server; the HTML element `br`. Escape embedded text; render components on the server; the HTML element `input` with `id` set to `"username"`, `name` set to `"username"`, `autocomplete` set to `"username"`, `value` set to `"ada"`, `maxlength` set to `"64"`, `required` set to `true`, `style` set to `"padding:10px;width:90%"`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `p`; children: the HTML element `label` with `for` set to `"password"`; children: `Password`. Escape embedded text; render components on the server; the HTML element `br`. Escape embedded text; render components on the server; the HTML element `input` with `id` set to `"password"`, `type` set to `"password"`, `name` set to `"password"`, `autocomplete` set to `"current-password"`, `maxlength` set to `"256"`, `required` set to `true`, `style` set to `"padding:10px;width:90%"`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `button` with `type` set to `"submit"`, `style` set to `"padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit"`; children: `Sign in and return to the app`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `p` with `style` set to `"font-size:14px;color:#677189"`; children: `The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.`. Escape embedded text; render components on the server. Escape embedded text; render components on the server and finish this operation.

### `ProviderFailure` {#symbol-ProviderFailure}

[source](views.md#code)

**Inputs and dependencies**

- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

**Behavior when execution reaches this operation**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` set to `"Sign-in could not continue"`; children: the HTML element `p`; children: `message`. Escape embedded text; render components on the server; the HTML element `a` with `href` set to `"/login/start"`; children: `Start a new sign-in`. Escape embedded text; render components on the server. Escape embedded text; render components on the server and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

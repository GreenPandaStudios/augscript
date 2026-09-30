---
title: "provider/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Page from common
/** A server form with a checked HTTP action. The browser submits to the provider endpoint. */
ProviderLogin(string requestId, string csrf, string message, HttpAction submit) returns Html:
    return <Page title={"Sign in with the August provider"}><p>{message}</p><p style={"background:#f3f5f9;padding:12px;border-radius:8px"}>Demo account: <strong>ada</strong> · password <strong>august-demo</strong></p><form method={"post"} action={"/provider/login"} onSubmit={submit}><input type={"hidden"} name={"request_id"} value={requestId} /><input type={"hidden"} name={"csrf"} value={csrf} /><p><label for={"username"}>Username</label><br /><input id={"username"} name={"username"} autocomplete={"username"} value={"ada"} maxlength={"64"} required={true} style={"padding:10px;width:90%"} /></p><p><label for={"password"}>Password</label><br /><input id={"password"} type={"password"} name={"password"} autocomplete={"current-password"} maxlength={"256"} required={true} style={"padding:10px;width:90%"} /></p><button type={"submit"} style={"padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit"}>Sign in and return to the app</button></form><p style={"font-size:14px;color:#677189"}>The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.</p></Page>
ProviderFailure(string message) returns Html:
    return <Page title={"Sign-in could not continue"}><p>{message}</p><a href={"/login/start"}>Start a new sign-in</a></Page>
```

```aug [Braces]
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-ProviderLogin"></a>
### `ProviderLogin` · [source](views.md#code)

A server form with a checked HTTP action. The browser submits to the provider endpoint. The caller supplies `requestId`, `csrf`, and `message` as `string` and `submit` as `HttpAction`. The result is `Html`.

It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in with the August provider"` containing the HTML element `p` containing `message` (server-rendered; text escaped), the HTML element `p` with `style` = `"background:#f3f5f9;padding:12px;border-radius:8px"` containing `Demo account: `, the HTML element `strong` containing `ada` (server-rendered; text escaped), ` · password `, the HTML element `strong` containing `august-demo` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `form` with `method` = `"post"`, `action` = `"/provider/login"`, `onSubmit` = `submit` containing the HTML element `input` with `type` = `"hidden"`, `name` = `"request_id"`, `value` = `requestId` (server-rendered; text escaped), the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `csrf` (server-rendered; text escaped), the HTML element `p` containing the HTML element `label` with `for` = `"username"` containing `Username` (server-rendered; text escaped), the HTML element `br` (server-rendered; text escaped), the HTML element `input` with `id` = `"username"`, `name` = `"username"`, `autocomplete` = `"username"`, `value` = `"ada"`, `maxlength` = `"64"`, `required` = `true`, `style` = `"padding:10px;width:90%"` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` containing the HTML element `label` with `for` = `"password"` containing `Password` (server-rendered; text escaped), the HTML element `br` (server-rendered; text escaped), the HTML element `input` with `id` = `"password"`, `type` = `"password"`, `name` = `"password"`, `autocomplete` = `"current-password"`, `maxlength` = `"256"`, `required` = `true`, `style` = `"padding:10px;width:90%"` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `button` with `type` = `"submit"`, `style` = `"padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit"` containing `Sign in and return to the app` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` with `style` = `"font-size:14px;color:#677189"` containing `The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.` (server-rendered; text escaped) (server-rendered; text escaped).

<a id="symbol-ProviderFailure"></a>
### `ProviderFailure` · [source](views.md#code)

The caller supplies `message` as `string`. The result is `Html`. It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign-in could not continue"` containing the HTML element `p` containing `message` (server-rendered; text escaped), the HTML element `a` with `href` = `"/login/start"` containing `Start a new sign-in` (server-rendered; text escaped) (server-rendered; text escaped).

### Dependencies

[`Page`](../common/views.md#symbol-Page) from `common` takes `title` as `string` and `children` as `List<Html>`. It returns `Html`.

::::

:::::

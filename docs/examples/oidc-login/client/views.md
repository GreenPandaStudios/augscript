---
title: "client/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/views.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](contracts.md)
- [`client/endpoints.aug`](endpoints.md)
- [`client/export.aug`](export.md)
- [`client/login.aug`](login.md)
- [`client/logout.aug`](logout.md)
- [`client/protocol.aug`](protocol.md)
- [`client/session.aug`](session.md)
- [`client/views.aug`](views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
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
import SessionClaims from contracts
import Page from common
import logout from logout
LoginPage() returns Html:
    return <Page title={"Sign in"}><p>This August app is both an OpenID Connect provider and a login client.</p><p><a href={"/login/start"} style={"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"}>Sign in with OpenID Connect</a></p><p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p></Page>
Welcome(SessionClaims session) returns Html unless HttpError:
    return <Page title={"Welcome, " + session.name}><p>You are signed in as <strong>{session.name}</strong>.</p><p>Subject: <code>{session.sub}</code></p><p><a href={"/me"}>View the protected JSON endpoint</a></p><form method={"post"} action={"/logout"} onSubmit={handle logout(input from form)}><input type={"hidden"} name={"csrf"} value={session.csrf} /><button type={"submit"} style={"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"}>Sign out</button></form></Page>
```

```aug [Braces]
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims from contracts
import Page from common
import logout from logout
LoginPage() returns Html {
    return <Page title={"Sign in"}><p>This August app is both an OpenID Connect provider and a login client.</p><p><a href={"/login/start"} style={"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"}>Sign in with OpenID Connect</a></p><p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p></Page>
}
Welcome(SessionClaims session) returns Html unless HttpError {
    return <Page title={"Welcome, " + session.name}><p>You are signed in as <strong>{session.name}</strong>.</p><p>Subject: <code>{session.sub}</code></p><p><a href={"/me"}>View the protected JSON endpoint</a></p><form method={"post"} action={"/logout"} onSubmit={handle logout(input from form)}><input type={"hidden"} name={"csrf"} value={session.csrf} /><button type={"submit"} style={"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"}>Sign out</button></form></Page>
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-LoginPage"></a>
### `LoginPage` · [source](views.md#code)

It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in"` containing a paragraph containing `This August app is both an OpenID Connect provider and a login client.` with escaped text, a paragraph containing a link with `href` = `"/login/start"`, `style` = `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"` containing `Sign in with OpenID Connect` with escaped text with escaped text, a paragraph containing `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.` with escaped text with escaped text.

<a id="symbol-Welcome"></a>
### `Welcome` · [source](views.md#code)

It takes `session` as [`SessionClaims`](contracts.md#symbol-SessionClaims). Failures can raise `HttpError`.

It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = the text `Welcome, {session.name}` containing a paragraph containing `You are signed in as `, the HTML element `strong` containing `session.name` with escaped text, `.` with escaped text, a paragraph containing `Subject: `, the HTML element `code` containing `session.sub` with escaped text with escaped text, a paragraph containing a link with `href` = `"/me"` containing `View the protected JSON endpoint` with escaped text with escaped text, the HTML element `form` with `method` = `"post"`, `action` = `"/logout"`, `onSubmit` = a form action that sends `POST /logout` to [`logout`](logout.md#symbol-logout) on submission containing the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `session.csrf` with escaped text, a button with `type` = `"submit"`, `style` = `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"` containing `Sign out` with escaped text with escaped text with escaped text.

### Dependencies

It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`csrf`, `name`, and `sub`) from `contracts`. It uses [`logout`](logout.md#symbol-logout) from `logout`. It uses [`Page`](../common/views.md#symbol-Page) from `common`. These links explain the full dependency contracts.

::::

:::::

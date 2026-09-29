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
import SessionClaims from contracts
import Page from common
import logout from logout
LoginPage() returns Html:
    return <Page title={"Sign in"}><p>This August app is both an OpenID Connect provider and a login client.</p><p><a href={"/login/start"} style={"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"}>Sign in with OpenID Connect</a></p><p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p></Page>
Welcome(SessionClaims session) returns Html unless HttpError:
    return <Page title={"Welcome, " + session.name}><p>You are signed in as <strong>{session.name}</strong>.</p><p>Subject: <code>{session.sub}</code></p><p><a href={"/me"}>View the protected JSON endpoint</a></p><form method={"post"} action={"/logout"} onSubmit={handle logout(input from form)}><input type={"hidden"} name={"csrf"} value={session.csrf} /><button type={"submit"} style={"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"}>Sign out</button></form></Page>
```

```aug [Braces]
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

Returns `Html`.

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in"` containing the HTML element `p` containing `This August app is both an OpenID Connect provider and a login client.` (server-rendered; text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/login/start"`, `style` = `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"` containing `Sign in with OpenID Connect` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` containing `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.` (server-rendered; text escaped) (server-rendered; text escaped).

<a id="symbol-Welcome"></a>
### `Welcome` · [source](views.md#code)

**Inputs:** Take `session` ([`SessionClaims`](contracts.md#symbol-SessionClaims)).

Returns `Html`. Can fail with `HttpError`.

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Welcome, "` plus `name` of `session` containing the HTML element `p` containing `You are signed in as `, the HTML element `strong` containing `name` of `session` (server-rendered; text escaped), `.` (server-rendered; text escaped), the HTML element `p` containing `Subject: `, the HTML element `code` containing `sub` of `session` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/me"` containing `View the protected JSON endpoint` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `form` with `method` = `"post"`, `action` = `"/logout"`, `onSubmit` = a deferred HTTP form action for [`logout`](logout.md#symbol-logout); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method containing the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `csrf` of `session` (server-rendered; text escaped), the HTML element `button` with `type` = `"submit"`, `style` = `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"` containing `Sign out` (server-rendered; text escaped) (server-rendered; text escaped) (server-rendered; text escaped).

### Dependencies

- [`LogoutForm`](contracts.md#symbol-LogoutForm).
- [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`: read `csrf` (`string`); read `name` (`string`); read `sub` (`string`).
- [`logout`](logout.md#symbol-logout) (`input`: [`LogoutForm`](contracts.md#symbol-LogoutForm) from HTTP form, `token`: `optional string` from HTTP cookie `aug_session`, `origin`: `optional string` from HTTP header) → `HttpResponse<Html>`; can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError` from `logout`.
- [`Page`](../common/views.md#symbol-Page) (`title`: `string`, `children`: `List<Html>`) → `Html` from `common`.

::::

:::::

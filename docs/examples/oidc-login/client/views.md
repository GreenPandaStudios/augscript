---
title: "client/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`LoginPage`](views.md#symbol-LoginPage) is a function returning `Html`.
- [`Welcome`](views.md#symbol-Welcome) is a function returning `Html`.

### `LoginPage` {#symbol-LoginPage}

[source](views.md#code)

Returns: `Html`.

**What it does**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in"` containing the HTML element `p` containing `This August app is both an OpenID Connect provider and a login client.` (rendered on the server with embedded text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/login/start"`, `style` = `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"` containing `Sign in with OpenID Connect` (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped), the HTML element `p` containing `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.` (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped).

### `Welcome` {#symbol-Welcome}

[source](views.md#code)

**Inputs**

- `session` ([`SessionClaims`](contracts.md#symbol-SessionClaims)) — required labeled input.

Returns: `Html`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Welcome, "` plus `name` of `session` containing the HTML element `p` containing `You are signed in as `, the HTML element `strong` containing `name` of `session` (rendered on the server with embedded text escaped), `.` (rendered on the server with embedded text escaped), the HTML element `p` containing `Subject: `, the HTML element `code` containing `sub` of `session` (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/me"` containing `View the protected JSON endpoint` (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped), the HTML element `form` with `method` = `"post"`, `action` = `"/logout"`, `onSubmit` = a deferred HTTP form action for [`logout`](logout.md#symbol-logout); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method containing the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `csrf` of `session` (rendered on the server with embedded text escaped), the HTML element `button` with `type` = `"submit"`, `style` = `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"` containing `Sign out` (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped) (rendered on the server with embedded text escaped).

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Record from `contracts`.

- Read `csrf` (`string`).
- Read `name` (`string`).
- Read `sub` (`string`).

#### [`logout`](logout.md#symbol-logout)

Function from `logout`.

- [`logout`](logout.md#symbol-logout) (`input`: [`LogoutForm`](contracts.md#symbol-LogoutForm) from HTTP form, `token`: `optional string` from HTTP cookie `aug_session`, `origin`: `optional string` from HTTP header) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys), `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take); can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`.

#### [`Page`](../common/views.md#symbol-Page)

Function from `common`.

- [`Page`](../common/views.md#symbol-Page) (`title`: `string`, `children`: `List<Html>`) → `Html`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

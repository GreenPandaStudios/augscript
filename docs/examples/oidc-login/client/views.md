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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `name`: `string`. Read-only after initialization.

Field `sub`: `string`. Read-only after initialization.

Field `csrf`: `string`. Read-only after initialization.

#### [`logout`](logout.md#symbol-logout)

Available from `logout`.

**Inputs and dependencies**

- `input`: [`LogoutForm`](contracts.md#symbol-LogoutForm). The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP form.
- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_session`.
- `origin`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

Possible failures: `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/logout`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `SessionError` returns status 403.

#### [`Page`](../common/views.md#symbol-Page)

Available from `common`.

**Inputs and dependencies**

- `title`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `children`: `List<Html>`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

### `LoginPage` {#symbol-LoginPage}

[source](views.md#code)

Result: `Html`.

**Behavior when execution reaches this operation**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` set to `"Sign in"`; children: the HTML element `p`; children: `This August app is both an OpenID Connect provider and a login client.`. Escape embedded text; render components on the server; the HTML element `p`; children: the HTML element `a` with `href` set to `"/login/start"`, `style` set to `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"`; children: `Sign in with OpenID Connect`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `p`; children: `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.`. Escape embedded text; render components on the server. Escape embedded text; render components on the server and finish this operation.

### `Welcome` {#symbol-Welcome}

[source](views.md#code)

**Inputs and dependencies**

- `session`: [`SessionClaims`](contracts.md#symbol-SessionClaims). The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Return the server component [`Page`](../common/views.md#symbol-Page) with `title` set to (`"Welcome, "` plus `name` of `session`); children: the HTML element `p`; children: `You are signed in as `; the HTML element `strong`; children: `name` of `session`. Escape embedded text; render components on the server; `.`. Escape embedded text; render components on the server; the HTML element `p`; children: `Subject: `; the HTML element `code`; children: `sub` of `session`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `p`; children: the HTML element `a` with `href` set to `"/me"`; children: `View the protected JSON endpoint`. Escape embedded text; render components on the server. Escape embedded text; render components on the server; the HTML element `form` with `method` set to `"post"`, `action` set to `"/logout"`, `onSubmit` set to a deferred HTTP form action for [`logout`](logout.md#symbol-logout); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method; children: the HTML element `input` with `type` set to `"hidden"`, `name` set to `"csrf"`, `value` set to `csrf` of `session`. Escape embedded text; render components on the server; the HTML element `button` with `type` set to `"submit"`, `style` set to `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"`; children: `Sign out`. Escape embedded text; render components on the server. Escape embedded text; render components on the server. Escape embedded text; render components on the server and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

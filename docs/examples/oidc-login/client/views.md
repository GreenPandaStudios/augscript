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

The result is `Html`.

It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in"` containing the HTML element `p` containing `This August app is both an OpenID Connect provider and a login client.` (server-rendered; text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/login/start"`, `style` = `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"` containing `Sign in with OpenID Connect` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` containing `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.` (server-rendered; text escaped) (server-rendered; text escaped).

<a id="symbol-Welcome"></a>
### `Welcome` · [source](views.md#code)

The caller supplies `session` as [`SessionClaims`](contracts.md#symbol-SessionClaims). The result is `Html`. It can fail with `HttpError`.

It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Welcome, "` plus `session.name` containing the HTML element `p` containing `You are signed in as `, the HTML element `strong` containing `session.name` (server-rendered; text escaped), `.` (server-rendered; text escaped), the HTML element `p` containing `Subject: `, the HTML element `code` containing `session.sub` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `p` containing the HTML element `a` with `href` = `"/me"` containing `View the protected JSON endpoint` (server-rendered; text escaped) (server-rendered; text escaped), the HTML element `form` with `method` = `"post"`, `action` = `"/logout"`, `onSubmit` = a deferred HTTP form action for [`logout`](logout.md#symbol-logout); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method containing the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `session.csrf` (server-rendered; text escaped), the HTML element `button` with `type` = `"submit"`, `style` = `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"` containing `Sign out` (server-rendered; text escaped) (server-rendered; text escaped) (server-rendered; text escaped).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The type parameters are `T` which must satisfy `Data`. [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. The file uses [`LogoutForm`](contracts.md#symbol-LogoutForm).

The file uses [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`. `csrf` is a read-only field of type `string`. `name` is a read-only field of type `string`. `sub` is a read-only field of type `string`. The file uses [`SessionError`](contracts.md#symbol-SessionError).

[`logout`](logout.md#symbol-logout) from `logout` takes `input` as [`LogoutForm`](contracts.md#symbol-LogoutForm) from HTTP form, `token` as `optional string` from HTTP cookie `aug_session` (omitted means null), and `origin` as `optional string` from HTTP header (omitted means null). It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), and [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). It can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, and `HttpError`. The file uses [`KeyError`](../common/keys.md#symbol-KeyError).

The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys). [`session`](../common/keys.md#symbol-SigningKeys.session) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session). It can fail with `KeyError`. [`Page`](../common/views.md#symbol-Page) from `common` takes `title` as `string` and `children` as `List<Html>`. It returns `Html`.

::::

:::::

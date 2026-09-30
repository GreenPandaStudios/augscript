---
title: "client/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/contracts.aug`

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
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error:
    pass
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-LoginTransaction"></a>
### `LoginTransaction` · immutable record · [source](contracts.md#code)

Browser-bound client state, nonce and PKCE verifier, consumed by the callback. It takes `state`, `nonce`, and `verifier` as strings, kept read-only and `expires` as an integer, kept read-only.

<a id="symbol-SessionClaims"></a>
### `SessionClaims` · immutable record · [source](contracts.md#code)

Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. It takes `iss`, `sub`, and `aud` as strings, kept read-only, `exp` and `iat` as integers, kept read-only, and `jti`, `csrf`, and `name` as strings, kept read-only.

<a id="symbol-LogoutForm"></a>
### `LogoutForm` · immutable record · [source](contracts.md#code)

It takes `csrf` as a string, kept read-only.

<a id="symbol-SessionError"></a>
### `SessionError` · class · [source](contracts.md#code)

It implements `Error`.

::::

:::::

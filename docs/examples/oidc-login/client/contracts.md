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
/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error:
    pass
```

```aug [Braces]
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

Browser-bound client state, nonce and PKCE verifier, consumed by the callback.

**Inputs:** Take `state` (`string`); store read-only. Take `nonce` (`string`); store read-only. Take `verifier` (`string`); store read-only. Take `expires` (`int`); store read-only.

<a id="symbol-SessionClaims"></a>
### `SessionClaims` · immutable record · [source](contracts.md#code)

Sessions require their own issuer, audience, key and JWT type, plus a live registry entry.

**Inputs:** Take `iss` (`string`); store read-only. Take `sub` (`string`); store read-only. Take `aud` (`string`); store read-only. Take `exp` (`int`); store read-only. Take `iat` (`int`); store read-only. Take `jti` (`string`); store read-only. Take `csrf` (`string`); store read-only. Take `name` (`string`); store read-only.

<a id="symbol-LogoutForm"></a>
### `LogoutForm` · immutable record · [source](contracts.md#code)

**Inputs:** Take `csrf` (`string`); store read-only.

<a id="symbol-SessionError"></a>
### `SessionError` · class · [source](contracts.md#code)

Implements `Error`.

::::

:::::

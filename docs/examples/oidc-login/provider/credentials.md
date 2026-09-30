---
title: "provider/credentials.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/credentials.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/credentials.aug`

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
// aug-spec: "credentials.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from august.crypto
/** One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. */
verifyCredentials(string username, string password, resolve Crypto crypto) returns bool uses crypto.passwordHash and crypto.decodeBase64url and crypto.equal unless CryptoError:
    if username.length() > 64 or password.length() > 256:
        return false
    actual = crypto.passwordHash(password=password.bytes(), salt="August demo salt v1".bytes(), iterations=600000)
    expected = crypto.decodeBase64url(input="s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A")
    userMatches = crypto.equal(left=username.bytes(), right="ada".bytes())
    passwordMatches = crypto.equal(left=actual, right=expected)
    return userMatches and passwordMatches
```

```aug [Braces]
// aug-spec: "credentials.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from august.crypto
/** One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. */
verifyCredentials(string username, string password, resolve Crypto crypto) returns bool uses crypto.passwordHash and crypto.decodeBase64url and crypto.equal unless CryptoError {
    if username.length() > 64 or password.length() > 256 {
        return false
    }
    actual = crypto.passwordHash(password=password.bytes(), salt="August demo salt v1".bytes(), iterations=600000)
    expected = crypto.decodeBase64url(input="s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A")
    userMatches = crypto.equal(left=username.bytes(), right="ada".bytes())
    passwordMatches = crypto.equal(left=actual, right=expected)
    return userMatches and passwordMatches
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `verifyCredentials` · [source](credentials.md#code) {#symbol-verifyCredentials}

One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. It takes `username` and `password` as strings. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) from dependency injection.

Failures can raise `CryptoError`.

If the byte length of `username` is greater than `64` or the byte length of `password` is greater than `256`, it returns `false`. It sets `actual` to [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) with `password` from the UTF-8 bytes of `password`, `salt` from the UTF-8 bytes of `"August demo salt v1"`, and `iterations` `600000`. It sets `expected` to `"s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A"` decoded as URL-safe base64 by `crypto`. It sets `userMatches` to [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `username` and `right` from the UTF-8 bytes of `"ada"`.

It sets `passwordMatches` to [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) with `left` from `actual` and `right` from `expected`. It returns `userMatches` and `passwordMatches`.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), and [`passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash)) from `august.crypto`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

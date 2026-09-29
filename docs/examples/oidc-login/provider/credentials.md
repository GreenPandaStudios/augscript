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

<a id="symbol-verifyCredentials"></a>
### `verifyCredentials` · [source](credentials.md#code)

One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability.

**Inputs:** Take `username` (`string`). Take `password` (`string`). Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`.

Returns `bool`. Uses [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). Can fail with `CryptoError`.

- If (the result of `length` on `username` is greater than `64`) or (the result of `length` on `password` is greater than `256`):
  - Return `false`.
- Set `actual` to the result of [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) on `crypto` with `password` as the result of `bytes` on `password`, `salt` as the result of `bytes` on `"August demo salt v1"`, `iterations` as `600000`.
- Set `expected` to the result of [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `"s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A"`.
- Set `userMatches` to the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `username`, `right` as the result of `bytes` on `"ada"`.
- Set `passwordMatches` to the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as `actual`, `right` as `expected`.
- Return `userMatches` and `passwordMatches`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) (`password`: `Bytes`, `salt`: `Bytes`, `iterations`: `int`) → `Bytes`; can fail with `CryptoError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::

---
title: "provider/credentials.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/credentials.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`verifyCredentials`](credentials.md#symbol-verifyCredentials) is a function returning `bool`.

### `verifyCredentials` {#symbol-verifyCredentials}

[source](credentials.md#code)

**Inputs**

- `username` (`string`) — required labeled input.
- `password` (`string`) — required labeled input.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: `bool`.

Capabilities: [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- If (call `length` on `username` is greater than `64`) or (call `length` on `password` is greater than `256`):
  - Return `false`.
- Set `actual` to call [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) on `crypto` with `password` = call `bytes` on `password`; `salt` = call `bytes` on `"August demo salt v1"`; `iterations` = `600000`.
- Set `expected` to call [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `"s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A"`.
- Set `userMatches` to call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `username`; `right` = call `bytes` on `"ada"`.
- Set `passwordMatches` to call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = `actual`; `right` = `expected`.
- Return `userMatches` and `passwordMatches`.

**Author documentation**

One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) (`password`: `Bytes`, `salt`: `Bytes`, `iterations`: `int`) → `Bytes`; can fail with `CryptoError`.

### Built-in operations used by this file

- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

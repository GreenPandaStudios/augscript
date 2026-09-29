---
title: "august/0.19.0/crypto/jose.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/crypto/jose.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/crypto/jose.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Crypto from contracts
import parse from august.json
/** A failed JOSE validation reveals no unverified claims. */
JwtError() implements Error:
    pass
/** This profile accepts only RS256, a configured key id, and an explicit token type. */
record JwtHeader(string alg, string kid, string typ)
/** Public signing-key metadata in RFC 7517 / RFC 7518 form. */
record RsaJwk(string kty, string kid, string alg, string use, string n, string e)
record RsaJwks(List<RsaJwk> keys)
/** Export public parameters. Private key material never enters the JSON document. */
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) returns RsaJwk uses crypto.exportRsa unless CryptoError:
    (modulus, exponent) = crypto.exportRsa(publicKey)
    return RsaJwk(kty="RSA", kid=kid, alg="RS256", use="sig", n=modulus.base64url(), e=exponent.base64url())
/** Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. */
importJwk(RsaJwk jwk, resolve Crypto crypto) returns RsaPublicKey uses crypto.decodeBase64url and crypto.importRsa unless JwtError:
    if jwk.kty != "RSA" or jwk.alg != "RS256" or jwk.use != "sig":
        throw JwtError()
    try:
        modulus = crypto.decodeBase64url(input=jwk.n)
        exponent = crypto.decodeBase64url(input=jwk.e)
        return crypto.importRsa(modulus, exponent)
    catch CryptoError error:
        throw JwtError()
/** Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token. */
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto) returns string uses crypto.signRsa unless JwtError:
    try:
        header = Json(value=JwtHeader(alg="RS256", kid=kid, typ=tokenType)).stringify()
        payload = claims.stringify()
        signing = header.bytes().base64url() + "." + payload.bytes().base64url()
        signature = crypto.signRsa(key=key, input=signing.bytes())
        return signing + "." + signature.base64url()
    catch CryptoError error:
        throw JwtError()
    catch JsonError error:
        throw JwtError()
/** Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs. */
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto) returns Json uses crypto.decodeBase64url and crypto.verifyRsa unless JwtError:
    if token.length() > 16384:
        throw JwtError()
    parts = token.split(separator=".")
    if parts.length() != 3:
        throw JwtError()
    try:
        first = parts.get(index=0)
        second = parts.get(index=1)
        third = parts.get(index=2)
        header = parse(input=crypto.decodeBase64url(input=first).text()).decode<JwtHeader>()
        if header.alg != "RS256" or header.kid != kid or header.typ != tokenType:
            throw JwtError()
        signature = crypto.decodeBase64url(input=third)
        if not crypto.verifyRsa(publicKey=publicKey, input=(first + "." + second).bytes(), signature=signature):
            throw JwtError()
        return parse(input=crypto.decodeBase64url(input=second).text())
    catch CryptoError error:
        throw JwtError()
    catch ConversionError error:
        throw JwtError()
    catch JsonError error:
        throw JwtError()
    catch IndexError error:
        throw JwtError()
```

```aug [Braces]
import Crypto from contracts
import parse from august.json
/** A failed JOSE validation reveals no unverified claims. */
JwtError() implements Error {
    pass
}
/** This profile accepts only RS256, a configured key id, and an explicit token type. */
record JwtHeader(string alg, string kid, string typ)
/** Public signing-key metadata in RFC 7517 / RFC 7518 form. */
record RsaJwk(string kty, string kid, string alg, string use, string n, string e)
record RsaJwks(List<RsaJwk> keys)
/** Export public parameters. Private key material never enters the JSON document. */
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) returns RsaJwk uses crypto.exportRsa unless CryptoError {
    (modulus, exponent) = crypto.exportRsa(publicKey)
    return RsaJwk(kty="RSA", kid=kid, alg="RS256", use="sig", n=modulus.base64url(), e=exponent.base64url())
}
/** Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. */
importJwk(RsaJwk jwk, resolve Crypto crypto) returns RsaPublicKey uses crypto.decodeBase64url and crypto.importRsa unless JwtError {
    if jwk.kty != "RSA" or jwk.alg != "RS256" or jwk.use != "sig" {
        throw JwtError()
    }
    try {
        modulus = crypto.decodeBase64url(input=jwk.n)
        exponent = crypto.decodeBase64url(input=jwk.e)
        return crypto.importRsa(modulus, exponent)
    }
    catch CryptoError error {
        throw JwtError()
    }
}
/** Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token. */
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto) returns string uses crypto.signRsa unless JwtError {
    try {
        header = Json(value=JwtHeader(alg="RS256", kid=kid, typ=tokenType)).stringify()
        payload = claims.stringify()
        signing = header.bytes().base64url() + "." + payload.bytes().base64url()
        signature = crypto.signRsa(key=key, input=signing.bytes())
        return signing + "." + signature.base64url()
    }
    catch CryptoError error {
        throw JwtError()
    }
    catch JsonError error {
        throw JwtError()
    }
}
/** Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs. */
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto) returns Json uses crypto.decodeBase64url and crypto.verifyRsa unless JwtError {
    if token.length() > 16384 {
        throw JwtError()
    }
    parts = token.split(separator=".")
    if parts.length() != 3 {
        throw JwtError()
    }
    try {
        first = parts.get(index=0)
        second = parts.get(index=1)
        third = parts.get(index=2)
        header = parse(input=crypto.decodeBase64url(input=first).text()).decode<JwtHeader>()
        if header.alg != "RS256" or header.kid != kid or header.typ != tokenType {
            throw JwtError()
        }
        signature = crypto.decodeBase64url(input=third)
        if not crypto.verifyRsa(publicKey=publicKey, input=(first + "." + second).bytes(), signature=signature) {
            throw JwtError()
        }
        return parse(input=crypto.decodeBase64url(input=second).text())
    }
    catch CryptoError error {
        throw JwtError()
    }
    catch ConversionError error {
        throw JwtError()
    }
    catch JsonError error {
        throw JwtError()
    }
    catch IndexError error {
        throw JwtError()
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`JwtError`](jose.md#symbol-JwtError) is a class implementing `Error`.
- [`JwtHeader`](jose.md#symbol-JwtHeader) is an immutable record.
- [`RsaJwk`](jose.md#symbol-RsaJwk) is an immutable record.
- [`RsaJwks`](jose.md#symbol-RsaJwks) is an immutable record.
- [`rsaJwk`](jose.md#symbol-rsaJwk) is a function returning `RsaJwk`.
- [`importJwk`](jose.md#symbol-importJwk) is a function returning `RsaPublicKey`.
- [`signJwt`](jose.md#symbol-signJwt) is a function returning `string`.
- [`verifyJwt`](jose.md#symbol-verifyJwt) is a function returning `Json`.

### `JwtError` {#symbol-JwtError}

[source](jose.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

A failed JOSE validation reveals no unverified claims.

### `JwtHeader` {#symbol-JwtHeader}

[source](jose.md#code)

Immutable record.

**Author documentation**

This profile accepts only RS256, a configured key id, and an explicit token type.

**Inputs**

- `alg` (`string`) — required labeled input — stored as `alg` and read-only after initialization.
- `kid` (`string`) — required labeled input — stored as `kid` and read-only after initialization.
- `typ` (`string`) — required labeled input — stored as `typ` and read-only after initialization.

### `RsaJwk` {#symbol-RsaJwk}

[source](jose.md#code)

Immutable record.

**Author documentation**

Public signing-key metadata in RFC 7517 / RFC 7518 form.

**Inputs**

- `kty` (`string`) — required labeled input — stored as `kty` and read-only after initialization.
- `kid` (`string`) — required labeled input — stored as `kid` and read-only after initialization.
- `alg` (`string`) — required labeled input — stored as `alg` and read-only after initialization.
- `use` (`string`) — required labeled input — stored as `use` and read-only after initialization.
- `n` (`string`) — required labeled input — stored as `n` and read-only after initialization.
- `e` (`string`) — required labeled input — stored as `e` and read-only after initialization.

### `RsaJwks` {#symbol-RsaJwks}

[source](jose.md#code)

Immutable record.

**Inputs**

- `keys` (`List<RsaJwk>`) — required labeled input — stored as `keys` and read-only after initialization.

### `rsaJwk` {#symbol-rsaJwk}

[source](jose.md#code)

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.
- `kid` (`string`) — required labeled input.
- `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: [`RsaJwk`](jose.md#symbol-RsaJwk).

Capabilities: [`crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Split call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa) on `crypto` with `publicKey` = `publicKey` into `modulus`, `exponent`, in that order.
- Return call [`RsaJwk`](jose.md#symbol-RsaJwk) with `kty` = `"RSA"`; `kid` = `kid`; `alg` = `"RS256"`; `use` = `"sig"`; `n` = call `base64url` on `modulus`; `e` = call `base64url` on `exponent`.

**Author documentation**

Export public parameters. Private key material never enters the JSON document.

### `importJwk` {#symbol-importJwk}

[source](jose.md#code)

**Inputs**

- `jwk` ([`RsaJwk`](jose.md#symbol-RsaJwk)) — required labeled input.
- `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: `RsaPublicKey`.

Capabilities: [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Can fail with `JwtError`. Callers must catch or propagate these errors.

**What it does**

- If ((`kty` of `jwk` does not equal `"RSA"`) or (`alg` of `jwk` does not equal `"RS256"`)) or (`use` of `jwk` does not equal `"sig"`):
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `modulus` to call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `n` of `jwk`.
  - Set `exponent` to call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `e` of `jwk`.
  - Return call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa) on `crypto` with `modulus` = `modulus`; `exponent` = `exponent`.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

### `signJwt` {#symbol-signJwt}

[source](jose.md#code)

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.
- `claims` (`Json`) — required labeled input.
- `kid` (`string`) — required labeled input.
- `tokenType` (`string`) — required labeled input.
- `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: `string`.

Capabilities: [`crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Can fail with `JwtError`. Callers must catch or propagate these errors.

**What it does**

- Try these operations:
  - Set `header` to call `stringify` on call `Json` with `value` = call [`JwtHeader`](jose.md#symbol-JwtHeader) with `alg` = `"RS256"`; `kid` = `kid`; `typ` = `tokenType`.
  - Set `payload` to call `stringify` on `claims`.
  - Set `signing` to text formed by joining call `base64url` on call `bytes` on `header`, `"."`, call `base64url` on call `bytes` on `payload` in order.
  - Set `signature` to call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa) on `crypto` with `key` = `key`; `input` = call `bytes` on `signing`.
  - Return text formed by joining `signing`, `"."`, call `base64url` on `signature` in order.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

### `verifyJwt` {#symbol-verifyJwt}

[source](jose.md#code)

**Inputs**

- `token` (`string`) — required labeled input.
- `publicKey` (`RsaPublicKey`) — required labeled input.
- `kid` (`string`) — required labeled input.
- `tokenType` (`string`) — required labeled input.
- `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: `Json`.

Capabilities: [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Can fail with `JwtError`. Callers must catch or propagate these errors.

**What it does**

- If call `length` on `token` is greater than `16384`:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Set `parts` to call `split` on `token` with `separator` = `"."`.
- If call `length` on `parts` does not equal `3`:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `first` to call `get` on `parts` with `index` = `0`.
  - Set `second` to call `get` on `parts` with `index` = `1`.
  - Set `third` to call `get` on `parts` with `index` = `2`.
  - Set `header` to call `decode` on call [`parse`](../json/contracts.md#symbol-parse) with `input` = call `text` on call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `first` with type arguments [`JwtHeader`](jose.md#symbol-JwtHeader).
  - If ((`alg` of `header` does not equal `"RS256"`) or (`kid` of `header` does not equal `kid`)) or (`typ` of `header` does not equal `tokenType`):
    - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
  - Set `signature` to call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `third`.
  - If not (call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) on `crypto` with `publicKey` = `publicKey`; `input` = call `bytes` on text formed by joining `first`, `"."`, `second` in order; `signature` = `signature`):
    - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
  - Return call [`parse`](../json/contracts.md#symbol-parse) with `input` = call `text` on call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `second`.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `ConversionError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Fail with call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](contracts.md#symbol-Crypto)

Capability interface from `contracts`.

- [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa) (`publicKey`: `RsaPublicKey`) → `Tuple<Bytes,Bytes>`; can fail with `CryptoError`.
- [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.

#### [`parse`](../json/contracts.md#symbol-parse)

Function from `august.json`.

- [`parse`](../json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError`.

### Built-in operations used by this file

- `Bytes.base64url` (no inputs) → `string`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Bytes.text` (no inputs) → `string`: Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved. Can fail with `ConversionError`.
- `Json.decode` (no inputs) → `JwtHeader`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. Can fail with `JsonError`.
- `Json.stringify` (no inputs) → `string`: Serialize this JSON value with checked UTF-8 escaping and exact int64 values. Can fail with `JsonError`.
- `List<string>.get` (`index`: `int`) → `string`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<string>.length` (no inputs) → `int`: Read the number of elements.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.
- `string.split` (`separator`: `string`) → `List<string>`: Split at an exact separator, preserving empty parts.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

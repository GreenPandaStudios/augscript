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

<a id="symbol-JwtError"></a>
### `JwtError` · class · [source](jose.md#code)

A failed JOSE validation reveals no unverified claims. Implements `Error`.

<a id="symbol-JwtHeader"></a>
### `JwtHeader` · immutable record · [source](jose.md#code)

This profile accepts only RS256, a configured key id, and an explicit token type.

**Inputs:** Take `alg` (`string`); store read-only. Take `kid` (`string`); store read-only. Take `typ` (`string`); store read-only.

<a id="symbol-RsaJwk"></a>
### `RsaJwk` · immutable record · [source](jose.md#code)

Public signing-key metadata in RFC 7517 / RFC 7518 form.

**Inputs:** Take `kty` (`string`); store read-only. Take `kid` (`string`); store read-only. Take `alg` (`string`); store read-only. Take `use` (`string`); store read-only. Take `n` (`string`); store read-only. Take `e` (`string`); store read-only.

<a id="symbol-RsaJwks"></a>
### `RsaJwks` · immutable record · [source](jose.md#code)

**Inputs:** Take `keys` (`List<RsaJwk>`); store read-only.

<a id="symbol-rsaJwk"></a>
### `rsaJwk` · [source](jose.md#code)

Export public parameters. Private key material never enters the JSON document.

**Inputs:** Take `publicKey` (`RsaPublicKey`). Take `kid` (`string`). Resolve [`Crypto`](contracts.md#symbol-Crypto) as `crypto`.

Returns [`RsaJwk`](jose.md#symbol-RsaJwk). Uses [`crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Can fail with `CryptoError`.

- Split the result of [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa) on `crypto` with `publicKey` into `modulus`, `exponent` in order.
- Return a new [`RsaJwk`](jose.md#symbol-RsaJwk) with `kty` as `"RSA"`, `kid`, `alg` as `"RS256"`, `use` as `"sig"`, `n` as the result of `base64url` on `modulus`, `e` as the result of `base64url` on `exponent`.

<a id="symbol-importJwk"></a>
### `importJwk` · [source](jose.md#code)

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

**Inputs:** Take `jwk` ([`RsaJwk`](jose.md#symbol-RsaJwk)). Resolve [`Crypto`](contracts.md#symbol-Crypto) as `crypto`.

Returns `RsaPublicKey`. Uses [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Can fail with `JwtError`.

- If ((`kty` of `jwk` does not equal `"RSA"`) or (`alg` of `jwk` does not equal `"RS256"`)) or (`use` of `jwk` does not equal `"sig"`):
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Try:
  - Set `modulus` to the result of [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `n` of `jwk`.
  - Set `exponent` to the result of [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `e` of `jwk`.
  - Return the result of [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa) on `crypto` with `modulus`, `exponent`.
- Catch `CryptoError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).

<a id="symbol-signJwt"></a>
### `signJwt` · [source](jose.md#code)

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

**Inputs:** Take `key` (`RsaPrivateKey`). Take `claims` (`Json`). Take `kid` (`string`). Take `tokenType` (`string`). Resolve [`Crypto`](contracts.md#symbol-Crypto) as `crypto`.

Returns `string`. Uses [`crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Can fail with `JwtError`.

- Try:
  - Set `header` to the result of `stringify` on a new `Json` with `value` as a new [`JwtHeader`](jose.md#symbol-JwtHeader) with `alg` as `"RS256"`, `kid`, `typ` as `tokenType`.
  - Set `payload` to the result of `stringify` on `claims`.
  - Set `signing` to text that joins the result of `base64url` on the result of `bytes` on `header`, `"."` and the result of `base64url` on the result of `bytes` on `payload`.
  - Set `signature` to the result of [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa) on `crypto` with `key`, `input` as the result of `bytes` on `signing`.
  - Return text that joins `signing`, `"."` and the result of `base64url` on `signature`.
- Catch `CryptoError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Catch `JsonError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).

<a id="symbol-verifyJwt"></a>
### `verifyJwt` · [source](jose.md#code)

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

**Inputs:** Take `token` (`string`). Take `publicKey` (`RsaPublicKey`). Take `kid` (`string`). Take `tokenType` (`string`). Resolve [`Crypto`](contracts.md#symbol-Crypto) as `crypto`.

Returns `Json`. Uses [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Can fail with `JwtError`.

- If the result of `length` on `token` is greater than `16384`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Set `parts` to the result of `split` on `token` with `separator` as `"."`.
- If the result of `length` on `parts` does not equal `3`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Try:
  - Set `first` to the result of `get` on `parts` with `index` as `0`.
  - Set `second` to the result of `get` on `parts` with `index` as `1`.
  - Set `third` to the result of `get` on `parts` with `index` as `2`.
  - Set `header` to the result of `decode` on the result of [`parse`](../json/contracts.md#symbol-parse) with `input` as the result of `text` on the result of [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `first` with type arguments [`JwtHeader`](jose.md#symbol-JwtHeader).
  - If ((`alg` of `header` does not equal `"RS256"`) or (`kid` of `header` does not equal `kid`)) or (`typ` of `header` does not equal `tokenType`):
    - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
  - Set `signature` to the result of [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `third`.
  - If not (the result of [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) on `crypto` with `publicKey`, `input` as the result of `bytes` on text that joins `first`, `"."` and `second`, `signature`):
    - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
  - Return the result of [`parse`](../json/contracts.md#symbol-parse) with `input` as the result of `text` on the result of [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `second`.
- Catch `CryptoError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Catch `ConversionError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Catch `JsonError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).
- Catch `IndexError` as `error`:
  - Fail with a new [`JwtError`](jose.md#symbol-JwtError).

### Dependencies

- [`Crypto`](contracts.md#symbol-Crypto) from `contracts`: [`decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`exportRsa`](contracts.md#symbol-Crypto.exportRsa) (`publicKey`: `RsaPublicKey`) → `Tuple<Bytes,Bytes>`; can fail with `CryptoError`; [`importRsa`](contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`; [`signRsa`](contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`; [`verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`parse`](../json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError` from `august.json`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Bytes.text`: Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.
- `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.
- `Json.stringify`: Serialize this JSON value with checked UTF-8 escaping and exact int64 values.
- `List<string>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<string>.length`: Read the number of elements.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.
- `string.split`: Split at an exact separator, preserving empty parts.

::::

:::::

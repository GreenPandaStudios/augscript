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
// aug-spec: "jose.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto):
    (modulus, exponent) = crypto.exportRsa(publicKey)
    return RsaJwk(kty="RSA", kid=kid, alg="RS256", use="sig", n=modulus.base64url(), e=exponent.base64url())
/** Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. */
importJwk(RsaJwk jwk, resolve Crypto crypto):
    if jwk.kty != "RSA" or jwk.alg != "RS256" or jwk.use != "sig":
        throw JwtError()
    try:
        modulus = crypto.decodeBase64url(input=jwk.n)
        exponent = crypto.decodeBase64url(input=jwk.e)
        return crypto.importRsa(modulus, exponent)
    catch CryptoError error:
        throw JwtError()
/** Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token. */
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto):
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
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto):
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
// aug-spec: "jose.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) {
    (modulus, exponent) = crypto.exportRsa(publicKey)
    return RsaJwk(kty="RSA", kid=kid, alg="RS256", use="sig", n=modulus.base64url(), e=exponent.base64url())
}
/** Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. */
importJwk(RsaJwk jwk, resolve Crypto crypto) {
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
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto) {
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
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto) {
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

### `JwtError` · class · [source](jose.md#code) {#symbol-JwtError}

A failed JOSE validation reveals no unverified claims. It implements `Error`.

### `JwtHeader` · immutable record · [source](jose.md#code) {#symbol-JwtHeader}

This profile accepts only RS256, a configured key id, and an explicit token type. It takes `alg`, `kid`, and `typ` as strings, kept read-only.

### `RsaJwk` · immutable record · [source](jose.md#code) {#symbol-RsaJwk}

Public signing-key metadata in RFC 7517 / RFC 7518 form. It takes `kty`, `kid`, `alg`, `use`, `n`, and `e` as strings, kept read-only.

### `RsaJwks` · immutable record · [source](jose.md#code) {#symbol-RsaJwks}

It takes `keys` as `List<RsaJwk>`, kept read-only.

### `rsaJwk` · [source](jose.md#code) {#symbol-rsaJwk}

Export public parameters. Private key material never enters the JSON document. It takes `publicKey` as `RsaPublicKey` and `kid` as a string. It gets `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) from dependency injection.

Failures can raise `CryptoError`. It splits [`crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa) with `publicKey` into `modulus` and `exponent` in order. It returns a [`RsaJwk`](jose.md#symbol-RsaJwk) with `kty` `"RSA"`, `kid`, `alg` `"RS256"`, `use` `"sig"`, `n` from the URL-safe base64 encoding of `modulus`, and `e` from the URL-safe base64 encoding of `exponent`.

### `importJwk` · [source](jose.md#code) {#symbol-importJwk}

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. It takes `jwk` as [`RsaJwk`](jose.md#symbol-RsaJwk). It gets `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) from dependency injection.

Failures can raise [`JwtError`](jose.md#symbol-JwtError). It checks that `jwk.kty` equals `"RSA"` and `jwk.alg` equals `"RS256"` and `jwk.use` equals `"sig"`. It raises a [`JwtError`](jose.md#symbol-JwtError) at the first failed check.

It tries to set `modulus` to `jwk.n` decoded as URL-safe base64 by `crypto`, then set `exponent` to `jwk.e` decoded as URL-safe base64 by `crypto`, then return [`crypto.importRsa`](contracts.md#symbol-Crypto.importRsa) with `modulus` and `exponent`. If this work raises `CryptoError`, it raises a [`JwtError`](jose.md#symbol-JwtError).

### `signJwt` · [source](jose.md#code) {#symbol-signJwt}

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token. It takes `key` as `RsaPrivateKey`, `claims` as `Json`, and `kid` and `tokenType` as strings. It gets `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) from dependency injection.

Failures can raise [`JwtError`](jose.md#symbol-JwtError).

It sets `header` to `stringify` on a `Json` with `value` from a [`JwtHeader`](jose.md#symbol-JwtHeader) with `alg` `"RS256"`, `kid`, and `typ` from `tokenType`. It sets `payload` to `claims.stringify`. It builds `signing` as the text `{the URL-safe base64 encoding of the UTF-8 bytes of header}.{the URL-safe base64 encoding of the UTF-8 bytes of payload}`. It sets `signature` to [`crypto.signRsa`](contracts.md#symbol-Crypto.signRsa) with `key` and `input` from the UTF-8 bytes of `signing`.

It returns the text `{signing}.{the URL-safe base64 encoding of signature}`. If this work raises `CryptoError`, it raises a [`JwtError`](jose.md#symbol-JwtError). If this work raises `JsonError`, it raises a [`JwtError`](jose.md#symbol-JwtError).

### `verifyJwt` · [source](jose.md#code) {#symbol-verifyJwt}

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs. It takes `token` as a string, `publicKey` as `RsaPublicKey`, and `kid` and `tokenType` as strings. It gets `crypto` ([`Crypto`](contracts.md#symbol-Crypto)) from dependency injection.

Failures can raise [`JwtError`](jose.md#symbol-JwtError). It checks that the byte length of `token` is at most `16384`. It raises a [`JwtError`](jose.md#symbol-JwtError) at the first failed check. It sets `parts` to `token.split` with `separator` `"."`.

It checks that the number of elements in `parts` equals `3`. It raises a [`JwtError`](jose.md#symbol-JwtError) at the first failed check. It sets `first` to the item at index `0` in `parts`. It sets `second` to the item at index `1` in `parts`.

It sets `third` to the item at index `2` in `parts`. It sets `header` to `decode` on [`parse`](../json/contracts.md#symbol-parse) with `input` from `text` on `first` decoded as URL-safe base64 by `crypto` for [`JwtHeader`](jose.md#symbol-JwtHeader). It checks that `header.alg` equals `"RS256"` and `header.kid` equals `kid` and `header.typ` equals `tokenType`. It raises a [`JwtError`](jose.md#symbol-JwtError) at the first failed check.

It sets `signature` to `third` decoded as URL-safe base64 by `crypto`. It checks that [`crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) with `publicKey`, `input` from the UTF-8 bytes of the text `{first}.{second}`, and `signature` returns true. It raises a [`JwtError`](jose.md#symbol-JwtError) at the first failed check. It returns [`parse`](../json/contracts.md#symbol-parse) with `input` from `text` on `second` decoded as URL-safe base64 by `crypto`.

If this work raises `CryptoError`, it raises a [`JwtError`](jose.md#symbol-JwtError). If this work raises `ConversionError`, it raises a [`JwtError`](jose.md#symbol-JwtError). If this work raises `JsonError`, it raises a [`JwtError`](jose.md#symbol-JwtError). If this work raises `IndexError`, it raises a [`JwtError`](jose.md#symbol-JwtError).

### Dependencies

It uses [`Crypto`](contracts.md#symbol-Crypto) ([`decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`exportRsa`](contracts.md#symbol-Crypto.exportRsa), [`importRsa`](contracts.md#symbol-Crypto.importRsa), [`signRsa`](contracts.md#symbol-Crypto.signRsa), and [`verifyRsa`](contracts.md#symbol-Crypto.verifyRsa)) from `contracts`. It uses [`parse`](../json/contracts.md#symbol-parse) from `august.json`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

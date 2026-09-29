---
title: "august/0.19.0/crypto/jose.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/crypto/jose.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/crypto/jose.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](contracts.md#symbol-Crypto)

Available from `contracts`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url)**

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa)**

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`parse`](../json/contracts.md#symbol-parse)

Available from `august.json`.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `JsonError`. The caller must catch or propagate them.

### Built-in operations used by this file

#### `Bytes.base64url`

Encode immutable bytes as unpadded RFC 4648 URL-safe base64.

Result: `string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Bytes.text`

Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.

Result: `string`.

Possible failures: `ConversionError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Json.decode`

Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.

Result: `JwtHeader`.

Possible failures: `JsonError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Json.stringify`

Serialize this JSON value with checked UTF-8 escaping and exact int64 values.

Result: `string`.

Possible failures: `JsonError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<string>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `string`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<string>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.bytes`

Encode this string as immutable UTF-8 bytes.

Result: `Bytes`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.length`

Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.split`

Split at an exact separator, preserving empty parts.

Inputs: `separator`: `string`.

Result: `List<string>`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

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

**Inputs and dependencies**

- `alg`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `alg`. The field is read-only after initialization.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `kid`. The field is read-only after initialization.
- `typ`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `typ`. The field is read-only after initialization.

### `RsaJwk` {#symbol-RsaJwk}

[source](jose.md#code)

Immutable record.

**Author documentation**

Public signing-key metadata in RFC 7517 / RFC 7518 form.

**Inputs and dependencies**

- `kty`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `kty`. The field is read-only after initialization.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `kid`. The field is read-only after initialization.
- `alg`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `alg`. The field is read-only after initialization.
- `use`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `use`. The field is read-only after initialization.
- `n`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `n`. The field is read-only after initialization.
- `e`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `e`. The field is read-only after initialization.

### `RsaJwks` {#symbol-RsaJwks}

[source](jose.md#code)

Immutable record.

**Inputs and dependencies**

- `keys`: `List<RsaJwk>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `keys`. The field is read-only after initialization.

### `rsaJwk` {#symbol-rsaJwk}

[source](jose.md#code)

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`RsaJwk`](jose.md#symbol-RsaJwk).

Capabilities: [`crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Export public parameters. Private key material never enters the JSON document.

**Behavior when execution reaches this operation**

- Split the result of call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa) on `crypto` with `publicKey` set to `publicKey` into `modulus`, `exponent`, in that order.
- Return the result of call [`RsaJwk`](jose.md#symbol-RsaJwk) with `kty` set to `"RSA"`; `kid` set to `kid`; `alg` set to `"RS256"`; `use` set to `"sig"`; `n` set to the result of call `base64url` on `modulus`; `e` set to the result of call `base64url` on `exponent` and finish this operation.

### `importJwk` {#symbol-importJwk}

[source](jose.md#code)

**Inputs and dependencies**

- `jwk`: [`RsaJwk`](jose.md#symbol-RsaJwk). The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

**Author documentation**

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

**Behavior when execution reaches this operation**

- If (((`kty` of `jwk` does not equal `"RSA"`) or (`alg` of `jwk` does not equal `"RS256"`)) or (`use` of `jwk` does not equal `"sig"`)) is true:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `modulus` to the result of call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `n` of `jwk`.
  - Set `exponent` to the result of call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `e` of `jwk`.
  - Return the result of call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa) on `crypto` with `modulus` set to `modulus`; `exponent` set to `exponent` and finish this operation.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.

### `signJwt` {#symbol-signJwt}

[source](jose.md#code)

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `claims`: `Json`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

**Author documentation**

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

**Behavior when execution reaches this operation**

- Try these operations:
  - Set `header` to the result of call `stringify` on the result of call `Json` with `value` set to the result of call [`JwtHeader`](jose.md#symbol-JwtHeader) with `alg` set to `"RS256"`; `kid` set to `kid`; `typ` set to `tokenType`.
  - Set `payload` to the result of call `stringify` on `claims`.
  - Set `signing` to ((the result of call `base64url` on the result of call `bytes` on `header` plus `"."`) plus the result of call `base64url` on the result of call `bytes` on `payload`).
  - Set `signature` to the result of call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa) on `crypto` with `key` set to `key`; `input` set to the result of call `bytes` on `signing`.
  - Return ((`signing` plus `"."`) plus the result of call `base64url` on `signature`) and finish this operation.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.

### `verifyJwt` {#symbol-verifyJwt}

[source](jose.md#code)

**Inputs and dependencies**

- `token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `Json`.

Capabilities: [`crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

**Author documentation**

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

**Behavior when execution reaches this operation**

- If (the result of call `length` on `token` is greater than `16384`) is true:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Set `parts` to the result of call `split` on `token` with `separator` set to `"."`.
- If (the result of call `length` on `parts` does not equal `3`) is true:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `first` to the result of call `get` on `parts` with `index` set to `0`.
  - Set `second` to the result of call `get` on `parts` with `index` set to `1`.
  - Set `third` to the result of call `get` on `parts` with `index` set to `2`.
  - Set `header` to the result of call `decode` on the result of call [`parse`](../json/contracts.md#symbol-parse) with `input` set to the result of call `text` on the result of call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `first` with type arguments [`JwtHeader`](jose.md#symbol-JwtHeader).
  - If (((`alg` of `header` does not equal `"RS256"`) or (`kid` of `header` does not equal `kid`)) or (`typ` of `header` does not equal `tokenType`)) is true:
    - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
  - Set `signature` to the result of call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `third`.
  - If not (the result of call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa) on `crypto` with `publicKey` set to `publicKey`; `input` set to the result of call `bytes` on ((`first` plus `"."`) plus `second`); `signature` set to `signature`) is true:
    - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
  - Return the result of call [`parse`](../json/contracts.md#symbol-parse) with `input` set to the result of call `text` on the result of call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `second` and finish this operation.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `ConversionError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Fail with the result of call [`JwtError`](jose.md#symbol-JwtError). Transfer control to a matching catch or propagate the failure.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

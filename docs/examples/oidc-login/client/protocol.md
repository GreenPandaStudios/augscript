---
title: "client/protocol.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/protocol.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `client/protocol.aug`

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

## Code {#code}

::: code-group

```aug [Indentation]
import SessionError from contracts
import Discovery and IdClaims from provider
import settings from common
import HttpClient from august.web
import parse from august.json
import Crypto and GnuTlsCrypto and RsaJwks and rsaJwk and signJwt and importJwk and verifyJwt and JwtError from august.crypto
/** Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. */
responseJson(HttpResponse<Bytes> response) returns Json unless SessionError:
    if response.status != 200:
        throw SessionError()
    match response.headers.get(name="content-type"):
        when null:
            throw SessionError()
        when some contentType:
            if not contentType.startsWith(prefix="application/json"):
                throw SessionError()
    try:
        return parse(input=response.body.text())
    catch ConversionError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()
/** Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. */
discover(resolve HttpClient client) returns Discovery uses client.request unless SessionError and HttpError:
    config = settings()
    json = responseJson(response=client.request(method="GET", url=config.issuer + "/.well-known/openid-configuration"))
    try:
        document = json.decode<Discovery>()
        if document.issuer != config.issuer or document.authorization_endpoint != config.issuer + "/authorize" or document.token_endpoint != config.issuer + "/token" or document.jwks_uri != config.issuer + "/jwks" or document.userinfo_endpoint != config.issuer + "/userinfo":
            throw SessionError()
        return document
    catch JsonError error:
        throw SessionError()
/** Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. */
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) returns IdClaims uses crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and crypto.equal unless SessionError:
    config = settings()
    if jwks.keys.length() != 1:
        throw SessionError()
    try:
        jwk = jwks.keys.get(index=0)
        if jwk.kid != "provider-1":
            throw SessionError()
        publicKey = importJwk(jwk)
        claims = verifyJwt(token, publicKey, kid="provider-1", tokenType="JWT").decode<IdClaims>()
        if claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() > 255:
            throw SessionError()
        if claims.exp <= now or claims.iat < now - 300 or claims.iat > now + 30 or claims.exp <= claims.iat or claims.exp > now + 330:
            throw SessionError()
        if not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes()):
            throw SessionError()
        return claims
    catch JwtError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()
    catch IndexError error:
        throw SessionError()
    catch CryptoError error:
        throw SessionError()
test validateIdentity:
    when "signed_identity_claims":
        implement Crypto with GnuTlsCrypto
        resolve Crypto to crypto
        key = crypto.generateRsa()
        publicKey = crypto.publicRsa(key)
        jwks = RsaJwks(keys=[rsaJwk(publicKey, kid="provider-1")])
        config = settings()
        now = 1700000000
        expectedNonce = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
        it "accepts_valid_identity":
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now + 300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            identity = validateIdentity(token, nonce=expectedNonce, now, jwks)
            assert(condition=identity.sub == "ada")
        it "rejects_signed_invalid_claims" for (issuer, audience, subject, issued, expires, nonce) in [("https://wrong-issuer.invalid", config.clientId, "ada", now, now + 300, expectedNonce), (config.issuer, "wrong-audience", "ada", now, now + 300, expectedNonce), (config.issuer, config.clientId, "", now, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now - 400, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now + 100, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now, now, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 600, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 300, "wrong-nonce")]:
            claims = IdClaims(iss=issuer, sub=subject, aud=audience, exp=expires, iat=issued, nonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)
        it "rejects_token_context" for (kid, tokenType) in [("wrong-key", "JWT"), ("provider-1", "august-session+jwt")]:
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now + 300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid, tokenType)
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)
```

```aug [Braces]
import SessionError from contracts
import Discovery and IdClaims from provider
import settings from common
import HttpClient from august.web
import parse from august.json
import Crypto and GnuTlsCrypto and RsaJwks and rsaJwk and signJwt and importJwk and verifyJwt and JwtError from august.crypto
/** Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. */
responseJson(HttpResponse<Bytes> response) returns Json unless SessionError {
    if response.status != 200 {
        throw SessionError()
    }
    match response.headers.get(name="content-type") {
        when null {
            throw SessionError()
        }
        when some contentType {
            if not contentType.startsWith(prefix="application/json") {
                throw SessionError()
            }
        }
    }
    try {
        return parse(input=response.body.text())
    }
    catch ConversionError error {
        throw SessionError()
    }
    catch JsonError error {
        throw SessionError()
    }
}
/** Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. */
discover(resolve HttpClient client) returns Discovery uses client.request unless SessionError and HttpError {
    config = settings()
    json = responseJson(response=client.request(method="GET", url=config.issuer + "/.well-known/openid-configuration"))
    try {
        document = json.decode<Discovery>()
        if document.issuer != config.issuer or document.authorization_endpoint != config.issuer + "/authorize" or document.token_endpoint != config.issuer + "/token" or document.jwks_uri != config.issuer + "/jwks" or document.userinfo_endpoint != config.issuer + "/userinfo" {
            throw SessionError()
        }
        return document
    }
    catch JsonError error {
        throw SessionError()
    }
}
/** Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. */
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) returns IdClaims uses crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and crypto.equal unless SessionError {
    config = settings()
    if jwks.keys.length() != 1 {
        throw SessionError()
    }
    try {
        jwk = jwks.keys.get(index=0)
        if jwk.kid != "provider-1" {
            throw SessionError()
        }
        publicKey = importJwk(jwk)
        claims = verifyJwt(token, publicKey, kid="provider-1", tokenType="JWT").decode<IdClaims>()
        if claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() > 255 {
            throw SessionError()
        }
        if claims.exp <= now or claims.iat < now - 300 or claims.iat > now + 30 or claims.exp <= claims.iat or claims.exp > now + 330 {
            throw SessionError()
        }
        if not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes()) {
            throw SessionError()
        }
        return claims
    }
    catch JwtError error {
        throw SessionError()
    }
    catch JsonError error {
        throw SessionError()
    }
    catch IndexError error {
        throw SessionError()
    }
    catch CryptoError error {
        throw SessionError()
    }
}
test validateIdentity {
    when "signed_identity_claims" {
        implement Crypto with GnuTlsCrypto
        resolve Crypto to crypto
        key = crypto.generateRsa()
        publicKey = crypto.publicRsa(key)
        jwks = RsaJwks(keys=[rsaJwk(publicKey, kid="provider-1")])
        config = settings()
        now = 1700000000
        expectedNonce = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
        it "accepts_valid_identity" {
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now + 300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            identity = validateIdentity(token, nonce=expectedNonce, now, jwks)
            assert(condition=identity.sub == "ada")
        }
        it "rejects_signed_invalid_claims" for (issuer, audience, subject, issued, expires, nonce) in [("https://wrong-issuer.invalid", config.clientId, "ada", now, now + 300, expectedNonce), (config.issuer, "wrong-audience", "ada", now, now + 300, expectedNonce), (config.issuer, config.clientId, "", now, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now - 400, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now + 100, now + 300, expectedNonce), (config.issuer, config.clientId, "ada", now, now, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 600, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 300, "wrong-nonce")] {
            claims = IdClaims(iss=issuer, sub=subject, aud=audience, exp=expires, iat=issued, nonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            try {
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            }
            catch SessionError error {
                assert(condition=true)
            }
        }
        it "rejects_token_context" for (kid, tokenType) in [("wrong-key", "JWT"), ("provider-1", "august-session+jwt")] {
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now + 300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid, tokenType)
            try {
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            }
            catch SessionError error {
                assert(condition=true)
            }
        }
    }
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Available from `august.crypto`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url)**

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal)**

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

**[`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa)**

Result: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa)**

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk)

Immutable record. Follow the linked specification for its full explanation.

Field `kid`: `string`. Read-only after initialization.

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Available from `august.crypto`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `keys`: `List<RsaJwk>`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

Field `keys`: `List<RsaJwk>`. Read-only after initialization.

#### [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk)

Available from `august.crypto`.

**Inputs and dependencies**

- `jwk`: [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

#### [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk)

Available from `august.crypto`.

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk).

Capabilities: [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt)

Available from `august.crypto`.

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `claims`: `Json`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

#### [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt)

Available from `august.crypto`.

**Inputs and dependencies**

- `token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `Json`.

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

#### [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse)

Available from `august.json`.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `JsonError`. The caller must catch or propagate them.

#### [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)

Available from `august.web`.

Interface. Follow the linked specification for its full explanation.

**[`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request)**

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `url`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `headers`: `optional Headers`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `body`: `optional Bytes`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.

Result: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request).

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`SessionError`](contracts.md#symbol-SessionError)

Available from `contracts`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`SessionError`](contracts.md#symbol-SessionError).

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `issuer`: `string`. Read-only after initialization.

Field `clientId`: `string`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

#### [`IdClaims`](../provider/contracts.md#symbol-IdClaims)

Available from `provider`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `iss`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `aud`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `exp`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `iat`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

Field `iss`: `string`. Read-only after initialization.

Field `aud`: `string`. Read-only after initialization.

Field `sub`: `string`. Read-only after initialization.

Field `exp`: `int`. Read-only after initialization.

Field `iat`: `int`. Read-only after initialization.

Field `nonce`: `string`. Read-only after initialization.

#### [`Discovery`](../provider/discovery.md#symbol-Discovery)

Available from `provider`.

Immutable record. Follow the linked specification for its full explanation.

Field `issuer`: `string`. Read-only after initialization.

Field `authorization_endpoint`: `string`. Read-only after initialization.

Field `token_endpoint`: `string`. Read-only after initialization.

Field `jwks_uri`: `string`. Read-only after initialization.

Field `userinfo_endpoint`: `string`. Read-only after initialization.

### Built-in operations used by this file

#### `HttpResponse.body`

The typed response body.

Field type: `Bytes`.

#### `HttpResponse.headers`

Immutable response headers. Duplicate Set-Cookie values are preserved.

Field type: `Headers`.

#### `HttpResponse.status`

HTTP response status.

Field type: `int`.

#### `Bytes.text`

Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.

Result: `string`.

Possible failures: `ConversionError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Headers.get`

Read the first case-insensitive header value, or null.

Inputs: `name`: `string`.

Result: `optional string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Json.decode`

Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.

Result: `IdClaims`.

Possible failures: `JsonError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<RsaJwk>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `RsaJwk`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<RsaJwk>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `assert`

Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

Inputs: `condition`: `bool`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.bytes`

Encode this string as immutable UTF-8 bytes.

Result: `Bytes`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.length`

Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.startsWith`

Test an exact prefix.

Inputs: `prefix`: `string`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `responseJson` {#symbol-responseJson}

[source](protocol.md#code)

**Inputs and dependencies**

- `response`: `HttpResponse<Bytes>`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `SessionError`. The caller must catch or propagate them.

**Author documentation**

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport.

**Behavior when execution reaches this operation**

- If (`status` of `response` does not equal `200`) is true:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Select the matching case for the result of call `get` on `headers` of `response` with `name` set to `"content-type"`:
  - A null value, including omitted optional input:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `contentType`:
    - If not (the result of call `startsWith` on `contentType` with `prefix` set to `"application/json"`) is true:
      - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Return the result of call [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` set to the result of call `text` on `body` of `response` and finish this operation.
- If they fail with `ConversionError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

### `discover` {#symbol-discover}

[source](protocol.md#code)

**Inputs and dependencies**

- `client`: [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`Discovery`](../provider/discovery.md#symbol-Discovery).

Capabilities: [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request).

Possible failures: `SessionError`, `HttpError`. The caller must catch or propagate them.

**Author documentation**

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Set `json` to the result of call [`responseJson`](protocol.md#symbol-responseJson) with `response` set to the result of call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` set to `"GET"`; `url` set to (`issuer` of `config` plus `"/.well-known/openid-configuration"`).
- Try these operations:
  - Set `document` to the result of call `decode` on `json` with type arguments [`Discovery`](../provider/discovery.md#symbol-Discovery).
  - If (((((`issuer` of `document` does not equal `issuer` of `config`) or (`authorization_endpoint` of `document` does not equal (`issuer` of `config` plus `"/authorize"`))) or (`token_endpoint` of `document` does not equal (`issuer` of `config` plus `"/token"`))) or (`jwks_uri` of `document` does not equal (`issuer` of `config` plus `"/jwks"`))) or (`userinfo_endpoint` of `document` does not equal (`issuer` of `config` plus `"/userinfo"`))) is true:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Return `document` and finish this operation.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

### `validateIdentity` {#symbol-validateIdentity}

[source](protocol.md#code)

**Inputs and dependencies**

- `token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `jwks`: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

Possible failures: `SessionError`. The caller must catch or propagate them.

**Author documentation**

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- If (the result of call `length` on `keys` of `jwks` does not equal `1`) is true:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `jwk` to the result of call `get` on `keys` of `jwks` with `index` set to `0`.
  - If (`kid` of `jwk` does not equal `"provider-1"`) is true:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Set `publicKey` to the result of call [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) with `jwk` set to `jwk`; supply dependencies `crypto` from `crypto`.
  - Set `claims` to the result of call `decode` on the result of call [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` set to `token`; `publicKey` set to `publicKey`; `kid` set to `"provider-1"`; `tokenType` set to `"JWT"`; supply dependencies `crypto` from `crypto` with type arguments [`IdClaims`](../provider/contracts.md#symbol-IdClaims).
  - If ((((`iss` of `claims` does not equal `issuer` of `config`) or (`aud` of `claims` does not equal `clientId` of `config`)) or (the result of call `length` on `sub` of `claims` equals `0`)) or (the result of call `length` on `sub` of `claims` is greater than `255`)) is true:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - If (((((`exp` of `claims` is at most `now`) or (`iat` of `claims` is less than (`now` minus `300`))) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than (`now` plus `330`))) is true:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - If not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `nonce` of `claims`; `right` set to the result of call `bytes` on `nonce`) is true:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Return `claims` and finish this operation.
- If they fail with [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

### `test validateIdentity validateIdentity` {#symbol-test-20-validateIdentity-20-validateIdentity}

[source](protocol.md#code)

Same-file function tests for [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets isolated setup and dependency bindings.

#### Group `signed_identity_claims`

**Setup before each case**

- Provide [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) when `Crypto` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Set `crypto` to the instance provided for `Crypto`.
- Set `key` to the result of call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `publicKey` to the result of call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` set to `key`.
- Set `jwks` to the result of call [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` set to a list containing the result of call [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey` set to `publicKey`; `kid` set to `"provider-1"`; supply dependencies `crypto` from `Crypto`.
- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Set `now` to `1700000000`.
- Set `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`.

##### `accepts_valid_identity`

[source](protocol.md#code)

- Set `claims` to the result of call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` set to `issuer` of `config`; `sub` set to `"ada"`; `aud` set to `clientId` of `config`; `exp` set to (`now` plus `300`); `iat` set to `now`; `nonce` set to `expectedNonce`; `name` set to `"Ada"`.
- Set `token` to the result of call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` set to `key`; `claims` set to the result of call `Json` with `value` set to `claims`; `kid` set to `"provider-1"`; `tokenType` set to `"JWT"`; supply dependencies `crypto` from `Crypto`.
- Set `identity` to the result of call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` set to `token`; `nonce` set to `expectedNonce`; `now` set to `now`; `jwks` set to `jwks`; supply dependencies `crypto` from `Crypto`.
- Call `assert` with `condition` set to (`sub` of `identity` equals `"ada"`).

##### `rejects_signed_invalid_claims`

[source](protocol.md#code)

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `clientId` of `config`, `"ada"`, `now`, (`now` plus `300`), `expectedNonce`; a tuple containing `issuer` of `config`, `"wrong-audience"`, `"ada"`, `now`, (`now` plus `300`), `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `""`, `now`, (`now` plus `300`), `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, (`now` minus `400`), (`now` plus `300`), `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, (`now` plus `100`), (`now` plus `300`), `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, (`now` plus `600`), `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, (`now` plus `300`), `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

- Set `claims` to the result of call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` set to `issuer`; `sub` set to `subject`; `aud` set to `audience`; `exp` set to `expires`; `iat` set to `issued`; `nonce` set to `nonce`; `name` set to `"Ada"`.
- Set `token` to the result of call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` set to `key`; `claims` set to the result of call `Json` with `value` set to `claims`; `kid` set to `"provider-1"`; `tokenType` set to `"JWT"`; supply dependencies `crypto` from `Crypto`.
- Try these operations:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` set to `token`; `nonce` set to `expectedNonce`; `now` set to `now`; `jwks` set to `jwks`; supply dependencies `crypto` from `Crypto`.
  - Call `assert` with `condition` set to `false`.
- If they fail with [`SessionError`](contracts.md#symbol-SessionError), name the failure `error` and recover:
  - Call `assert` with `condition` set to `true`.

##### `rejects_token_context`

[source](protocol.md#code)

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

- Set `claims` to the result of call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` set to `issuer` of `config`; `sub` set to `"ada"`; `aud` set to `clientId` of `config`; `exp` set to (`now` plus `300`); `iat` set to `now`; `nonce` set to `expectedNonce`; `name` set to `"Ada"`.
- Set `token` to the result of call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` set to `key`; `claims` set to the result of call `Json` with `value` set to `claims`; `kid` set to `kid`; `tokenType` set to `tokenType`; supply dependencies `crypto` from `Crypto`.
- Try these operations:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` set to `token`; `nonce` set to `expectedNonce`; `now` set to `now`; `jwks` set to `jwks`; supply dependencies `crypto` from `Crypto`.
  - Call `assert` with `condition` set to `false`.
- If they fail with [`SessionError`](contracts.md#symbol-SessionError), name the failure `error` and recover:
  - Call `assert` with `condition` set to `true`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

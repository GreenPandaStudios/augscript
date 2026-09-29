---
title: "client/protocol.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/protocol.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-responseJson"></a>
### `responseJson` · [source](protocol.md#code)

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport.

**Inputs:** Take `response` (`HttpResponse<Bytes>`).

Returns `Json`. Can fail with `SessionError`.

- If `status` of `response` does not equal `200`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Match the result of `get` on `headers` of `response` with `name` as `"content-type"`:
  - A null value, including omitted optional input:
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - A present, non-null value, named `contentType`:
    - If not (the result of `startsWith` on `contentType` with `prefix` as `"application/json"`):
      - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Try:
  - Return the result of [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` as the result of `text` on `body` of `response`.
- Catch `ConversionError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Catch `JsonError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-discover"></a>
### `discover` · [source](protocol.md#code)

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent.

**Inputs:** Resolve [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) as `client`.

Returns [`Discovery`](../provider/discovery.md#symbol-Discovery). Uses [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). Can fail with `SessionError`, `HttpError`.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Set `json` to the result of [`responseJson`](protocol.md#symbol-responseJson) with `response` as the result of [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` as `"GET"`, `url` as `issuer` of `config` plus `"/.well-known/openid-configuration"`.
- Try:
  - Set `document` to the result of `decode` on `json` with type arguments [`Discovery`](../provider/discovery.md#symbol-Discovery).
  - If ((((`issuer` of `document` does not equal `issuer` of `config`) or (`authorization_endpoint` of `document` does not equal (`issuer` of `config` plus `"/authorize"`))) or (`token_endpoint` of `document` does not equal (`issuer` of `config` plus `"/token"`))) or (`jwks_uri` of `document` does not equal (`issuer` of `config` plus `"/jwks"`))) or (`userinfo_endpoint` of `document` does not equal (`issuer` of `config` plus `"/userinfo"`)):
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - Return `document`.
- Catch `JsonError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-validateIdentity"></a>
### `validateIdentity` · [source](protocol.md#code)

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce.

**Inputs:** Take `token` (`string`). Take `nonce` (`string`). Take `now` (`int`). Take `jwks` ([`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)). Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`.

Returns [`IdClaims`](../provider/contracts.md#symbol-IdClaims). Uses [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). Can fail with `SessionError`.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- If the result of `length` on `keys` of `jwks` does not equal `1`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Try:
  - Set `jwk` to the result of `get` on `keys` of `jwks` with `index` as `0`.
  - If `kid` of `jwk` does not equal `"provider-1"`:
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - Set `publicKey` to the result of [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) with `jwk` using `crypto`.
  - Set `claims` to the result of `decode` on the result of [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token`, `publicKey`, `kid` as `"provider-1"`, `tokenType` as `"JWT"` using `crypto` with type arguments [`IdClaims`](../provider/contracts.md#symbol-IdClaims).
  - If (((`iss` of `claims` does not equal `issuer` of `config`) or (`aud` of `claims` does not equal `clientId` of `config`)) or (the result of `length` on `sub` of `claims` equals `0`)) or (the result of `length` on `sub` of `claims` is greater than `255`):
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - If ((((`exp` of `claims` is at most `now`) or (`iat` of `claims` is less than (`now` minus `300`))) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than (`now` plus `330`)):
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - If not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `nonce` of `claims`, `right` as the result of `bytes` on `nonce`):
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - Return `claims`.
- Catch [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Catch `JsonError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Catch `IndexError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Catch `CryptoError` as `error`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-test validateIdentity"></a>
### `test validateIdentity` · [source](protocol.md#code)

Tests [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets fresh setup and dependencies.

#### `signed_identity_claims`

Setup for each case:

- Provide [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) for `Crypto`. Reuse stateless instances; create stateful instances per resolve.
- Set `crypto` to the instance provided for `Crypto`.
- Set `key` to the result of [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `publicKey` to the result of [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key`.
- Set `jwks` to a new [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` as a list containing the result of [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey`, `kid` as `"provider-1"` using `Crypto` for `crypto`.
- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Set `now` to `1700000000`.
- Set `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`.

##### `accepts_valid_identity` · [source](protocol.md#code)

- Set `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` as `issuer` of `config`, `sub` as `"ada"`, `aud` as `clientId` of `config`, `exp` as `now` plus `300`, `iat` as `now`, `nonce` as `expectedNonce`, `name` as `"Ada"`.
- Set `token` to the result of [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` as a new `Json` with `value` as `claims`, `kid` as `"provider-1"`, `tokenType` as `"JWT"` using `Crypto` for `crypto`.
- Set `identity` to the result of [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` as `expectedNonce`, `now`, `jwks` using `Crypto` for `crypto`.
- Call `assert` with `condition` as `sub` of `identity` equals `"ada"`.

##### `rejects_signed_invalid_claims` · [source](protocol.md#code)

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `clientId` of `config`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `"wrong-audience"`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `""`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now` minus `400`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now` plus `100`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now` plus `600`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now` plus `300`, `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

- Set `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` as `issuer`, `sub` as `subject`, `aud` as `audience`, `exp` as `expires`, `iat` as `issued`, `nonce`, `name` as `"Ada"`.
- Set `token` to the result of [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` as a new `Json` with `value` as `claims`, `kid` as `"provider-1"`, `tokenType` as `"JWT"` using `Crypto` for `crypto`.
- Try:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` as `expectedNonce`, `now`, `jwks` using `Crypto` for `crypto`.
  - Call `assert` with `condition` as `false`.
- Catch [`SessionError`](contracts.md#symbol-SessionError) as `error`:
  - Call `assert` with `condition` as `true`.

##### `rejects_token_context` · [source](protocol.md#code)

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

- Set `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` as `issuer` of `config`, `sub` as `"ada"`, `aud` as `clientId` of `config`, `exp` as `now` plus `300`, `iat` as `now`, `nonce` as `expectedNonce`, `name` as `"Ada"`.
- Set `token` to the result of [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` as a new `Json` with `value` as `claims`, `kid`, `tokenType` using `Crypto` for `crypto`.
- Try:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` as `expectedNonce`, `now`, `jwks` using `Crypto` for `crypto`.
  - Call `assert` with `condition` as `false`.
- Catch [`SessionError`](contracts.md#symbol-SessionError) as `error`:
  - Call `assert` with `condition` as `true`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) (no caller inputs) → `RsaPrivateKey`; can fail with `CryptoError`; [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`; [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`; [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) from `august.crypto`.
- [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`.
- [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk): read `kid` (`string`).
- [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`: construct with `keys`: `List<RsaJwk>`; read `keys` (`List<RsaJwk>`).
- [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) (`jwk`: [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk)) → `RsaPublicKey`; can fail with `JwtError` from `august.crypto`.
- [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey`: `RsaPublicKey`, `kid`: `string`) → [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk); can fail with `CryptoError` from `august.crypto`.
- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; can fail with `JwtError` from `august.crypto`.
- [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) (`token`: `string`, `publicKey`: `RsaPublicKey`, `kid`: `string`, `tokenType`: `string`) → `Json`; can fail with `JwtError` from `august.crypto`.
- [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError` from `august.json`.
- [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) from `august.web`: [`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) (`method`: `string`, `url`: `string`, `headers`: `optional Headers`, `body`: `optional Bytes`) → `HttpResponse<Bytes>`; can fail with `HttpError`.
- [`SessionError`](contracts.md#symbol-SessionError) from `contracts`: construct with no caller inputs.
- [`Settings`](../common/settings.md#symbol-Settings): read `clientId` (`string`); read `issuer` (`string`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.
- [`IdClaims`](../provider/contracts.md#symbol-IdClaims) from `provider`: construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `nonce`: `string`, `name`: `string`; read `aud` (`string`); read `exp` (`int`); read `iat` (`int`); read `iss` (`string`); read `nonce` (`string`); read `sub` (`string`).
- [`Discovery`](../provider/discovery.md#symbol-Discovery) from `provider`: read `authorization_endpoint` (`string`); read `issuer` (`string`); read `jwks_uri` (`string`); read `token_endpoint` (`string`); read `userinfo_endpoint` (`string`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `HttpResponse.body`: The typed response body.
- `HttpResponse.headers`: Immutable response headers. Duplicate Set-Cookie values are preserved.
- `HttpResponse.status`: HTTP response status.
- `Bytes.text`: Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.
- `Headers.get`: Read the first case-insensitive header value, or null.
- `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.
- `List<RsaJwk>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<RsaJwk>.length`: Read the number of elements.
- `assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.
- `string.startsWith`: Test an exact prefix.

::::

:::::

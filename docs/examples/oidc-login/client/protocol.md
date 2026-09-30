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
// aug-spec: "protocol.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "protocol.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. The caller supplies `response` as `HttpResponse<Bytes>`. The result is `Json`. It can fail with `SessionError`. If `response.status` does not equal `200`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

Select the first matching case for the value from `get` on `response.headers` (`name` set to `"content-type"`). If the selected value is null, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

If the selected value is not null, it names it `contentType` and follows these steps. If not (the value from `startsWith` on `contentType` (`prefix` set to `"application/json"`)), it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

This ends the case that names `contentType`.

After the match, execution continues unless the selected case returned or failed.

It tries to return the value from [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input` set to the value from `text` on `response.body`). If this attempt raises `ConversionError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError). If this attempt raises `JsonError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-discover"></a>
### `discover` · [source](protocol.md#code)

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. Dependency injection supplies `client` as [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). The result is [`Discovery`](../provider/discovery.md#symbol-Discovery). It can use [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). It can fail with `SessionError` and `HttpError`. It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). It sets `json` to the value from [`responseJson`](protocol.md#symbol-responseJson) (`response` set to the value from [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` (`method` set to `"GET"` and `url` set to `config.issuer` plus `"/.well-known/openid-configuration"`)).

It tries the following steps. It sets `document` to the value from `decode` on `json` with type arguments [`Discovery`](../provider/discovery.md#symbol-Discovery). If `document.issuer` does not equal `config.issuer` or `document.authorization_endpoint` does not equal (`config.issuer` plus `"/authorize"`) or `document.token_endpoint` does not equal (`config.issuer` plus `"/token"`) or `document.jwks_uri` does not equal (`config.issuer` plus `"/jwks"`) or `document.userinfo_endpoint` does not equal (`config.issuer` plus `"/userinfo"`), it fails with a new [`SessionError`](contracts.md#symbol-SessionError). Otherwise, it returns `document`. If this attempt raises `JsonError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-validateIdentity"></a>
### `validateIdentity` · [source](protocol.md#code)

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. The caller supplies `token` and `nonce` as `string`, `now` as `int`, and `jwks` as [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). The result is [`IdClaims`](../provider/contracts.md#symbol-IdClaims). It can use [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), and [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). It can fail with `SessionError`. It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). If the number of elements in `jwks.keys` does not equal `1`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

It tries the following steps. It sets `jwk` to the value from `get` on `jwks.keys` (`index` set to `0`). If `jwk.kid` does not equal `"provider-1"`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError). It sets `publicKey` to the value from [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) (`jwk`) using `crypto`. It sets `claims` to the value from `decode` on the value from [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) (`token`, `publicKey`, `kid` set to `"provider-1"`, and `tokenType` set to `"JWT"`) using `crypto` with type arguments [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

If `claims.iss` does not equal `config.issuer` or `claims.aud` does not equal `config.clientId` or the byte length of `claims.sub` equals `0` or the byte length of `claims.sub` is greater than `255`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError). If `claims.exp` is at most `now` or `claims.iat` is less than (`now` minus `300`) or `claims.iat` is greater than (`now` plus `30`) or `claims.exp` is at most `claims.iat` or `claims.exp` is greater than (`now` plus `330`), it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

If not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `claims.nonce` and `right` set to the UTF-8 bytes of `nonce`)), it fails with a new [`SessionError`](contracts.md#symbol-SessionError). Otherwise, it returns `claims`. If this attempt raises [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError). If this attempt raises `JsonError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError). If this attempt raises `IndexError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError).

If this attempt raises `CryptoError`, it catches it as `error` and fails with a new [`SessionError`](contracts.md#symbol-SessionError).

<a id="symbol-test validateIdentity"></a>
### `test validateIdentity` · [source](protocol.md#code)

Tests [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets fresh setup and dependencies.

#### `signed_identity_claims`

Setup for each case:

Provide [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) for `Crypto`. Reuse stateless instances; create stateful instances per resolve. It sets `crypto` to the instance provided for `Crypto`. It sets `key` to the value from [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`. It sets `publicKey` to the value from [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` (`key`). It sets `jwks` to a new [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) (`keys` set to a list containing the value from [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey` and `kid` set to `"provider-1"`) using `Crypto` for `crypto`). It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). It sets `now` to `1700000000`.

It sets `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`.

##### `accepts_valid_identity` · [source](protocol.md#code)

It sets `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`iss` set to `config.issuer`, `sub` set to `"ada"`, `aud` set to `config.clientId`, `exp` set to `now` plus `300`, `iat` set to `now`, `nonce` set to `expectedNonce`, and `name` set to `"Ada"`). It sets `token` to the value from [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`, `claims` set to a new `Json` (`value` set to `claims`), `kid` set to `"provider-1"`, and `tokenType` set to `"JWT"`) using `Crypto` for `crypto`.

It sets `identity` to the value from [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token`, `nonce` set to `expectedNonce`, `now`, and `jwks`) using `Crypto` for `crypto`. It calls `assert` (`condition` set to `identity.sub` equals `"ada"`).

##### `rejects_signed_invalid_claims` · [source](protocol.md#code)

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `"wrong-audience"`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `""`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` minus `400`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` plus `100`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `600`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

It sets `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`iss` set to `issuer`, `sub` set to `subject`, `aud` set to `audience`, `exp` set to `expires`, `iat` set to `issued`, `nonce`, and `name` set to `"Ada"`). It sets `token` to the value from [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`, `claims` set to a new `Json` (`value` set to `claims`), `kid` set to `"provider-1"`, and `tokenType` set to `"JWT"`) using `Crypto` for `crypto`.

It tries to call [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token`, `nonce` set to `expectedNonce`, `now`, and `jwks`) using `Crypto` for `crypto`, then call `assert` (`condition` set to `false`). If this attempt raises [`SessionError`](contracts.md#symbol-SessionError), it catches it as `error` and calls `assert` (`condition` set to `true`).

##### `rejects_token_context` · [source](protocol.md#code)

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

It sets `claims` to a new [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`iss` set to `config.issuer`, `sub` set to `"ada"`, `aud` set to `config.clientId`, `exp` set to `now` plus `300`, `iat` set to `now`, `nonce` set to `expectedNonce`, and `name` set to `"Ada"`). It sets `token` to the value from [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`, `claims` set to a new `Json` (`value` set to `claims`), `kid`, and `tokenType`) using `Crypto` for `crypto`.

It tries to call [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token`, `nonce` set to `expectedNonce`, `now`, and `jwks`) using `Crypto` for `crypto`, then call `assert` (`condition` set to `false`). If this attempt raises [`SessionError`](contracts.md#symbol-SessionError), it catches it as `error` and calls `assert` (`condition` set to `true`).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa) takes `publicKey` as `RsaPublicKey`. It returns `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. [`generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`. [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) takes `modulus` and `exponent` as `Bytes`. It returns `RsaPublicKey`. It can use [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`. [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) from `august.crypto`. The file uses [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`. The file uses [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). `kid` is a read-only field of type `string`. The file uses [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`. Construction takes `keys` as `List<RsaJwk>`. `keys` is a read-only field of type `List<RsaJwk>`. [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) from `august.crypto` takes `jwk` as [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). It returns `RsaPublicKey`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) and [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa). It can fail with `JwtError`.

[`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) from `august.crypto` takes `publicKey` as `RsaPublicKey` and `kid` as `string`. It returns [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) from `august.crypto` takes `key` as `RsaPrivateKey`, `claims` as `Json`, and `kid` and `tokenType` as `string`. It returns `string`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `JwtError`.

[`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) from `august.crypto` takes `token` as `string`, `publicKey` as `RsaPublicKey`, and `kid` and `tokenType` as `string`. It returns `Json`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) and [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `JwtError`. [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) from `august.json` takes `input` as `string`. It returns `Json`. It can fail with `JsonError`.

The file uses [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) from `august.web`. [`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) takes `method` and `url` as `string`, `headers` as `optional Headers` (omitted means null), and `body` as `optional Bytes` (omitted means null). It returns `HttpResponse<Bytes>`. It can use [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). It can fail with `HttpError`. The file uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. Construction takes no caller inputs. The file uses [`Settings`](../common/settings.md#symbol-Settings). `clientId` is a read-only field of type `string`. `issuer` is a read-only field of type `string`. [`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings).

The file uses [`IdClaims`](../provider/contracts.md#symbol-IdClaims) from `provider`. Construction takes `iss`, `sub`, and `aud` as `string`, `exp` and `iat` as `int`, and `nonce` and `name` as `string`. `aud` is a read-only field of type `string`. `exp` is a read-only field of type `int`. `iat` is a read-only field of type `int`. `iss` is a read-only field of type `string`. `nonce` is a read-only field of type `string`. `sub` is a read-only field of type `string`.

The file uses [`Discovery`](../provider/discovery.md#symbol-Discovery) from `provider`. `authorization_endpoint` is a read-only field of type `string`. `issuer` is a read-only field of type `string`. `jwks_uri` is a read-only field of type `string`. `token_endpoint` is a read-only field of type `string`. `userinfo_endpoint` is a read-only field of type `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`HttpResponse.body`: The typed response body. `HttpResponse.headers`: Immutable response headers. Duplicate Set-Cookie values are preserved. `HttpResponse.status`: HTTP response status. `Bytes.text`: Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved. `Headers.get`: Read the first case-insensitive header value, or null. `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. `List<RsaJwk>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<RsaJwk>.length`: Read the number of elements.

`assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion. `string.bytes`: Encode this string as immutable UTF-8 bytes. `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly. `string.startsWith`: Test an exact prefix.

::::

:::::

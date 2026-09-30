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
responseJson(HttpResponse<Bytes> response):
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
discover(resolve HttpClient client):
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
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto):
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
responseJson(HttpResponse<Bytes> response) {
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
discover(resolve HttpClient client) {
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
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) {
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

### `responseJson` · [source](protocol.md#code) {#symbol-responseJson}

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. It takes `response` as `HttpResponse<Bytes>`. Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

It checks that `response.status` equals `200`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It obtains `response.headers.get` with `name` `"content-type"`. If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError).

The non-null result becomes `contentType`. It checks that `contentType.startsWith` with `prefix` `"application/json"` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check.

It tries to return [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` from `response.body.text`. If this work raises `ConversionError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError).

### `discover` · [source](protocol.md#code) {#symbol-discover}

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. It gets `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)) from dependency injection. Failures can raise `HttpError` and [`SessionError`](contracts.md#symbol-SessionError).

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `json` to [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) with `method` `"GET"` and `url` from the text `{config.issuer}/.well-known/openid-configuration`. It sets `document` to `json.decode` for [`Discovery`](../provider/discovery.md#symbol-Discovery).

It checks that `document.issuer` equals `config.issuer` and `document.authorization_endpoint` equals the text `{config.issuer}/authorize` and `document.token_endpoint` equals the text `{config.issuer}/token` and `document.jwks_uri` equals the text `{config.issuer}/jwks` and `document.userinfo_endpoint` equals the text `{config.issuer}/userinfo`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It returns `document`. If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError).

### `validateIdentity` · [source](protocol.md#code) {#symbol-validateIdentity}

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. It takes `token` and `nonce` as strings, `now` as an integer, and `jwks` as [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) from dependency injection. Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that the number of elements in `jwks.keys` equals `1`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `jwk` to the item at index `0` in `jwks.keys`.

It checks that `jwk.kid` equals `"provider-1"`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `publicKey` to [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) with `jwk` using injected `crypto`. It sets `claims` to `decode` on [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token`, `publicKey`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `crypto` for [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

It checks that `claims.iss` equals `config.issuer` and `claims.aud` equals `config.clientId` and the byte length of `claims.sub` does not equal `0` and the byte length of `claims.sub` is at most `255` and `claims.exp` is greater than `now` and `claims.iat` is at least (`now` minus `300`) and `claims.iat` is at most (`now` plus `30`) and `claims.exp` is greater than `claims.iat` and `claims.exp` is at most (`now` plus `330`). It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It checks that the UTF-8 bytes of `claims.nonce` and the UTF-8 bytes of `nonce` match when compared by `crypto`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check.

It returns `claims`. If this work raises [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `IndexError`, it raises a [`SessionError`](contracts.md#symbol-SessionError).

If this work raises `CryptoError`, it raises a [`SessionError`](contracts.md#symbol-SessionError).

### `test validateIdentity` · [source](protocol.md#code) {#symbol-test-20-validateIdentity}

Tests [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets fresh setup and dependencies.

#### `signed_identity_claims`

Setup for each case: `Crypto` is provided by [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto). Stateless instances are reused; stateful instances are created for each resolve. It sets `crypto` to the instance provided for `Crypto`. It sets `key` to [`crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa).

It sets `publicKey` to [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) with `key`. It sets `jwks` to a [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` from a list containing [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey` and `kid` `"provider-1"` using injected `Crypto` for `crypto`. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `now` to `1700000000`.

It sets `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`.

##### `accepts_valid_identity` · [source](protocol.md#code)

It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `config.issuer`, `sub` `"ada"`, `aud` from `config.clientId`, `exp` from `now` plus `300`, `iat` from `now`, `nonce` from `expectedNonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `Crypto` for `crypto`. It sets `identity` to [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `identity.sub` equals `"ada"`.

##### `rejects_signed_invalid_claims` · [source](protocol.md#code)

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `"wrong-audience"`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `""`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` minus `400`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` plus `100`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `600`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `issuer`, `sub` from `subject`, `aud` from `audience`, `exp` from `expires`, `iat` from `issued`, `nonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `Crypto` for `crypto`. It calls [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `false` is true.

If this work raises [`SessionError`](contracts.md#symbol-SessionError), it the test requires `true` is true.

##### `rejects_token_context` · [source](protocol.md#code)

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `config.issuer`, `sub` `"ada"`, `aud` from `config.clientId`, `exp` from `now` plus `300`, `iat` from `now`, `nonce` from `expectedNonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid`, and `tokenType` using injected `Crypto` for `crypto`. It calls [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `false` is true.

If this work raises [`SessionError`](contracts.md#symbol-SessionError), it the test requires `true` is true.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)), [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto), [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) (`keys`), [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk), [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk), [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt), and [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) from `august.crypto`. It uses [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk) (`kid`) and [`Settings`](../common/settings.md#symbol-Settings) (`clientId` and `issuer`). It uses [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) from `august.json`. It uses [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) ([`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request)) from `august.web`.

It uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. It uses [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`aud`, `exp`, `iat`, `iss`, `nonce`, and `sub`) and [`Discovery`](../provider/discovery.md#symbol-Discovery) (`authorization_endpoint`, `issuer`, `jwks_uri`, `token_endpoint`, and `userinfo_endpoint`) from `provider`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`responseJson`](protocol.md#symbol-responseJson) is a function returning `Json`.
- [`discover`](protocol.md#symbol-discover) is a function returning `Discovery`.
- [`validateIdentity`](protocol.md#symbol-validateIdentity) is a function returning `IdClaims`.
- [`test validateIdentity`](protocol.md#symbol-test-20-validateIdentity) is a same-file test suite.

### `responseJson` {#symbol-responseJson}

[source](protocol.md#code)

**Inputs**

- `response` (`HttpResponse<Bytes>`) — required labeled input.

Returns: `Json`.

Can fail with `SessionError`. Callers must catch or propagate these errors.

**What it does**

- If `status` of `response` does not equal `200`:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Select the matching case for call `get` on `headers` of `response` with `name` = `"content-type"`:
  - A null value, including omitted optional input:
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `contentType`:
    - If not (call `startsWith` on `contentType` with `prefix` = `"application/json"`):
      - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Return call [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` = call `text` on `body` of `response`.
- If they fail with `ConversionError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport.

### `discover` {#symbol-discover}

[source](protocol.md#code)

**Inputs**

- `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)) — injected; callers omit it.

Returns: [`Discovery`](../provider/discovery.md#symbol-Discovery).

Capabilities: [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request).

Can fail with `SessionError`, `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Set `json` to call [`responseJson`](protocol.md#symbol-responseJson) with `response` = call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` = `"GET"`; `url` = (`issuer` of `config` plus `"/.well-known/openid-configuration"`).
- Try these operations:
  - Set `document` to call `decode` on `json` with type arguments [`Discovery`](../provider/discovery.md#symbol-Discovery).
  - If ((((`issuer` of `document` does not equal `issuer` of `config`) or (`authorization_endpoint` of `document` does not equal (`issuer` of `config` plus `"/authorize"`))) or (`token_endpoint` of `document` does not equal (`issuer` of `config` plus `"/token"`))) or (`jwks_uri` of `document` does not equal (`issuer` of `config` plus `"/jwks"`))) or (`userinfo_endpoint` of `document` does not equal (`issuer` of `config` plus `"/userinfo"`)):
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Return `document`.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent.

### `validateIdentity` {#symbol-validateIdentity}

[source](protocol.md#code)

**Inputs**

- `token` (`string`) — required labeled input.
- `nonce` (`string`) — required labeled input.
- `now` (`int`) — required labeled input.
- `jwks` ([`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)) — required labeled input.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.

Returns: [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

Can fail with `SessionError`. Callers must catch or propagate these errors.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- If call `length` on `keys` of `jwks` does not equal `1`:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - Set `jwk` to call `get` on `keys` of `jwks` with `index` = `0`.
  - If `kid` of `jwk` does not equal `"provider-1"`:
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Set `publicKey` to call [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) with `jwk` = `jwk`; inject `crypto` from `crypto`.
  - Set `claims` to call `decode` on call [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` = `token`; `publicKey` = `publicKey`; `kid` = `"provider-1"`; `tokenType` = `"JWT"`; inject `crypto` from `crypto` with type arguments [`IdClaims`](../provider/contracts.md#symbol-IdClaims).
  - If (((`iss` of `claims` does not equal `issuer` of `config`) or (`aud` of `claims` does not equal `clientId` of `config`)) or (call `length` on `sub` of `claims` equals `0`)) or (call `length` on `sub` of `claims` is greater than `255`):
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - If ((((`exp` of `claims` is at most `now`) or (`iat` of `claims` is less than (`now` minus `300`))) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than (`now` plus `330`)):
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - If not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `nonce` of `claims`; `right` = call `bytes` on `nonce`):
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - Return `claims`.
- If they fail with [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce.

### `test validateIdentity` {#symbol-test-20-validateIdentity}

[source](protocol.md#code)

Same-file function tests for [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets isolated setup and dependency bindings.

#### Group `signed_identity_claims`

**Setup before each case**

- Provide [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) when `Crypto` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Set `crypto` to the instance provided for `Crypto`.
- Set `key` to call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `publicKey` to call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` = `key`.
- Set `jwks` to call [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` = a list containing call [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey` = `publicKey`; `kid` = `"provider-1"`; inject `crypto` from `Crypto`.
- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Set `now` to `1700000000`.
- Set `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`.

##### `accepts_valid_identity`

[source](protocol.md#code)

- Set `claims` to call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` = `issuer` of `config`; `sub` = `"ada"`; `aud` = `clientId` of `config`; `exp` = (`now` plus `300`); `iat` = `now`; `nonce` = `expectedNonce`; `name` = `"Ada"`.
- Set `token` to call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` = `key`; `claims` = call `Json` with `value` = `claims`; `kid` = `"provider-1"`; `tokenType` = `"JWT"`; inject `crypto` from `Crypto`.
- Set `identity` to call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` = `token`; `nonce` = `expectedNonce`; `now` = `now`; `jwks` = `jwks`; inject `crypto` from `Crypto`.
- Call `assert` with `condition` = (`sub` of `identity` equals `"ada"`).

##### `rejects_signed_invalid_claims`

[source](protocol.md#code)

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `clientId` of `config`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `"wrong-audience"`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `""`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now` minus `400`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now` plus `100`, `now` plus `300`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now` plus `600`, `expectedNonce`; a tuple containing `issuer` of `config`, `clientId` of `config`, `"ada"`, `now`, `now` plus `300`, `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

- Set `claims` to call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` = `issuer`; `sub` = `subject`; `aud` = `audience`; `exp` = `expires`; `iat` = `issued`; `nonce` = `nonce`; `name` = `"Ada"`.
- Set `token` to call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` = `key`; `claims` = call `Json` with `value` = `claims`; `kid` = `"provider-1"`; `tokenType` = `"JWT"`; inject `crypto` from `Crypto`.
- Try these operations:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` = `token`; `nonce` = `expectedNonce`; `now` = `now`; `jwks` = `jwks`; inject `crypto` from `Crypto`.
  - Call `assert` with `condition` = `false`.
- If they fail with [`SessionError`](contracts.md#symbol-SessionError), name the failure `error` and recover:
  - Call `assert` with `condition` = `true`.

##### `rejects_token_context`

[source](protocol.md#code)

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

- Set `claims` to call [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` = `issuer` of `config`; `sub` = `"ada"`; `aud` = `clientId` of `config`; `exp` = (`now` plus `300`); `iat` = `now`; `nonce` = `expectedNonce`; `name` = `"Ada"`.
- Set `token` to call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` = `key`; `claims` = call `Json` with `value` = `claims`; `kid` = `kid`; `tokenType` = `tokenType`; inject `crypto` from `Crypto`.
- Try these operations:
  - Call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` = `token`; `nonce` = `expectedNonce`; `now` = `now`; `jwks` = `jwks`; inject `crypto` from `Crypto`.
  - Call `assert` with `condition` = `false`.
- If they fail with [`SessionError`](contracts.md#symbol-SessionError), name the failure `error` and recover:
  - Call `assert` with `condition` = `true`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) (no caller inputs) → `RsaPrivateKey`; can fail with `CryptoError`.
- [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.

#### [`GnuTlsCrypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto)

Class from `august.crypto`.

Used as a type or provider.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Class from `august.crypto`.

Used as a type or provider.

#### [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk)

Record.

- Read `kid` (`string`).

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Record from `august.crypto`.

- Construct with `keys`: `List<RsaJwk>` → [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).
- Read `keys` (`List<RsaJwk>`).

#### [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk)

Function from `august.crypto`.

- [`importJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-importJwk) (`jwk`: [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk)) → `RsaPublicKey`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa); can fail with `JwtError`.

#### [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk)

Function from `august.crypto`.

- [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey`: `RsaPublicKey`, `kid`: `string`) → [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk); inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa); can fail with `CryptoError`.

#### [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt)

Function from `august.crypto`.

- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa); can fail with `JwtError`.

#### [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt)

Function from `august.crypto`.

- [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) (`token`: `string`, `publicKey`: `RsaPublicKey`, `kid`: `string`, `tokenType`: `string`) → `Json`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa); can fail with `JwtError`.

#### [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse)

Function from `august.json`.

- [`parse`](../dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError`.

#### [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)

Capability interface from `august.web`.

- [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) (`method`: `string`, `url`: `string`, `headers`: `optional Headers`, `body`: `optional Bytes`) → `HttpResponse<Bytes>`; can fail with `HttpError`.

#### [`SessionError`](contracts.md#symbol-SessionError)

Class from `contracts`.

- Construct with no caller inputs → [`SessionError`](contracts.md#symbol-SessionError).

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `clientId` (`string`).
- Read `issuer` (`string`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

#### [`IdClaims`](../provider/contracts.md#symbol-IdClaims)

Record from `provider`.

- Construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `nonce`: `string`, `name`: `string` → [`IdClaims`](../provider/contracts.md#symbol-IdClaims).
- Read `aud` (`string`).
- Read `exp` (`int`).
- Read `iat` (`int`).
- Read `iss` (`string`).
- Read `nonce` (`string`).
- Read `sub` (`string`).

#### [`Discovery`](../provider/discovery.md#symbol-Discovery)

Record from `provider`.

- Read `authorization_endpoint` (`string`).
- Read `issuer` (`string`).
- Read `jwks_uri` (`string`).
- Read `token_endpoint` (`string`).
- Read `userinfo_endpoint` (`string`).

### Built-in operations used by this file

- `HttpResponse.body` (`Bytes`): The typed response body.
- `HttpResponse.headers` (`Headers`): Immutable response headers. Duplicate Set-Cookie values are preserved.
- `HttpResponse.status` (`int`): HTTP response status.
- `Bytes.text` (no inputs) → `string`: Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved. Can fail with `ConversionError`.
- `Headers.get` (`name`: `string`) → `optional string`: Read the first case-insensitive header value, or null.
- `Json.decode` (no inputs) → `IdClaims`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. Can fail with `JsonError`.
- `List<RsaJwk>.get` (`index`: `int`) → `RsaJwk`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<RsaJwk>.length` (no inputs) → `int`: Read the number of elements.
- `assert` (`condition`: `bool`) → `void`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.
- `string.startsWith` (`prefix`: `string`) → `bool`: Test an exact prefix.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

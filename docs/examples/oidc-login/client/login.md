---
title: "client/login.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/login.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `client/login.aug`

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
import LoginTransaction and SessionClaims and SessionError from contracts
import discover and responseJson and validateIdentity from protocol
import TokenResponse and UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto and RsaJwks and signJwt and JwtError from august.crypto
import Clock from august.time
import HttpClient and urlEncode from august.web
import ExpiringStore and StoreFull from august.memory
/** Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. */
endpoint GET "/login/start" as startLogin(resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve ExpiringStore<LoginTransaction> transactions) returns HttpResponse<Html> uses crypto.random and crypto.sha256 and clock.now and client.request and transactions.put unless SessionError with status 502 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    document = discover()
    browser = crypto.random(size=32).base64url()
    state = crypto.random(size=32).base64url()
    nonce = crypto.random(size=32).base64url()
    verifier = crypto.random(size=32).base64url()
    transaction = LoginTransaction(state, nonce, verifier, expires=clock.now() + 300)
    transactions.put(key=browser, value=transaction, expires=transaction.expires, now=clock.now())
    challenge = crypto.sha256(input=verifier.bytes()).base64url()
    location = document.authorization_endpoint + "?response_type=code&client_id=" + urlEncode(input=config.clientId) + "&redirect_uri=" + urlEncode(input=config.callback) + "&scope=openid%20profile&state=" + urlEncode(input=state) + "&nonce=" + urlEncode(input=nonce) + "&code_challenge=" + urlEncode(input=challenge) + "&code_challenge_method=S256"
    headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_login", value=browser, path="/login", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=<p>Opening the identity provider.</p>, status=303, headers=headers)
/** Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. */
endpoint GET "/login/callback" as loginCallback(string code from query, string state from query, optional string browser from cookie "aug_login", resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve SigningKeys keys, resolve ExpiringStore<LoginTransaction> transactions, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.signRsa and crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and clock.now and client.request and keys.session and transactions.take and sessions.put unless SessionError with status 400 and CryptoError with status 503 and TimeError with status 503 and KeyError and StoreFull with status 503 and JwtError and JsonError and HttpError:
    if not code.isToken(min=43, max=43) or not state.isToken(min=43, max=43):
        throw SessionError()
    match browser:
        when null:
            throw SessionError()
        when some secret:
            match transactions.take(key=secret, now=clock.now()):
                when null:
                    throw SessionError()
                when some transaction:
                    if not crypto.equal(left=transaction.state.bytes(), right=state.bytes()):
                        throw SessionError()
                    config = settings()
                    document = discover()
                    body = "grant_type=authorization_code&code=" + urlEncode(input=code) + "&redirect_uri=" + urlEncode(input=config.callback) + "&client_id=" + urlEncode(input=config.clientId) + "&code_verifier=" + urlEncode(input=transaction.verifier)
                    headers = Headers().with(name="content-type", value="application/x-www-form-urlencoded")
                    tokens = responseJson(response=client.request(method="POST", url=document.token_endpoint, headers, body=body.bytes())).decode<TokenResponse>()
                    if tokens.token_type != "Bearer" or not tokens.access_token.isToken(min=43, max=43) or tokens.expires_in <= 0:
                        throw SessionError()
                    jwks = responseJson(response=client.request(method="GET", url=document.jwks_uri)).decode<RsaJwks>()
                    identity = validateIdentity(token=tokens.id_token, nonce=transaction.nonce, now=clock.now(), jwks)
                    authHeaders = Headers().with(name="authorization", value="Bearer " + tokens.access_token)
                    user = responseJson(response=client.request(method="GET", url=document.userinfo_endpoint, headers=authHeaders)).decode<UserInfo>()
                    if user.sub != identity.sub:
                        throw SessionError()
                    now = clock.now()
                    session = SessionClaims(iss=config.baseUrl + "/app", sub=identity.sub, aud="august-app", exp=now + config.sessionSeconds, iat=now, jti=crypto.random(size=32).base64url(), csrf=crypto.random(size=32).base64url(), name=user.name)
                    jwt = signJwt(key=keys.session(), claims=Json(value=session), kid="session-1", tokenType="august-session+jwt")
                    sessions.put(key=session.jti, value=session, expires=session.exp, now=now)
                    responseHeaders = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value=jwt, path="/", maxAge=config.sessionSeconds, secure=config.secureCookies)
                    responseHeaders = withCookie(headers=responseHeaders, name="aug_login", value="", path="/login", maxAge=0, secure=config.secureCookies)
                    return HttpResponse(body=<p>Signed in.</p>, status=303, headers=responseHeaders)
```

```aug [Braces]
import LoginTransaction and SessionClaims and SessionError from contracts
import discover and responseJson and validateIdentity from protocol
import TokenResponse and UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto and RsaJwks and signJwt and JwtError from august.crypto
import Clock from august.time
import HttpClient and urlEncode from august.web
import ExpiringStore and StoreFull from august.memory
/** Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. */
endpoint GET "/login/start" as startLogin(resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve ExpiringStore<LoginTransaction> transactions) returns HttpResponse<Html> uses crypto.random and crypto.sha256 and clock.now and client.request and transactions.put unless SessionError with status 502 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    document = discover()
    browser = crypto.random(size=32).base64url()
    state = crypto.random(size=32).base64url()
    nonce = crypto.random(size=32).base64url()
    verifier = crypto.random(size=32).base64url()
    transaction = LoginTransaction(state, nonce, verifier, expires=clock.now() + 300)
    transactions.put(key=browser, value=transaction, expires=transaction.expires, now=clock.now())
    challenge = crypto.sha256(input=verifier.bytes()).base64url()
    location = document.authorization_endpoint + "?response_type=code&client_id=" + urlEncode(input=config.clientId) + "&redirect_uri=" + urlEncode(input=config.callback) + "&scope=openid%20profile&state=" + urlEncode(input=state) + "&nonce=" + urlEncode(input=nonce) + "&code_challenge=" + urlEncode(input=challenge) + "&code_challenge_method=S256"
    headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_login", value=browser, path="/login", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=<p>Opening the identity provider.</p>, status=303, headers=headers)
}
/** Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. */
endpoint GET "/login/callback" as loginCallback(string code from query, string state from query, optional string browser from cookie "aug_login", resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve SigningKeys keys, resolve ExpiringStore<LoginTransaction> transactions, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.signRsa and crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and clock.now and client.request and keys.session and transactions.take and sessions.put unless SessionError with status 400 and CryptoError with status 503 and TimeError with status 503 and KeyError and StoreFull with status 503 and JwtError and JsonError and HttpError {
    if not code.isToken(min=43, max=43) or not state.isToken(min=43, max=43) {
        throw SessionError()
    }
    match browser {
        when null {
            throw SessionError()
        }
        when some secret {
            match transactions.take(key=secret, now=clock.now()) {
                when null {
                    throw SessionError()
                }
                when some transaction {
                    if not crypto.equal(left=transaction.state.bytes(), right=state.bytes()) {
                        throw SessionError()
                    }
                    config = settings()
                    document = discover()
                    body = "grant_type=authorization_code&code=" + urlEncode(input=code) + "&redirect_uri=" + urlEncode(input=config.callback) + "&client_id=" + urlEncode(input=config.clientId) + "&code_verifier=" + urlEncode(input=transaction.verifier)
                    headers = Headers().with(name="content-type", value="application/x-www-form-urlencoded")
                    tokens = responseJson(response=client.request(method="POST", url=document.token_endpoint, headers, body=body.bytes())).decode<TokenResponse>()
                    if tokens.token_type != "Bearer" or not tokens.access_token.isToken(min=43, max=43) or tokens.expires_in <= 0 {
                        throw SessionError()
                    }
                    jwks = responseJson(response=client.request(method="GET", url=document.jwks_uri)).decode<RsaJwks>()
                    identity = validateIdentity(token=tokens.id_token, nonce=transaction.nonce, now=clock.now(), jwks)
                    authHeaders = Headers().with(name="authorization", value="Bearer " + tokens.access_token)
                    user = responseJson(response=client.request(method="GET", url=document.userinfo_endpoint, headers=authHeaders)).decode<UserInfo>()
                    if user.sub != identity.sub {
                        throw SessionError()
                    }
                    now = clock.now()
                    session = SessionClaims(iss=config.baseUrl + "/app", sub=identity.sub, aud="august-app", exp=now + config.sessionSeconds, iat=now, jti=crypto.random(size=32).base64url(), csrf=crypto.random(size=32).base64url(), name=user.name)
                    jwt = signJwt(key=keys.session(), claims=Json(value=session), kid="session-1", tokenType="august-session+jwt")
                    sessions.put(key=session.jti, value=session, expires=session.exp, now=now)
                    responseHeaders = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value=jwt, path="/", maxAge=config.sessionSeconds, secure=config.secureCookies)
                    responseHeaders = withCookie(headers=responseHeaders, name="aug_login", value="", path="/login", maxAge=0, secure=config.secureCookies)
                    return HttpResponse(body=<p>Signed in.</p>, status=303, headers=responseHeaders)
                }
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

**[`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa)**

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random)**

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256)**

**Inputs and dependencies**

- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Available from `august.crypto`.

Immutable record. Follow the linked specification for its full explanation.

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

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Available from `august.memory`.

Interface. Follow the linked specification for its full explanation.

**[`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `StoreFull`. The caller must catch or propagate them.

**[`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

#### [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull)

Available from `august.memory`.

Class. Follow the linked specification for its full explanation.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Available from `august.time`.

Interface. Follow the linked specification for its full explanation.

**[`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)**

Result: `int`.

Capabilities: [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

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

#### [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode)

Available from `august.web`.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`LoginTransaction`](contracts.md#symbol-LoginTransaction)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `verifier`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`LoginTransaction`](contracts.md#symbol-LoginTransaction).

Field `expires`: `int`. Read-only after initialization.

Field `state`: `string`. Read-only after initialization.

Field `verifier`: `string`. Read-only after initialization.

Field `nonce`: `string`. Read-only after initialization.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `iss`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `aud`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `exp`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `iat`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `jti`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`SessionClaims`](contracts.md#symbol-SessionClaims).

Field `jti`: `string`. Read-only after initialization.

Field `exp`: `int`. Read-only after initialization.

#### [`SessionError`](contracts.md#symbol-SessionError)

Available from `contracts`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`SessionError`](contracts.md#symbol-SessionError).

#### [`discover`](protocol.md#symbol-discover)

Available from `protocol`.

**Inputs and dependencies**

- `client`: [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`Discovery`](../provider/discovery.md#symbol-Discovery).

Capabilities: [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request).

Possible failures: `SessionError`, `HttpError`. The caller must catch or propagate them.

#### [`responseJson`](protocol.md#symbol-responseJson)

Available from `protocol`.

**Inputs and dependencies**

- `response`: `HttpResponse<Bytes>`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `SessionError`. The caller must catch or propagate them.

#### [`validateIdentity`](protocol.md#symbol-validateIdentity)

Available from `protocol`.

**Inputs and dependencies**

- `token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `jwks`: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`IdClaims`](../provider/contracts.md#symbol-IdClaims).

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

Possible failures: `SessionError`. The caller must catch or propagate them.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Available from `common`.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`withCookie`](../common/headers.md#symbol-withCookie)

Available from `common`.

**Inputs and dependencies**

- `headers`: `Headers`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Available from `common`.

Interface. Follow the linked specification for its full explanation.

**[`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session)**

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session).

Possible failures: `KeyError`. The caller must catch or propagate them.

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `clientId`: `string`. Read-only after initialization.

Field `callback`: `string`. Read-only after initialization.

Field `secureCookies`: `bool`. Read-only after initialization.

Field `baseUrl`: `string`. Read-only after initialization.

Field `sessionSeconds`: `int`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

#### [`IdClaims`](../provider/contracts.md#symbol-IdClaims)

Immutable record. Follow the linked specification for its full explanation.

Field `sub`: `string`. Read-only after initialization.

#### [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse)

Available from `provider`.

Immutable record. Follow the linked specification for its full explanation.

Field `token_type`: `string`. Read-only after initialization.

Field `access_token`: `string`. Read-only after initialization.

Field `expires_in`: `int`. Read-only after initialization.

Field `id_token`: `string`. Read-only after initialization.

#### [`UserInfo`](../provider/contracts.md#symbol-UserInfo)

Available from `provider`.

Immutable record. Follow the linked specification for its full explanation.

Field `sub`: `string`. Read-only after initialization.

Field `name`: `string`. Read-only after initialization.

#### [`Discovery`](../provider/discovery.md#symbol-Discovery)

Immutable record. Follow the linked specification for its full explanation.

Field `authorization_endpoint`: `string`. Read-only after initialization.

Field `token_endpoint`: `string`. Read-only after initialization.

Field `jwks_uri`: `string`. Read-only after initialization.

Field `userinfo_endpoint`: `string`. Read-only after initialization.

### Built-in operations used by this file

#### `Bytes.base64url`

Encode immutable bytes as unpadded RFC 4648 URL-safe base64.

Result: `string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Json.decode`

Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.

Result: `UserInfo`.

Possible failures: `JsonError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.bytes`

Encode this string as immutable UTF-8 bytes.

Result: `Bytes`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.isToken`

Require an ASCII RFC 3986 unreserved token with a bounded length.

Inputs: `min`: `int`; `max`: `int`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `startLogin` {#symbol-startLogin}

[source](login.md#code)

**Inputs and dependencies**

- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `client`: [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `transactions`: [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`transactions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/login/start`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 502; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**Author documentation**

Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Set `document` to the result of call [`discover`](protocol.md#symbol-discover); supply dependencies `client` from `client`.
- Set `browser` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `state` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `nonce` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `verifier` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `transaction` to the result of call [`LoginTransaction`](contracts.md#symbol-LoginTransaction) with `state` set to `state`; `nonce` set to `nonce`; `verifier` set to `verifier`; `expires` set to (the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock` plus `300`).
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `transactions` with `key` set to `browser`; `value` set to `transaction`; `expires` set to `expires` of `transaction`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `challenge` to the result of call `base64url` on the result of call [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` set to the result of call `bytes` on `verifier`.
- Set `location` to (((((((((((`authorization_endpoint` of `document` plus `"?response_type=code&client_id="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `clientId` of `config`) plus `"&redirect_uri="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `callback` of `config`) plus `"&scope=openid%20profile&state="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `state`) plus `"&nonce="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `nonce`) plus `"&code_challenge="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `challenge`) plus `"&code_challenge_method=S256"`).
- Set `headers` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to the result of call `with` on the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` set to `"location"`; `value` set to `location`; `name` set to `"aug_login"`; `value` set to `browser`; `path` set to `"/login"`; `maxAge` set to `300`; `secure` set to `secureCookies` of `config`.
- Return the result of call `HttpResponse` with `body` set to the HTML element `p`; children: `Opening the identity provider.`. Escape embedded text; render components on the server; `status` set to `303`; `headers` set to `headers` and finish this operation.

### `loginCallback` {#symbol-loginCallback}

[source](login.md#code)

**Inputs and dependencies**

- `code`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `browser`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_login`.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `client`: [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `transactions`: [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`transactions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`sessions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/login/callback`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**Author documentation**

Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT.

**Behavior when execution reaches this operation**

- If (not (the result of call `isToken` on `code` with `min` set to `43`; `max` set to `43`) or not (the result of call `isToken` on `state` with `min` set to `43`; `max` set to `43`)) is true:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Select the matching case for `browser`:
  - A null value, including omitted optional input:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `secret`:
    - Select the matching case for the result of call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `transactions` with `key` set to `secret`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
      - A null value, including omitted optional input:
        - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - A present, non-null value, named `transaction`:
        - If not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `state` of `transaction`; `right` set to the result of call `bytes` on `state`) is true:
          - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
        - Set `document` to the result of call [`discover`](protocol.md#symbol-discover); supply dependencies `client` from `client`.
        - Set `body` to (((((((`"grant_type=authorization_code&code="` plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `code`) plus `"&redirect_uri="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `callback` of `config`) plus `"&client_id="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `clientId` of `config`) plus `"&code_verifier="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `verifier` of `transaction`).
        - Set `headers` to the result of call `with` on the result of call `Headers` with `name` set to `"content-type"`; `value` set to `"application/x-www-form-urlencoded"`.
        - Set `tokens` to the result of call `decode` on the result of call [`responseJson`](protocol.md#symbol-responseJson) with `response` set to the result of call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` set to `"POST"`; `url` set to `token_endpoint` of `document`; `headers` set to `headers`; `body` set to the result of call `bytes` on `body` with type arguments [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse).
        - If (((`token_type` of `tokens` does not equal `"Bearer"`) or not (the result of call `isToken` on `access_token` of `tokens` with `min` set to `43`; `max` set to `43`)) or (`expires_in` of `tokens` is at most `0`)) is true:
          - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `jwks` to the result of call `decode` on the result of call [`responseJson`](protocol.md#symbol-responseJson) with `response` set to the result of call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` set to `"GET"`; `url` set to `jwks_uri` of `document` with type arguments [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).
        - Set `identity` to the result of call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` set to `id_token` of `tokens`; `nonce` set to `nonce` of `transaction`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`; `jwks` set to `jwks`; supply dependencies `crypto` from `crypto`.
        - Set `authHeaders` to the result of call `with` on the result of call `Headers` with `name` set to `"authorization"`; `value` set to (`"Bearer "` plus `access_token` of `tokens`).
        - Set `user` to the result of call `decode` on the result of call [`responseJson`](protocol.md#symbol-responseJson) with `response` set to the result of call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` set to `"GET"`; `url` set to `userinfo_endpoint` of `document`; `headers` set to `authHeaders` with type arguments [`UserInfo`](../provider/contracts.md#symbol-UserInfo).
        - If (`sub` of `user` does not equal `sub` of `identity`) is true:
          - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `now` to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
        - Set `session` to the result of call [`SessionClaims`](contracts.md#symbol-SessionClaims) with `iss` set to (`baseUrl` of `config` plus `"/app"`); `sub` set to `sub` of `identity`; `aud` set to `"august-app"`; `exp` set to (`now` plus `sessionSeconds` of `config`); `iat` set to `now`; `jti` set to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`; `csrf` set to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`; `name` set to `name` of `user`.
        - Set `jwt` to the result of call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` set to the result of call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`; `claims` set to the result of call `Json` with `value` set to `session`; `kid` set to `"session-1"`; `tokenType` set to `"august-session+jwt"`; supply dependencies `crypto` from `crypto`.
        - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `sessions` with `key` set to `jti` of `session`; `value` set to `session`; `expires` set to `exp` of `session`; `now` set to `now`.
        - Set `responseHeaders` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to the result of call `with` on the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` set to `"location"`; `value` set to `"/"`; `name` set to `"aug_session"`; `value` set to `jwt`; `path` set to `"/"`; `maxAge` set to `sessionSeconds` of `config`; `secure` set to `secureCookies` of `config`.
        - Set `responseHeaders` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to `responseHeaders`; `name` set to `"aug_login"`; `value` set to `""`; `path` set to `"/login"`; `maxAge` set to `0`; `secure` set to `secureCookies` of `config`.
        - Return the result of call `HttpResponse` with `body` set to the HTML element `p`; children: `Signed in.`. Escape embedded text; render components on the server; `status` set to `303`; `headers` set to `responseHeaders` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

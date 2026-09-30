---
title: "client/login.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/login.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "login.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "login.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-startLogin"></a>
### `startLogin` · [source](login.md#code)

Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client` as [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), and `transactions` as [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<Html>`. It can use [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), and [`transactions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`.

This handles `GET` requests at `/login/start`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, [`SessionError`](contracts.md#symbol-SessionError) returns status 502, `CryptoError` returns status 503, `TimeError` returns status 503, and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). It sets `document` to the value from [`discover`](protocol.md#symbol-discover) using `client`. It sets `browser` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `state` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `nonce` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`).

It sets `verifier` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `transaction` to a new [`LoginTransaction`](contracts.md#symbol-LoginTransaction) (`state`, `nonce`, `verifier`, and `expires` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock` plus `300`). It calls [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `transactions` (`key` set to `browser`, `value` set to `transaction`, `expires` set to `transaction.expires`, and `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`).

It sets `challenge` to the unpadded URL-safe base64 encoding of the value from [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` (`input` set to the UTF-8 bytes of `verifier`). It joins these parts in order to make `location`: `document.authorization_endpoint`, `"?response_type=code&client_id="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `config.clientId`), `"&redirect_uri="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `config.callback`), `"&scope=openid%20profile&state="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `state`), `"&nonce="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `nonce`), `"&code_challenge="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `challenge`), and `"&code_challenge_method=S256"`.

It sets `headers` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to the value from `with` on the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (`name` set to `"location"` and `value` set to `location`), `name` set to `"aug_login"`, `value` set to `browser`, `path` set to `"/login"`, `maxAge` set to `300`, and `secure` set to `config.secureCookies`). It returns a new `HttpResponse` (`body` set to the HTML element `p` containing `Opening the identity provider.` (server-rendered; text escaped), `status` set to `303`, and `headers`).

<a id="symbol-loginCallback"></a>
### `loginCallback` · [source](login.md#code)

Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. The caller supplies `code` and `state` as `string` from HTTP query and `browser` as `optional string` from HTTP cookie `aug_login` (omitted means null). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client` as [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), `transactions` as [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore).

The result is `HttpResponse<Html>`. It can use [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`transactions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`sessions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, and `HttpError`. This handles `GET` requests at `/login/callback`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

For declared failures, [`SessionError`](contracts.md#symbol-SessionError) returns status 400, `CryptoError` returns status 503, `TimeError` returns status 503, and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503. If not (the value from `isToken` on `code` (`min` set to `43` and `max` set to `43`)) or not (the value from `isToken` on `state` (`min` set to `43` and `max` set to `43`)), it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

Select the first matching case for `browser`. If the selected value is null, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

If the selected value is not null, it names it `secret` and follows these steps.

Select the first matching case for the value from [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `transactions` (`key` set to `secret` and `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`). If the selected value is null, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

If the selected value is not null, it names it `transaction` and follows these steps. If not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `transaction.state` and `right` set to the UTF-8 bytes of `state`)), it fails with a new [`SessionError`](contracts.md#symbol-SessionError). It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). It sets `document` to the value from [`discover`](protocol.md#symbol-discover) using `client`.

It joins these parts in order to make `body`: `"grant_type=authorization_code&code="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `code`), `"&redirect_uri="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `config.callback`), `"&client_id="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `config.clientId`), `"&code_verifier="`, and the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `transaction.verifier`). It sets `headers` to the value from `with` on a new `Headers` (`name` set to `"content-type"` and `value` set to `"application/x-www-form-urlencoded"`).

It sets `tokens` to the value from `decode` on the value from [`responseJson`](protocol.md#symbol-responseJson) (`response` set to the value from [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` (`method` set to `"POST"`, `url` set to `document.token_endpoint`, `headers`, and `body` set to the UTF-8 bytes of `body`)) with type arguments [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse). If `tokens.token_type` does not equal `"Bearer"` or not (the value from `isToken` on `tokens.access_token` (`min` set to `43` and `max` set to `43`)) or `tokens.expires_in` is at most `0`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError).

It sets `jwks` to the value from `decode` on the value from [`responseJson`](protocol.md#symbol-responseJson) (`response` set to the value from [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` (`method` set to `"GET"` and `url` set to `document.jwks_uri`)) with type arguments [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). It sets `identity` to the value from [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token` set to `tokens.id_token`, `nonce` set to `transaction.nonce`, `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`, and `jwks`) using `crypto`.

It sets `authHeaders` to the value from `with` on a new `Headers` (`name` set to `"authorization"` and `value` set to `"Bearer "` plus `tokens.access_token`). It sets `user` to the value from `decode` on the value from [`responseJson`](protocol.md#symbol-responseJson) (`response` set to the value from [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` (`method` set to `"GET"`, `url` set to `document.userinfo_endpoint`, and `headers` set to `authHeaders`)) with type arguments [`UserInfo`](../provider/contracts.md#symbol-UserInfo). If `user.sub` does not equal `identity.sub`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError). It sets `now` to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.

It sets `session` to a new [`SessionClaims`](contracts.md#symbol-SessionClaims) (`iss` set to `config.baseUrl` plus `"/app"`, `sub` set to `identity.sub`, `aud` set to `"august-app"`, `exp` set to `now` plus `config.sessionSeconds`, `iat` set to `now`, `jti` set to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`), `csrf` set to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`), and `name` set to `user.name`).

It sets `jwt` to the value from [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key` set to the value from [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`, `claims` set to a new `Json` (`value` set to `session`), `kid` set to `"session-1"`, and `tokenType` set to `"august-session+jwt"`) using `crypto`. It calls [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `sessions` (`key` set to `session.jti`, `value` set to `session`, `expires` set to `session.exp`, and `now`).

It sets `responseHeaders` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to the value from `with` on the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (`name` set to `"location"` and `value` set to `"/"`), `name` set to `"aug_session"`, `value` set to `jwt`, `path` set to `"/"`, `maxAge` set to `config.sessionSeconds`, and `secure` set to `config.secureCookies`). It sets `responseHeaders` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to `responseHeaders`, `name` set to `"aug_login"`, `value` set to `""`, `path` set to `"/login"`, `maxAge` set to `0`, and `secure` set to `config.secureCookies`).

It returns a new `HttpResponse` (`body` set to the HTML element `p` containing `Signed in.` (server-rendered; text escaped), `status` set to `303`, and `headers` set to `responseHeaders`).

This ends the case that names `secret`.

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) takes `modulus` and `exponent` as `Bytes`. It returns `RsaPublicKey`. It can use [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`. [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) takes `size` as `int`. It returns `Bytes`. It can use [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random). It can fail with `CryptoError`. [`sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) takes `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`. [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`. The file uses [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`. [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) from `august.crypto` takes `key` as `RsaPrivateKey`, `claims` as `Json`, and `kid` and `tokenType` as `string`. It returns `string`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `JwtError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) takes `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It returns no value. It can use [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`. [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). The file uses [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.

The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. The file uses [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) from `august.web`. [`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) takes `method` and `url` as `string`, `headers` as `optional Headers` (omitted means null), and `body` as `optional Bytes` (omitted means null). It returns `HttpResponse<Bytes>`. It can use [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). It can fail with `HttpError`. [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) from `august.web` takes `input` as `string`. It returns `string`. It can fail with `HttpError`.

The file uses [`LoginTransaction`](contracts.md#symbol-LoginTransaction) from `contracts`. Construction takes `state`, `nonce`, and `verifier` as `string` and `expires` as `int`. `expires` is a read-only field of type `int`. `nonce` is a read-only field of type `string`. `state` is a read-only field of type `string`. `verifier` is a read-only field of type `string`.

The file uses [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`. Construction takes `iss`, `sub`, and `aud` as `string`, `exp` and `iat` as `int`, and `jti`, `csrf`, and `name` as `string`. `exp` is a read-only field of type `int`. `jti` is a read-only field of type `string`. The file uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. Construction takes no caller inputs. [`discover`](protocol.md#symbol-discover) from `protocol` takes no caller inputs. It returns [`Discovery`](../provider/discovery.md#symbol-Discovery). Dependency injection supplies `client` as [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). It can use [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). It can fail with `SessionError` and `HttpError`.

[`responseJson`](protocol.md#symbol-responseJson) from `protocol` takes `response` as `HttpResponse<Bytes>`. It returns `Json`. It can fail with `SessionError`. [`validateIdentity`](protocol.md#symbol-validateIdentity) from `protocol` takes `token` and `nonce` as `string`, `now` as `int`, and `jwks` as [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). It returns [`IdClaims`](../provider/contracts.md#symbol-IdClaims). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), and [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). It can fail with `SessionError`. [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`.

[`withCookie`](../common/headers.md#symbol-withCookie) from `common` takes `headers` as `Headers`, `name`, `value`, and `path` as `string`, `maxAge` as `int`, and `secure` as `bool`. It returns `Headers`. It can fail with `HttpError`. The file uses [`KeyError`](../common/keys.md#symbol-KeyError) from `common`. The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`. [`session`](../common/keys.md#symbol-SigningKeys.session) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session). It can fail with `KeyError`.

The file uses [`Settings`](../common/settings.md#symbol-Settings). `baseUrl` is a read-only field of type `string`. `callback` is a read-only field of type `string`. `clientId` is a read-only field of type `string`. `secureCookies` is a read-only field of type `bool`. `sessionSeconds` is a read-only field of type `int`. [`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings). The file uses [`IdClaims`](../provider/contracts.md#symbol-IdClaims). `sub` is a read-only field of type `string`.

The file uses [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse) from `provider`. `access_token` is a read-only field of type `string`. `expires_in` is a read-only field of type `int`. `id_token` is a read-only field of type `string`. `token_type` is a read-only field of type `string`. The file uses [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`. `name` is a read-only field of type `string`. `sub` is a read-only field of type `string`.

The file uses [`Discovery`](../provider/discovery.md#symbol-Discovery). `authorization_endpoint` is a read-only field of type `string`. `jwks_uri` is a read-only field of type `string`. `token_endpoint` is a read-only field of type `string`. `userinfo_endpoint` is a read-only field of type `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64. `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. `string.bytes`: Encode this string as immutable UTF-8 bytes. `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.

::::

:::::

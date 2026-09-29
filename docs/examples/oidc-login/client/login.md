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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`startLogin`](login.md#symbol-startLogin) handles `GET` `/login/start` returning `HttpResponse<Html>`.
- [`loginCallback`](login.md#symbol-loginCallback) handles `GET` `/login/callback` returning `HttpResponse<Html>`.

### `startLogin` {#symbol-startLogin}

[source](login.md#code)

**Inputs**

- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)) — injected; callers omit it.
- `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`transactions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/login/start`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 502; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Set `document` to call [`discover`](protocol.md#symbol-discover); inject `client` from `client`.
- Set `browser` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `state` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `nonce` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `verifier` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `transaction` to call [`LoginTransaction`](contracts.md#symbol-LoginTransaction) with `state` = `state`; `nonce` = `nonce`; `verifier` = `verifier`; `expires` = (call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock` plus `300`).
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `transactions` with `key` = `browser`; `value` = `transaction`; `expires` = `expires` of `transaction`; `now` = call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `challenge` to call `base64url` on call [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` = call `bytes` on `verifier`.
- Build `location` by joining these text parts without separators, in order:
  1. `authorization_endpoint` of `document`
  2. `"?response_type=code&client_id="`
  3. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `clientId` of `config`
  4. `"&redirect_uri="`
  5. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `callback` of `config`
  6. `"&scope=openid%20profile&state="`
  7. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `state`
  8. `"&nonce="`
  9. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `nonce`
  10. `"&code_challenge="`
  11. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `challenge`
  12. `"&code_challenge_method=S256"`
- Set `headers` to call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` = call `with` on call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` = `"location"`; `value` = `location`; `name` = `"aug_login"`; `value` = `browser`; `path` = `"/login"`; `maxAge` = `300`; `secure` = `secureCookies` of `config`.
- Return call `HttpResponse` with `body` = the HTML element `p` containing `Opening the identity provider.` (rendered on the server with embedded text escaped); `status` = `303`; `headers` = `headers`.

**Author documentation**

Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server.

### `loginCallback` {#symbol-loginCallback}

[source](login.md#code)

**Inputs**

- `code` (`string`) — read from the HTTP query.
- `state` (`string`) — read from the HTTP query.
- `browser` (`optional string`) — read from the HTTP cookie named `aug_login`; absent value becomes null.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.
- `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.
- `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`transactions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`sessions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/login/callback`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**What it does**

- If not (call `isToken` on `code` with `min` = `43`; `max` = `43`) or not (call `isToken` on `state` with `min` = `43`; `max` = `43`):
  - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Select the matching case for `browser`:
  - A null value, including omitted optional input:
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `secret`:
    - Select the matching case for call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `transactions` with `key` = `secret`; `now` = call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
      - A null value, including omitted optional input:
        - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - A present, non-null value, named `transaction`:
        - If not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `state` of `transaction`; `right` = call `bytes` on `state`):
          - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `config` to call [`settings`](../common/settings.md#symbol-settings).
        - Set `document` to call [`discover`](protocol.md#symbol-discover); inject `client` from `client`.
        - Build `body` by joining these text parts without separators, in order:
          1. `"grant_type=authorization_code&code="`
          2. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `code`
          3. `"&redirect_uri="`
          4. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `callback` of `config`
          5. `"&client_id="`
          6. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `clientId` of `config`
          7. `"&code_verifier="`
          8. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `verifier` of `transaction`
        - Set `headers` to call `with` on call `Headers` with `name` = `"content-type"`; `value` = `"application/x-www-form-urlencoded"`.
        - Set `tokens` to call `decode` on call [`responseJson`](protocol.md#symbol-responseJson) with `response` = call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` = `"POST"`; `url` = `token_endpoint` of `document`; `headers` = `headers`; `body` = call `bytes` on `body` with type arguments [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse).
        - If ((`token_type` of `tokens` does not equal `"Bearer"`) or not (call `isToken` on `access_token` of `tokens` with `min` = `43`; `max` = `43`)) or (`expires_in` of `tokens` is at most `0`):
          - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `jwks` to call `decode` on call [`responseJson`](protocol.md#symbol-responseJson) with `response` = call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` = `"GET"`; `url` = `jwks_uri` of `document` with type arguments [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).
        - Set `identity` to call [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` = `id_token` of `tokens`; `nonce` = `nonce` of `transaction`; `now` = call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`; `jwks` = `jwks`; inject `crypto` from `crypto`.
        - Set `authHeaders` to call `with` on call `Headers` with `name` = `"authorization"`; `value` = (`"Bearer "` plus `access_token` of `tokens`).
        - Set `user` to call `decode` on call [`responseJson`](protocol.md#symbol-responseJson) with `response` = call [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` = `"GET"`; `url` = `userinfo_endpoint` of `document`; `headers` = `authHeaders` with type arguments [`UserInfo`](../provider/contracts.md#symbol-UserInfo).
        - If `sub` of `user` does not equal `sub` of `identity`:
          - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - Set `now` to call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
        - Set `session` to call [`SessionClaims`](contracts.md#symbol-SessionClaims) with `iss` = (`baseUrl` of `config` plus `"/app"`); `sub` = `sub` of `identity`; `aud` = `"august-app"`; `exp` = (`now` plus `sessionSeconds` of `config`); `iat` = `now`; `jti` = call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`; `csrf` = call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`; `name` = `name` of `user`.
        - Set `jwt` to call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` = call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`; `claims` = call `Json` with `value` = `session`; `kid` = `"session-1"`; `tokenType` = `"august-session+jwt"`; inject `crypto` from `crypto`.
        - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `sessions` with `key` = `jti` of `session`; `value` = `session`; `expires` = `exp` of `session`; `now` = `now`.
        - Set `responseHeaders` to call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` = call `with` on call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` = `"location"`; `value` = `"/"`; `name` = `"aug_session"`; `value` = `jwt`; `path` = `"/"`; `maxAge` = `sessionSeconds` of `config`; `secure` = `secureCookies` of `config`.
        - Set `responseHeaders` to call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` = `responseHeaders`; `name` = `"aug_login"`; `value` = `""`; `path` = `"/login"`; `maxAge` = `0`; `secure` = `secureCookies` of `config`.
        - Return call `HttpResponse` with `body` = the HTML element `p` containing `Signed in.` (rendered on the server with embedded text escaped); `status` = `303`; `headers` = `responseHeaders`.

**Author documentation**

Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) (`input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Class from `august.crypto`.

Used as a type or provider.

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Record from `august.crypto`.

Used as a type or provider.

#### [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt)

Function from `august.crypto`.

- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa); can fail with `JwtError`.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Capability interface from `august.memory`.

- [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) (`key`: `string`, `value`: `T`, `expires`: `int`, `now`: `int`) → `void`; can fail with `StoreFull`.
- [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.

#### [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull)

Class from `august.memory`.

Used as a type or provider.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Capability interface from `august.time`.

- [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.

#### [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)

Capability interface from `august.web`.

- [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) (`method`: `string`, `url`: `string`, `headers`: `optional Headers`, `body`: `optional Bytes`) → `HttpResponse<Bytes>`; can fail with `HttpError`.

#### [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode)

Function from `august.web`.

- [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input`: `string`) → `string`; can fail with `HttpError`.

#### [`LoginTransaction`](contracts.md#symbol-LoginTransaction)

Record from `contracts`.

- Construct with `state`: `string`, `nonce`: `string`, `verifier`: `string`, `expires`: `int` → [`LoginTransaction`](contracts.md#symbol-LoginTransaction).
- Read `expires` (`int`).
- Read `nonce` (`string`).
- Read `state` (`string`).
- Read `verifier` (`string`).

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Record from `contracts`.

- Construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `jti`: `string`, `csrf`: `string`, `name`: `string` → [`SessionClaims`](contracts.md#symbol-SessionClaims).
- Read `exp` (`int`).
- Read `jti` (`string`).

#### [`SessionError`](contracts.md#symbol-SessionError)

Class from `contracts`.

- Construct with no caller inputs → [`SessionError`](contracts.md#symbol-SessionError).

#### [`discover`](protocol.md#symbol-discover)

Function from `protocol`.

- [`discover`](protocol.md#symbol-discover) (no caller inputs) → [`Discovery`](../provider/discovery.md#symbol-Discovery); inject `client`: [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient); uses [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request); can fail with `SessionError`, `HttpError`.

#### [`responseJson`](protocol.md#symbol-responseJson)

Function from `protocol`.

- [`responseJson`](protocol.md#symbol-responseJson) (`response`: `HttpResponse<Bytes>`) → `Json`; can fail with `SessionError`.

#### [`validateIdentity`](protocol.md#symbol-validateIdentity)

Function from `protocol`.

- [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token`: `string`, `nonce`: `string`, `now`: `int`, `jwks`: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)) → [`IdClaims`](../provider/contracts.md#symbol-IdClaims); inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal); can fail with `SessionError`.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Function from `common`.

- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError`.

#### [`withCookie`](../common/headers.md#symbol-withCookie)

Function from `common`.

- [`withCookie`](../common/headers.md#symbol-withCookie) (`headers`: `Headers`, `name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError`.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Capability interface from `common`.

- [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `baseUrl` (`string`).
- Read `callback` (`string`).
- Read `clientId` (`string`).
- Read `secureCookies` (`bool`).
- Read `sessionSeconds` (`int`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

#### [`IdClaims`](../provider/contracts.md#symbol-IdClaims)

Record.

- Read `sub` (`string`).

#### [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse)

Record from `provider`.

- Read `access_token` (`string`).
- Read `expires_in` (`int`).
- Read `id_token` (`string`).
- Read `token_type` (`string`).

#### [`UserInfo`](../provider/contracts.md#symbol-UserInfo)

Record from `provider`.

- Read `name` (`string`).
- Read `sub` (`string`).

#### [`Discovery`](../provider/discovery.md#symbol-Discovery)

Record.

- Read `authorization_endpoint` (`string`).
- Read `jwks_uri` (`string`).
- Read `token_endpoint` (`string`).
- Read `userinfo_endpoint` (`string`).

### Built-in operations used by this file

- `Bytes.base64url` (no inputs) → `string`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Headers.with` (`name`: `string`, `value`: `string`) → `Headers`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. Can fail with `HttpError`.
- `Json.decode` (no inputs) → `UserInfo`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. Can fail with `JsonError`.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken` (`min`: `int`, `max`: `int`) → `bool`: Require an ASCII RFC 3986 unreserved token with a bounded length.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

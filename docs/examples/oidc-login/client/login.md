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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-startLogin"></a>
### `startLogin` · [source](login.md#code)

Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server.

**Inputs:** Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) as `client`. Resolve [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `transactions`.

Returns `HttpResponse<Html>`. Uses [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`transactions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). Can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

HTTP route: `GET` `/login/start`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 502; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Set `document` to the result of [`discover`](protocol.md#symbol-discover) using `client`.
- Set `browser` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `state` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `nonce` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `verifier` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `transaction` to a new [`LoginTransaction`](contracts.md#symbol-LoginTransaction) with `state`, `nonce`, `verifier`, `expires` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock` plus `300`.
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `transactions` with `key` as `browser`, `value` as `transaction`, `expires` as `expires` of `transaction`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `challenge` to the result of `base64url` on the result of [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` as the result of `bytes` on `verifier`.
- Join these parts in order to make `location`:
  1. `authorization_endpoint` of `document`
  2. `"?response_type=code&client_id="`
  3. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `clientId` of `config`
  4. `"&redirect_uri="`
  5. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `callback` of `config`
  6. `"&scope=openid%20profile&state="`
  7. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `state`
  8. `"&nonce="`
  9. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `nonce`
  10. `"&code_challenge="`
  11. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `challenge`
  12. `"&code_challenge_method=S256"`
- Set `headers` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as the result of `with` on the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` as `"location"`, `value` as `location`, `name` as `"aug_login"`, `value` as `browser`, `path` as `"/login"`, `maxAge` as `300`, `secure` as `secureCookies` of `config`.
- Return a new `HttpResponse` with `body` as the HTML element `p` containing `Opening the identity provider.` (server-rendered; text escaped), `status` as `303`, `headers`.

<a id="symbol-loginCallback"></a>
### `loginCallback` · [source](login.md#code)

Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT.

**Inputs:** Take `code` (`string`) from HTTP query. Take `state` (`string`) from HTTP query. Take `browser` (`optional string`) from HTTP cookie `aug_login`; omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) as `client`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `transactions`. Resolve [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `sessions`.

Returns `HttpResponse<Html>`. Uses [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`transactions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`sessions.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). Can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError`.

HTTP route: `GET` `/login/callback`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

- If not (the result of `isToken` on `code` with `min` as `43`, `max` as `43`) or not (the result of `isToken` on `state` with `min` as `43`, `max` as `43`):
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Match `browser`:
  - A null value, including omitted optional input:
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - A present, non-null value, named `secret`:
    - Match the result of [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `transactions` with `key` as `secret`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
      - A null value, including omitted optional input:
        - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
      - A present, non-null value, named `transaction`:
        - If not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `state` of `transaction`, `right` as the result of `bytes` on `state`):
          - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
        - Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
        - Set `document` to the result of [`discover`](protocol.md#symbol-discover) using `client`.
        - Join these parts in order to make `body`:
          1. `"grant_type=authorization_code&code="`
          2. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `code`
          3. `"&redirect_uri="`
          4. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `callback` of `config`
          5. `"&client_id="`
          6. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `clientId` of `config`
          7. `"&code_verifier="`
          8. the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `verifier` of `transaction`
        - Set `headers` to the result of `with` on a new `Headers` with `name` as `"content-type"`, `value` as `"application/x-www-form-urlencoded"`.
        - Set `tokens` to the result of `decode` on the result of [`responseJson`](protocol.md#symbol-responseJson) with `response` as the result of [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` as `"POST"`, `url` as `token_endpoint` of `document`, `headers`, `body` as the result of `bytes` on `body` with type arguments [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse).
        - If ((`token_type` of `tokens` does not equal `"Bearer"`) or not (the result of `isToken` on `access_token` of `tokens` with `min` as `43`, `max` as `43`)) or (`expires_in` of `tokens` is at most `0`):
          - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
        - Set `jwks` to the result of `decode` on the result of [`responseJson`](protocol.md#symbol-responseJson) with `response` as the result of [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` as `"GET"`, `url` as `jwks_uri` of `document` with type arguments [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).
        - Set `identity` to the result of [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` as `id_token` of `tokens`, `nonce` as `nonce` of `transaction`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`, `jwks` using `crypto`.
        - Set `authHeaders` to the result of `with` on a new `Headers` with `name` as `"authorization"`, `value` as `"Bearer "` plus `access_token` of `tokens`.
        - Set `user` to the result of `decode` on the result of [`responseJson`](protocol.md#symbol-responseJson) with `response` as the result of [`HttpClient.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) on `client` with `method` as `"GET"`, `url` as `userinfo_endpoint` of `document`, `headers` as `authHeaders` with type arguments [`UserInfo`](../provider/contracts.md#symbol-UserInfo).
        - If `sub` of `user` does not equal `sub` of `identity`:
          - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
        - Set `now` to the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
        - Set `session` to a new [`SessionClaims`](contracts.md#symbol-SessionClaims) with `iss` as `baseUrl` of `config` plus `"/app"`, `sub` as `sub` of `identity`, `aud` as `"august-app"`, `exp` as `now` plus `sessionSeconds` of `config`, `iat` as `now`, `jti` as the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`, `csrf` as the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`, `name` as `name` of `user`.
        - Set `jwt` to the result of [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` as the result of [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`, `claims` as a new `Json` with `value` as `session`, `kid` as `"session-1"`, `tokenType` as `"august-session+jwt"` using `crypto`.
        - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `sessions` with `key` as `jti` of `session`, `value` as `session`, `expires` as `exp` of `session`, `now`.
        - Set `responseHeaders` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as the result of `with` on the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` as `"location"`, `value` as `"/"`, `name` as `"aug_session"`, `value` as `jwt`, `path` as `"/"`, `maxAge` as `sessionSeconds` of `config`, `secure` as `secureCookies` of `config`.
        - Set `responseHeaders` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as `responseHeaders`, `name` as `"aug_login"`, `value` as `""`, `path` as `"/login"`, `maxAge` as `0`, `secure` as `secureCookies` of `config`.
        - Return a new `HttpResponse` with `body` as the HTML element `p` containing `Signed in.` (server-rendered; text escaped), `status` as `303`, `headers` as `responseHeaders`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) (`modulus`: `Bytes`, `exponent`: `Bytes`) → `RsaPublicKey`; can fail with `CryptoError`; [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`; [`sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) (`input`: `Bytes`) → `Bytes`; can fail with `CryptoError`; [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`; [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`.
- [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`.
- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; can fail with `JwtError` from `august.crypto`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) (`key`: `string`, `value`: `T`, `expires`: `int`, `now`: `int`) → `void`; can fail with `StoreFull`; [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.
- [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) from `august.web`: [`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) (`method`: `string`, `url`: `string`, `headers`: `optional Headers`, `body`: `optional Bytes`) → `HttpResponse<Bytes>`; can fail with `HttpError`.
- [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input`: `string`) → `string`; can fail with `HttpError` from `august.web`.
- [`LoginTransaction`](contracts.md#symbol-LoginTransaction) from `contracts`: construct with `state`: `string`, `nonce`: `string`, `verifier`: `string`, `expires`: `int`; read `expires` (`int`); read `nonce` (`string`); read `state` (`string`); read `verifier` (`string`).
- [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`: construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `jti`: `string`, `csrf`: `string`, `name`: `string`; read `exp` (`int`); read `jti` (`string`).
- [`SessionError`](contracts.md#symbol-SessionError) from `contracts`: construct with no caller inputs.
- [`discover`](protocol.md#symbol-discover) (no caller inputs) → [`Discovery`](../provider/discovery.md#symbol-Discovery); can fail with `SessionError`, `HttpError` from `protocol`.
- [`responseJson`](protocol.md#symbol-responseJson) (`response`: `HttpResponse<Bytes>`) → `Json`; can fail with `SessionError` from `protocol`.
- [`validateIdentity`](protocol.md#symbol-validateIdentity) (`token`: `string`, `nonce`: `string`, `now`: `int`, `jwks`: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)) → [`IdClaims`](../provider/contracts.md#symbol-IdClaims); can fail with `SessionError` from `protocol`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`withCookie`](../common/headers.md#symbol-withCookie) (`headers`: `Headers`, `name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError` from `common`.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`Settings`](../common/settings.md#symbol-Settings): read `baseUrl` (`string`); read `callback` (`string`); read `clientId` (`string`); read `secureCookies` (`bool`); read `sessionSeconds` (`int`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.
- [`IdClaims`](../provider/contracts.md#symbol-IdClaims): read `sub` (`string`).
- [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse) from `provider`: read `access_token` (`string`); read `expires_in` (`int`); read `id_token` (`string`); read `token_type` (`string`).
- [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`: read `name` (`string`); read `sub` (`string`).
- [`Discovery`](../provider/discovery.md#symbol-Discovery): read `authorization_endpoint` (`string`); read `jwks_uri` (`string`); read `token_endpoint` (`string`); read `userinfo_endpoint` (`string`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.
- `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.

::::

:::::

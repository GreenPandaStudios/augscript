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

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

<a id="symbol-startLogin"></a>
### `startLogin` · [source](login.md#code)

`startLogin` handles `GET /login/start`. Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)), and `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection.

The handler responds with HTTP 502 for [`SessionError`](contracts.md#symbol-SessionError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull). It can also raise `HttpError`.

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It gets `document` from [`discover`](protocol.md#symbol-discover) using injected `client`. It sets `browser`, `state`, `nonce`, and `verifier` separately, each to the URL-safe base64 encoding of `32` random bytes from `crypto`. It sets `transaction` to a [`LoginTransaction`](contracts.md#symbol-LoginTransaction) with `state`, `nonce`, `verifier`, and `expires` from the current time from `clock` plus `300`.

It stores `transaction` in `transactions` under `browser`, expiring at `transaction.expires`. The current time for this write is the current time from `clock`. It sets `challenge` to the URL-safe base64 encoding of [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) with `input` from the UTF-8 bytes of `verifier`. It builds `location` as the text `{document.authorization_endpoint}?response_type=code&client_id={URL-encoded config.clientId}&redirect_uri={URL-encoded config.callback}&scope=openid%20profile&state={URL-encoded state}&nonce={URL-encoded nonce}&code_challenge={URL-encoded challenge}&code_challenge_method=S256`.

It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `location`, `name` `"aug_login"`, `value` from `browser`, `path` `"/login"`, `maxAge` `300`, and `secure` from `config.secureCookies`. It returns HTTP 303 with a paragraph containing `Opening the identity provider.` with escaped text and `headers` headers.

<a id="symbol-loginCallback"></a>
### `loginCallback` · [source](login.md#code)

`loginCallback` handles `GET /login/callback`. Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT.

It takes `code` and `state` as strings from the HTTP query and `browser` as `optional string` from the HTTP cookie `aug_login`. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `client` ([`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. The handler responds with HTTP 400 for [`SessionError`](contracts.md#symbol-SessionError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull).

It can also raise `KeyError`, `JwtError`, `JsonError`, and `HttpError`.

It checks that `code` is a URL-safe ASCII token with `43` to `43` characters and `state` is a URL-safe ASCII token with `43` to `43` characters. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. If `browser` is null, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null `browser` becomes `secret`.

It obtains the live value removed from `transactions` under `secret`, using the current time from `clock` as the current time. If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null result becomes `transaction`.

It checks that the UTF-8 bytes of `transaction.state` and the UTF-8 bytes of `state` match when compared by `crypto`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It gets `document` from [`discover`](protocol.md#symbol-discover) using injected `client`.

It builds `body` as the text `grant_type=authorization_code&code={URL-encoded code}&redirect_uri={URL-encoded config.callback}&client_id={URL-encoded config.clientId}&code_verifier={URL-encoded transaction.verifier}`. It sets `headers` to a `Headers` with the header `"content-type"` set to `"application/x-www-form-urlencoded"`. It sets `tokens` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) with `method` `"POST"`, `url` from `document.token_endpoint`, `headers`, and `body` from the UTF-8 bytes of `body` for [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse).

It checks that `tokens.token_type` equals `"Bearer"` and `tokens.access_token` is a URL-safe ASCII token with `43` to `43` characters and `tokens.expires_in` is greater than `0`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `jwks` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) with `method` `"GET"` and `url` from `document.jwks_uri` for [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). It sets `identity` to [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` from `tokens.id_token`, `transaction.nonce`, `now` from the current time from `clock`, and `jwks` using injected `crypto`.

It sets `authHeaders` to a `Headers` with the header `"authorization"` set to the text `Bearer {tokens.access_token}`. It sets `user` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) with `method` `"GET"`, `url` from `document.userinfo_endpoint`, and `headers` from `authHeaders` for [`UserInfo`](../provider/contracts.md#symbol-UserInfo). It checks that `user.sub` equals `identity.sub`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check.

It sets `now` to the current time from `clock`. It sets `session` to a [`SessionClaims`](contracts.md#symbol-SessionClaims) with `iss` from the text `{config.baseUrl}/app`, `identity.sub`, `aud` `"august-app"`, `exp` from `now` plus `config.sessionSeconds`, `iat` from `now`, `jti` from the URL-safe base64 encoding of `32` random bytes from `crypto`, `csrf` from the URL-safe base64 encoding of `32` random bytes from `crypto`, and `user.name`. It sets `jwt` to [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` from [`keys.session`](../common/keys.md#symbol-SigningKeys.session), `claims` from a `Json` with `value` from `session`, `kid` `"session-1"`, and `tokenType` `"august-session+jwt"` using injected `crypto`.

It stores `session` in `sessions` under `session.jti`, expiring at `session.exp`. The current time for this write is `now`. It sets `responseHeaders` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `"/"`, `name` `"aug_session"`, `value` from `jwt`, `path` `"/"`, `maxAge` from `config.sessionSeconds`, and `secure` from `config.secureCookies`. It sets `responseHeaders` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from `responseHeaders`, `name` `"aug_login"`, `value` `""`, `path` `"/login"`, `maxAge` `0`, and `secure` from `config.secureCookies`.

It returns HTTP 303 with a paragraph containing `Signed in.` with escaped text and `responseHeaders` headers.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`importRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), and [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)), [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks), and [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) from `august.crypto`. It uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) ([`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) and [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)) and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`. It uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) ([`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)) from `august.time`. It uses [`HttpClient`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) ([`request`](../dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request)) and [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) from `august.web`.

It uses [`LoginTransaction`](contracts.md#symbol-LoginTransaction) (`expires`, `nonce`, `state`, and `verifier`), [`SessionClaims`](contracts.md#symbol-SessionClaims) (`exp` and `jti`), and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. It uses [`discover`](protocol.md#symbol-discover), [`responseJson`](protocol.md#symbol-responseJson), and [`validateIdentity`](protocol.md#symbol-validateIdentity) from `protocol`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl`, `callback`, `clientId`, `secureCookies`, and `sessionSeconds`), [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`sub`), and [`Discovery`](../provider/discovery.md#symbol-Discovery) (`authorization_endpoint`, `jwks_uri`, `token_endpoint`, and `userinfo_endpoint`).

It uses [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse) (`access_token`, `expires_in`, `id_token`, and `token_type`) and [`UserInfo`](../provider/contracts.md#symbol-UserInfo) (`name` and `sub`) from `provider`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

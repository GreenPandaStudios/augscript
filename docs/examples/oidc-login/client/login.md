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
import Crypto and RsaJwks and signJwt and JwtError from crypto
import Clock from time
import HttpClient and urlEncode from web
import ExpiringStore and StoreFull from memory
/** Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. */
endpoint GET "/login/start" as startLogin(resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve ExpiringStore<LoginTransaction> transactions) unless SessionError with status 502 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    document = discover()
    browser = crypto.random(size=32).base64url()
    state = crypto.random(size=32).base64url()
    nonce = crypto.random(size=32).base64url()
    verifier = crypto.random(size=32).base64url()
    transaction = LoginTransaction(state, nonce, verifier, expires=clock.now() + 300)
    transactions.put(
        key=browser,
        value=transaction,
        expires=transaction.expires,
        now=clock.now()
    )
    challenge = crypto.sha256(input=verifier.bytes()).base64url()
    location = document.authorization_endpoint + "?response_type=code&client_id=" + urlEncode(input=config.clientId) + "&redirect_uri=" + urlEncode(input=config.callback) + "&scope=openid%20profile&state=" + urlEncode(input=state) + "&nonce=" + urlEncode(input=nonce) + "&code_challenge=" + urlEncode(input=challenge) + "&code_challenge_method=S256"
    headers = withCookie(
        headers=securityHeaders().with(name="location", value=location),
        name="aug_login",
        value=browser,
        path="/login",
        maxAge=300,
        secure=config.secureCookies
    )
    return HttpResponse(
        body=<p>Opening the identity provider.</p>,
        status=303,
        headers=headers
    )
/** Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. */
endpoint GET "/login/callback" as loginCallback(string code from query, string state from query, optional string browser from cookie "aug_login", resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve SigningKeys keys, resolve ExpiringStore<LoginTransaction> transactions, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 400 and CryptoError with status 503 and TimeError with status 503 and KeyError and StoreFull with status 503 and JwtError and JsonError and HttpError:
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
                    if not crypto.equal(
                        left=transaction.state.bytes(),
                        right=state.bytes()
                    ):
                        throw SessionError()
                    config = settings()
                    document = discover()
                    body = "grant_type=authorization_code&code=" + urlEncode(input=code) + "&redirect_uri=" + urlEncode(input=config.callback) + "&client_id=" + urlEncode(input=config.clientId) + "&code_verifier=" + urlEncode(input=transaction.verifier)
                    headers = Headers().with(
                        name="content-type",
                        value="application/x-www-form-urlencoded"
                    )
                    tokens = responseJson(
                        response=client.request(
                            method="POST",
                            url=document.token_endpoint,
                            headers,
                            body=body.bytes()
                        )
                    ).decode<TokenResponse>()
                    if tokens.token_type != "Bearer" or not tokens.access_token.isToken(min=43, max=43) or tokens.expires_in <= 0:
                        throw SessionError()
                    jwks = responseJson(
                        response=client.request(method="GET", url=document.jwks_uri)
                    ).decode<RsaJwks>()
                    identity = validateIdentity(
                        token=tokens.id_token,
                        nonce=transaction.nonce,
                        now=clock.now(),
                        jwks
                    )
                    authHeaders = Headers().with(
                        name="authorization",
                        value="Bearer " + tokens.access_token
                    )
                    user = responseJson(
                        response=client.request(
                            method="GET",
                            url=document.userinfo_endpoint,
                            headers=authHeaders
                        )
                    ).decode<UserInfo>()
                    if user.sub != identity.sub:
                        throw SessionError()
                    now = clock.now()
                    session = SessionClaims(
                        iss=config.baseUrl + "/app",
                        sub=identity.sub,
                        aud="august-app",
                        exp=now + config.sessionSeconds,
                        iat=now,
                        jti=crypto.random(size=32).base64url(),
                        csrf=crypto.random(size=32).base64url(),
                        name=user.name
                    )
                    jwt = signJwt(
                        key=keys.session(),
                        claims=Json(value=session),
                        kid="session-1",
                        tokenType="august-session+jwt"
                    )
                    sessions.put(
                        key=session.jti,
                        value=session,
                        expires=session.exp,
                        now=now
                    )
                    responseHeaders = withCookie(
                        headers=securityHeaders().with(name="location", value="/"),
                        name="aug_session",
                        value=jwt,
                        path="/",
                        maxAge=config.sessionSeconds,
                        secure=config.secureCookies
                    )
                    responseHeaders = withCookie(
                        headers=responseHeaders,
                        name="aug_login",
                        value="",
                        path="/login",
                        maxAge=0,
                        secure=config.secureCookies
                    )
                    return HttpResponse(
                        body=<p>Signed in.</p>,
                        status=303,
                        headers=responseHeaders
                    )
```

```aug [Braces]
// aug-spec: "login.aug.md" explains this file. Read it before changes; refresh with aug spec.
import LoginTransaction and SessionClaims and SessionError from contracts
import discover and responseJson and validateIdentity from protocol
import TokenResponse and UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto and RsaJwks and signJwt and JwtError from crypto
import Clock from time
import HttpClient and urlEncode from web
import ExpiringStore and StoreFull from memory
/** Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. */
endpoint GET "/login/start" as startLogin(resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve ExpiringStore<LoginTransaction> transactions) unless SessionError with status 502 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    document = discover()
    browser = crypto.random(size=32).base64url()
    state = crypto.random(size=32).base64url()
    nonce = crypto.random(size=32).base64url()
    verifier = crypto.random(size=32).base64url()
    transaction = LoginTransaction(state, nonce, verifier, expires=clock.now() + 300)
    transactions.put(
        key=browser,
        value=transaction,
        expires=transaction.expires,
        now=clock.now()
    )
    challenge = crypto.sha256(input=verifier.bytes()).base64url()
    location = document.authorization_endpoint + "?response_type=code&client_id=" + urlEncode(input=config.clientId) + "&redirect_uri=" + urlEncode(input=config.callback) + "&scope=openid%20profile&state=" + urlEncode(input=state) + "&nonce=" + urlEncode(input=nonce) + "&code_challenge=" + urlEncode(input=challenge) + "&code_challenge_method=S256"
    headers = withCookie(
        headers=securityHeaders().with(name="location", value=location),
        name="aug_login",
        value=browser,
        path="/login",
        maxAge=300,
        secure=config.secureCookies
    )
    return HttpResponse(
        body=<p>Opening the identity provider.</p>,
        status=303,
        headers=headers
    )
}
/** Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. */
endpoint GET "/login/callback" as loginCallback(string code from query, string state from query, optional string browser from cookie "aug_login", resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve SigningKeys keys, resolve ExpiringStore<LoginTransaction> transactions, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 400 and CryptoError with status 503 and TimeError with status 503 and KeyError and StoreFull with status 503 and JwtError and JsonError and HttpError {
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
                    if not crypto.equal(
                        left=transaction.state.bytes(),
                        right=state.bytes()
                    ) {
                        throw SessionError()
                    }
                    config = settings()
                    document = discover()
                    body = "grant_type=authorization_code&code=" + urlEncode(input=code) + "&redirect_uri=" + urlEncode(input=config.callback) + "&client_id=" + urlEncode(input=config.clientId) + "&code_verifier=" + urlEncode(input=transaction.verifier)
                    headers = Headers().with(
                        name="content-type",
                        value="application/x-www-form-urlencoded"
                    )
                    tokens = responseJson(
                        response=client.request(
                            method="POST",
                            url=document.token_endpoint,
                            headers,
                            body=body.bytes()
                        )
                    ).decode<TokenResponse>()
                    if tokens.token_type != "Bearer" or not tokens.access_token.isToken(min=43, max=43) or tokens.expires_in <= 0 {
                        throw SessionError()
                    }
                    jwks = responseJson(
                        response=client.request(method="GET", url=document.jwks_uri)
                    ).decode<RsaJwks>()
                    identity = validateIdentity(
                        token=tokens.id_token,
                        nonce=transaction.nonce,
                        now=clock.now(),
                        jwks
                    )
                    authHeaders = Headers().with(
                        name="authorization",
                        value="Bearer " + tokens.access_token
                    )
                    user = responseJson(
                        response=client.request(
                            method="GET",
                            url=document.userinfo_endpoint,
                            headers=authHeaders
                        )
                    ).decode<UserInfo>()
                    if user.sub != identity.sub {
                        throw SessionError()
                    }
                    now = clock.now()
                    session = SessionClaims(
                        iss=config.baseUrl + "/app",
                        sub=identity.sub,
                        aud="august-app",
                        exp=now + config.sessionSeconds,
                        iat=now,
                        jti=crypto.random(size=32).base64url(),
                        csrf=crypto.random(size=32).base64url(),
                        name=user.name
                    )
                    jwt = signJwt(
                        key=keys.session(),
                        claims=Json(value=session),
                        kid="session-1",
                        tokenType="august-session+jwt"
                    )
                    sessions.put(
                        key=session.jti,
                        value=session,
                        expires=session.exp,
                        now=now
                    )
                    responseHeaders = withCookie(
                        headers=securityHeaders().with(name="location", value="/"),
                        name="aug_session",
                        value=jwt,
                        path="/",
                        maxAge=config.sessionSeconds,
                        secure=config.secureCookies
                    )
                    responseHeaders = withCookie(
                        headers=responseHeaders,
                        name="aug_login",
                        value="",
                        path="/login",
                        maxAge=0,
                        secure=config.secureCookies
                    )
                    return HttpResponse(
                        body=<p>Signed in.</p>,
                        status=303,
                        headers=responseHeaders
                    )
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

### `startLogin` · [source](login.md#code) {#symbol-startLogin}

`startLogin` handles `GET /login/start`. Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `client` ([`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient)), and `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection.

The handler responds with HTTP 502 for [`SessionError`](contracts.md#symbol-SessionError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`.

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It gets `document` from [`discover`](protocol.md#symbol-discover) using injected `client`. It sets `browser`, `state`, `nonce`, and `verifier` separately, each to the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`. It sets `transaction` to a [`LoginTransaction`](contracts.md#symbol-LoginTransaction) with `state`, `nonce`, `verifier`, and `expires` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) plus `300`.

It calls [`transactions.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) with `key` from `browser`, `value` from `transaction`, `transaction.expires`, and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It sets `challenge` to the URL-safe base64 encoding of [`crypto.sha256`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.sha256) with `input` from the UTF-8 bytes of `verifier`. It builds `location` as the text `{document.authorization_endpoint}?response_type=code&client_id={urlEncode with input from config.clientId}&redirect_uri={urlEncode with input from config.callback}&scope=openid%20profile&state={urlEncode with input from state}&nonce={urlEncode with input from nonce}&code_challenge={urlEncode with input from challenge}&code_challenge_method=S256`. It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `location`, `name` `"aug_login"`, `value` from `browser`, `path` `"/login"`, `maxAge` `300`, and `secure` from `config.secureCookies`.

It returns HTTP 303 with a paragraph containing `Opening the identity provider.` with escaped text and `headers` headers.

### `loginCallback` · [source](login.md#code) {#symbol-loginCallback}

`loginCallback` handles `GET /login/callback`. Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT.

It takes `code` and `state` as strings from the HTTP query and `browser` as `optional string` from the HTTP cookie `aug_login`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `client` ([`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), `transactions` ([`ExpiringStore<LoginTransaction>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. The handler responds with HTTP 400 for [`SessionError`](contracts.md#symbol-SessionError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull).

It can also raise `HttpError`, `JsonError`, `JwtError`, and `KeyError`.

It checks that `code` is a URL-safe ASCII token with `43` to `43` characters and `state` is a URL-safe ASCII token with `43` to `43` characters. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. If `browser` is null, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null `browser` becomes `secret`.

It obtains [`transactions.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) with `key` from `secret` and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null result becomes `transaction`.

It checks that [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `transaction.state` and `right` from the UTF-8 bytes of `state` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It gets `document` from [`discover`](protocol.md#symbol-discover) using injected `client`.

It builds `body` as the text `grant_type=authorization_code&code={urlEncode with input from code}&redirect_uri={urlEncode with input from config.callback}&client_id={urlEncode with input from config.clientId}&code_verifier={urlEncode with input from transaction.verifier}`. It sets `headers` to a `Headers` with the header `"content-type"` set to `"application/x-www-form-urlencoded"`. It sets `tokens` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request) with `method` `"POST"`, `url` from `document.token_endpoint`, `headers`, and `body` from the UTF-8 bytes of `body` for [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse).

It checks that `tokens.token_type` equals `"Bearer"` and `tokens.access_token` is a URL-safe ASCII token with `43` to `43` characters and `tokens.expires_in` is greater than `0`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `jwks` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request) with `method` `"GET"` and `url` from `document.jwks_uri` for [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks). It sets `identity` to [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token` from `tokens.id_token`, `transaction.nonce`, `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), and `jwks` using injected `crypto`.

It sets `authHeaders` to a `Headers` with the header `"authorization"` set to the text `Bearer {tokens.access_token}`. It sets `user` to `decode` on [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request) with `method` `"GET"`, `url` from `document.userinfo_endpoint`, and `headers` from `authHeaders` for [`UserInfo`](../provider/contracts.md#symbol-UserInfo). It checks that `user.sub` equals `identity.sub`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check.

It sets `now` to [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It sets `session` to a [`SessionClaims`](contracts.md#symbol-SessionClaims) with `iss` from the text `{config.baseUrl}/app`, `identity.sub`, `aud` `"august-app"`, `exp` from `now` plus `config.sessionSeconds`, `iat` from `now`, `jti` from the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`, `csrf` from the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`, and `user.name`. It sets `jwt` to [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) with `key` from [`keys.session`](../common/keys.md#symbol-SigningKeys.session), `claims` from a `Json` with `value` from `session`, `kid` `"session-1"`, and `tokenType` `"august-session+jwt"` using injected `crypto`. It calls [`sessions.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) with `key` from `session.jti`, `value` from `session`, `expires` from `session.exp`, and `now`.

It sets `responseHeaders` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `"/"`, `name` `"aug_session"`, `value` from `jwt`, `path` `"/"`, `maxAge` from `config.sessionSeconds`, and `secure` from `config.secureCookies`. It sets `responseHeaders` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from `responseHeaders`, `name` `"aug_login"`, `value` `""`, `path` `"/login"`, `maxAge` `0`, and `secure` from `config.secureCookies`. It returns HTTP 303 with a paragraph containing `Signed in.` with escaped text and `responseHeaders` headers.

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) and [`take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take)) and [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull) from `memory`. It uses [`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient) ([`request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request)) and [`urlEncode`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-urlEncode) from `web`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`importRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.importRsa), [`random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`sha256`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.sha256), [`signRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.signRsa), and [`verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa)), [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks), and [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`.

It uses [`LoginTransaction`](contracts.md#symbol-LoginTransaction) (`expires`, `nonce`, `state`, and `verifier`), [`SessionClaims`](contracts.md#symbol-SessionClaims) (`exp` and `jti`), and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. It uses [`discover`](protocol.md#symbol-discover), [`responseJson`](protocol.md#symbol-responseJson), and [`validateIdentity`](protocol.md#symbol-validateIdentity) from `protocol`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl`, `callback`, `clientId`, `secureCookies`, and `sessionSeconds`), [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`sub`), and [`Discovery`](../provider/discovery.md#symbol-Discovery) (`authorization_endpoint`, `jwks_uri`, `token_endpoint`, and `userinfo_endpoint`).

It uses [`TokenResponse`](../provider/contracts.md#symbol-TokenResponse) (`access_token`, `expires_in`, `id_token`, and `token_type`) and [`UserInfo`](../provider/contracts.md#symbol-UserInfo) (`name` and `sub`) from `provider`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

---
title: "provider/authorization.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/authorization.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/authorization.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "authorization.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationRequest and AuthorizationCode and LoginForm and LoginError from contracts
import ProviderLogin and ProviderFailure from views
import verifyCredentials from credentials
import settings and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore and StoreFull from august.memory
import urlEncode from august.web
/** Validate the registered client before offering a login form. A malformed redirect is never followed. */
endpoint GET "/provider/authorize" as authorize(string response_type from query, string client_id from query, string redirect_uri from query, string requestedScope from query "scope", string state from query, string nonce from query, string code_challenge from query, string code_challenge_method from query, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) returns HttpResponse<Html> uses crypto.random and crypto.decodeBase64url and clock.now and requests.put unless LoginError with status 400 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    if client_id != config.clientId or redirect_uri != config.callback or response_type != "code" or code_challenge_method != "S256":
        throw LoginError()
    if requestedScope != "openid" and requestedScope != "openid profile":
        throw LoginError()
    if not state.isToken(min=43, max=128) or not nonce.isToken(min=43, max=128) or code_challenge.length() != 43:
        throw LoginError()
    try:
        if crypto.decodeBase64url(input=code_challenge).length() != 32:
            throw LoginError()
    catch CryptoError error:
        throw LoginError()
    requestId = crypto.random(size=32).base64url()
    browser = crypto.random(size=32).base64url()
    csrf = crypto.random(size=32).base64url()
    now = clock.now()
    request = AuthorizationRequest(clientId=client_id, redirectUri=redirect_uri, state=state, nonce=nonce, challenge=code_challenge, browser=browser, csrf=csrf, expires=now + 300)
    requests.put(key=requestId, value=request, expires=request.expires, now=now)
    headers = withCookie(headers=securityHeaders(), name="aug_authorize", value=browser, path="/provider", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=ProviderLogin(requestId, csrf, message="Authorize the registered August login app.", submit=handle providerLogin(input from form)), headers=headers)
/** The browser binding and CSRF token are checked before credentials. Each form request is consumed once. */
endpoint POST "/provider/login" as providerLogin(LoginForm form from form, optional string browser from cookie "aug_authorize", optional string origin from header "origin", resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.passwordHash and crypto.decodeBase64url and clock.now and requests.take and codes.put unless CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    try:
        if origin != config.baseUrl:
            return HttpResponse(body=ProviderFailure(message="The sign-in form must come from this app."), status=403, headers=securityHeaders())
        match requests.take(key=form.request_id, now=clock.now()):
            when null:
                return HttpResponse(body=ProviderFailure(message="The sign-in request expired or was already used."), status=400, headers=securityHeaders())
            when some request:
                match browser:
                    when null:
                        return HttpResponse(body=ProviderFailure(message="The browser binding is missing."), status=403, headers=securityHeaders())
                    when some secret:
                        if not crypto.equal(left=secret.bytes(), right=request.browser.bytes()) or not crypto.equal(left=form.csrf.bytes(), right=request.csrf.bytes()):
                            return HttpResponse(body=ProviderFailure(message="The sign-in form could not be verified."), status=403, headers=securityHeaders())
                if not verifyCredentials(username=form.username, password=form.password):
                    return HttpResponse(body=ProviderFailure(message="The username or password was not accepted."), status=401, headers=securityHeaders())
                now = clock.now()
                code = crypto.random(size=32).base64url()
                grant = AuthorizationCode(clientId=request.clientId, redirectUri=request.redirectUri, challenge=request.challenge, nonce=request.nonce, subject="demo-ada", name="Ada", expires=now + 60)
                codes.put(key=code, value=grant, expires=grant.expires, now=now)
                location = request.redirectUri + "?code=" + urlEncode(input=code) + "&state=" + urlEncode(input=request.state)
                headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_authorize", value="", path="/provider", maxAge=0, secure=config.secureCookies)
                return HttpResponse(body=<p>Returning to the application.</p>, status=303, headers=headers)
    catch HttpError error:
        return HttpResponse(body=ProviderFailure(message="The submitted form is invalid."), status=400, headers=securityHeaders())
```

```aug [Braces]
// aug-spec: "authorization.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationRequest and AuthorizationCode and LoginForm and LoginError from contracts
import ProviderLogin and ProviderFailure from views
import verifyCredentials from credentials
import settings and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore and StoreFull from august.memory
import urlEncode from august.web
/** Validate the registered client before offering a login form. A malformed redirect is never followed. */
endpoint GET "/provider/authorize" as authorize(string response_type from query, string client_id from query, string redirect_uri from query, string requestedScope from query "scope", string state from query, string nonce from query, string code_challenge from query, string code_challenge_method from query, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) returns HttpResponse<Html> uses crypto.random and crypto.decodeBase64url and clock.now and requests.put unless LoginError with status 400 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    if client_id != config.clientId or redirect_uri != config.callback or response_type != "code" or code_challenge_method != "S256" {
        throw LoginError()
    }
    if requestedScope != "openid" and requestedScope != "openid profile" {
        throw LoginError()
    }
    if not state.isToken(min=43, max=128) or not nonce.isToken(min=43, max=128) or code_challenge.length() != 43 {
        throw LoginError()
    }
    try {
        if crypto.decodeBase64url(input=code_challenge).length() != 32 {
            throw LoginError()
        }
    }
    catch CryptoError error {
        throw LoginError()
    }
    requestId = crypto.random(size=32).base64url()
    browser = crypto.random(size=32).base64url()
    csrf = crypto.random(size=32).base64url()
    now = clock.now()
    request = AuthorizationRequest(clientId=client_id, redirectUri=redirect_uri, state=state, nonce=nonce, challenge=code_challenge, browser=browser, csrf=csrf, expires=now + 300)
    requests.put(key=requestId, value=request, expires=request.expires, now=now)
    headers = withCookie(headers=securityHeaders(), name="aug_authorize", value=browser, path="/provider", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=ProviderLogin(requestId, csrf, message="Authorize the registered August login app.", submit=handle providerLogin(input from form)), headers=headers)
}
/** The browser binding and CSRF token are checked before credentials. Each form request is consumed once. */
endpoint POST "/provider/login" as providerLogin(LoginForm form from form, optional string browser from cookie "aug_authorize", optional string origin from header "origin", resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.passwordHash and crypto.decodeBase64url and clock.now and requests.take and codes.put unless CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    try {
        if origin != config.baseUrl {
            return HttpResponse(body=ProviderFailure(message="The sign-in form must come from this app."), status=403, headers=securityHeaders())
        }
        match requests.take(key=form.request_id, now=clock.now()) {
            when null {
                return HttpResponse(body=ProviderFailure(message="The sign-in request expired or was already used."), status=400, headers=securityHeaders())
            }
            when some request {
                match browser {
                    when null {
                        return HttpResponse(body=ProviderFailure(message="The browser binding is missing."), status=403, headers=securityHeaders())
                    }
                    when some secret {
                        if not crypto.equal(left=secret.bytes(), right=request.browser.bytes()) or not crypto.equal(left=form.csrf.bytes(), right=request.csrf.bytes()) {
                            return HttpResponse(body=ProviderFailure(message="The sign-in form could not be verified."), status=403, headers=securityHeaders())
                        }
                    }
                }
                if not verifyCredentials(username=form.username, password=form.password) {
                    return HttpResponse(body=ProviderFailure(message="The username or password was not accepted."), status=401, headers=securityHeaders())
                }
                now = clock.now()
                code = crypto.random(size=32).base64url()
                grant = AuthorizationCode(clientId=request.clientId, redirectUri=request.redirectUri, challenge=request.challenge, nonce=request.nonce, subject="demo-ada", name="Ada", expires=now + 60)
                codes.put(key=code, value=grant, expires=grant.expires, now=now)
                location = request.redirectUri + "?code=" + urlEncode(input=code) + "&state=" + urlEncode(input=request.state)
                headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_authorize", value="", path="/provider", maxAge=0, secure=config.secureCookies)
                return HttpResponse(body=<p>Returning to the application.</p>, status=303, headers=headers)
            }
        }
    }
    catch HttpError error {
        return HttpResponse(body=ProviderFailure(message="The submitted form is invalid."), status=400, headers=securityHeaders())
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `authorize` · [source](authorization.md#code) {#symbol-authorize}

`authorize` handles `GET /provider/authorize`. Validate the registered client before offering a login form. A malformed redirect is never followed.

It reads `response_type`, `client_id`, `redirect_uri`, `scope`, `state`, `nonce`, `code_challenge`, and `code_challenge_method` from the HTTP query. `scope` is called `requestedScope` here. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), and `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. The handler responds with HTTP 400 for [`LoginError`](contracts.md#symbol-LoginError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull).

It can also raise `HttpError`. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that `client_id` equals `config.clientId` and `redirect_uri` equals `config.callback` and `response_type` equals `"code"` and `code_challenge_method` equals `"S256"`, `requestedScope` is either `"openid"` or `"openid profile"`, and `state` is a URL-safe ASCII token with `43` to `128` characters and `nonce` is a URL-safe ASCII token with `43` to `128` characters and the byte length of `code_challenge` equals `43`. It raises a [`LoginError`](contracts.md#symbol-LoginError) at the first failed check.

It checks that the byte length of `code_challenge` decoded as URL-safe base64 by `crypto` equals `32`. It raises a [`LoginError`](contracts.md#symbol-LoginError) at the first failed check. If this work raises `CryptoError`, it raises a [`LoginError`](contracts.md#symbol-LoginError). It sets `requestId`, `browser`, and `csrf` separately, each to the URL-safe base64 encoding of `32` random bytes from `crypto`.

It sets `now` to the current time from `clock`. It sets `request` to an [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) with `clientId` from `client_id`, `redirectUri` from `redirect_uri`, `state`, `nonce`, `challenge` from `code_challenge`, `browser`, `csrf`, and `expires` from `now` plus `300`. It stores `request` in `requests` under `requestId`, expiring at `request.expires`. The current time for this write is `now`.

It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders), `name` `"aug_authorize"`, `value` from `browser`, `path` `"/provider"`, `maxAge` `300`, and `secure` from `config.secureCookies`. It returns HTTP 200 with [`ProviderLogin`](views.md#symbol-ProviderLogin) with `requestId`, `csrf`, `message` `"Authorize the registered August login app."`, and `submit` from a form action that sends `POST /provider/login` to [`providerLogin`](authorization.md#symbol-providerLogin) on submission and `headers` headers.

### `providerLogin` · [source](authorization.md#code) {#symbol-providerLogin}

`providerLogin` handles `POST /provider/login`. The browser binding and CSRF token are checked before credentials. Each form request is consumed once.

It takes `form` as [`LoginForm`](contracts.md#symbol-LoginForm) from the HTTP form, `browser` as `optional string` from the HTTP cookie `aug_authorize`, and `origin` as `optional string` from the HTTP header `origin`. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)), and `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. The handler responds with HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull).

It can also raise `HttpError`.

It gets `config` from [`settings`](../common/settings.md#symbol-settings). If `origin` does not equal `config.baseUrl`, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in form must come from this app."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. It obtains the live value removed from `requests` under `form.request_id`, using the current time from `clock` as the current time. If no value is found, it returns HTTP 400 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in request expired or was already used."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers.

The non-null result becomes `request`. If `browser` is null, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The browser binding is missing."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. The non-null `browser` becomes `secret`. If the UTF-8 bytes of `secret` and the UTF-8 bytes of `request.browser` differ when compared by `crypto` or the UTF-8 bytes of `form.csrf` and the UTF-8 bytes of `request.csrf` differ when compared by `crypto`, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in form could not be verified."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers.

If [`verifyCredentials`](credentials.md#symbol-verifyCredentials) with `form.username` and `form.password` using injected `crypto` returns false, it returns HTTP 401 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The username or password was not accepted."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. It sets `now` to the current time from `clock`. It sets `code` to the URL-safe base64 encoding of `32` random bytes from `crypto`. It sets `grant` to an [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) with `request.clientId`, `request.redirectUri`, `request.challenge`, `request.nonce`, `subject` `"demo-ada"`, `name` `"Ada"`, and `expires` from `now` plus `60`.

It stores `grant` in `codes` under `code`, expiring at `grant.expires`. The current time for this write is `now`. It builds `location` as the text `{request.redirectUri}?code={URL-encoded code}&state={URL-encoded request.state}`. It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `location`, `name` `"aug_authorize"`, `value` `""`, `path` `"/provider"`, `maxAge` `0`, and `secure` from `config.secureCookies`.

It returns HTTP 303 with a paragraph containing `Returning to the application.` with escaped text and `headers` headers. If this work raises `HttpError`, it returns HTTP 400 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The submitted form is invalid."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), and [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random)) from `august.crypto`. It uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) ([`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) and [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)) and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`. It uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) ([`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)) from `august.time`. It uses [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) from `august.web`.

It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl`, `callback`, `clientId`, and `secureCookies`). It uses [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) (`expires`), [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) (`browser`, `challenge`, `clientId`, `csrf`, `expires`, `nonce`, `redirectUri`, and `state`), [`LoginError`](contracts.md#symbol-LoginError), and [`LoginForm`](contracts.md#symbol-LoginForm) (`csrf`, `password`, `request_id`, and `username`) from `contracts`. It uses [`verifyCredentials`](credentials.md#symbol-verifyCredentials) from `credentials`.

It uses [`ProviderFailure`](views.md#symbol-ProviderFailure) and [`ProviderLogin`](views.md#symbol-ProviderLogin) from `views`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

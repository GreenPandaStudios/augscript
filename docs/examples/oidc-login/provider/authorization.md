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

<a id="symbol-authorize"></a>
### `authorize` · [source](authorization.md#code)

Validate the registered client before offering a login form. A malformed redirect is never followed. The caller supplies `response_type`, `client_id`, and `redirect_uri` as `string` from HTTP query, `requestedScope` as `string` from HTTP query `scope`, and `state`, `nonce`, `code_challenge`, and `code_challenge_method` as `string` from HTTP query. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), and `requests` as [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<Html>`. It can use [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), and [`requests.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`.

This handles `GET` requests at `/provider/authorize`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, [`LoginError`](contracts.md#symbol-LoginError) returns status 400, `CryptoError` returns status 503, `TimeError` returns status 503, and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). If `client_id` does not equal `config.clientId` or `redirect_uri` does not equal `config.callback` or `response_type` does not equal `"code"` or `code_challenge_method` does not equal `"S256"`, it fails with a new [`LoginError`](contracts.md#symbol-LoginError). If `requestedScope` does not equal `"openid"` and `requestedScope` does not equal `"openid profile"`, it fails with a new [`LoginError`](contracts.md#symbol-LoginError).

If not (the value from `isToken` on `state` (`min` set to `43` and `max` set to `128`)) or not (the value from `isToken` on `nonce` (`min` set to `43` and `max` set to `128`)) or the byte length of `code_challenge` does not equal `43`, it fails with a new [`LoginError`](contracts.md#symbol-LoginError).

It tries the following steps. If the byte length of the value from [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` (`input` set to `code_challenge`) does not equal `32`, it fails with a new [`LoginError`](contracts.md#symbol-LoginError). If this attempt raises `CryptoError`, it catches it as `error` and fails with a new [`LoginError`](contracts.md#symbol-LoginError).

After the attempt, execution continues unless it returned or failed. It sets `requestId` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `browser` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `csrf` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `now` to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.

It sets `request` to a new [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) (`clientId` set to `client_id`, `redirectUri` set to `redirect_uri`, `state`, `nonce`, `challenge` set to `code_challenge`, `browser`, `csrf`, and `expires` set to `now` plus `300`). It calls [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `requests` (`key` set to `requestId`, `value` set to `request`, `expires` set to `request.expires`, and `now`). It sets `headers` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders), `name` set to `"aug_authorize"`, `value` set to `browser`, `path` set to `"/provider"`, `maxAge` set to `300`, and `secure` set to `config.secureCookies`).

It returns a new `HttpResponse` (`body` set to the value from [`ProviderLogin`](views.md#symbol-ProviderLogin) (`requestId`, `csrf`, `message` set to `"Authorize the registered August login app."`, and `submit` set to a deferred HTTP form action for [`providerLogin`](authorization.md#symbol-providerLogin); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method) and `headers`).

<a id="symbol-providerLogin"></a>
### `providerLogin` · [source](authorization.md#code)

The browser binding and CSRF token are checked before credentials. Each form request is consumed once. The caller supplies `form` as [`LoginForm`](contracts.md#symbol-LoginForm) from HTTP form, `browser` as `optional string` from HTTP cookie `aug_authorize` (omitted means null), and `origin` as `optional string` from HTTP header `origin` (omitted means null). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `requests` as [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `codes` as [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore).

The result is `HttpResponse<Html>`. It can use [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`codes.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`. This handles `POST` requests at `/provider/login`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, `CryptoError` returns status 503, `TimeError` returns status 503, and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503. It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings).

It tries the following steps. If `origin` does not equal `config.baseUrl`, it returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The sign-in form must come from this app."`), `status` set to `403`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

Select the first matching case for the value from [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `requests` (`key` set to `form.request_id` and `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`). If the selected value is null, it returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The sign-in request expired or was already used."`), `status` set to `400`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

If the selected value is not null, it names it `request` and follows these steps.

Select the first matching case for `browser`. If the selected value is null, it returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The browser binding is missing."`), `status` set to `403`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

If the selected value is not null, it names it `secret` and follows these steps.

If not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `secret` and `right` set to the UTF-8 bytes of `request.browser`)) or not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `form.csrf` and `right` set to the UTF-8 bytes of `request.csrf`)), it returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The sign-in form could not be verified."`), `status` set to `403`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

This ends the case that names `secret`.

After the match, execution continues unless the selected case returned or failed. If not (the value from [`verifyCredentials`](credentials.md#symbol-verifyCredentials) (`username` set to `form.username` and `password` set to `form.password`) using `crypto`), it returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The username or password was not accepted."`), `status` set to `401`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)). It sets `now` to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.

It sets `code` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `grant` to a new [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) (`clientId` set to `request.clientId`, `redirectUri` set to `request.redirectUri`, `challenge` set to `request.challenge`, `nonce` set to `request.nonce`, `subject` set to `"demo-ada"`, `name` set to `"Ada"`, and `expires` set to `now` plus `60`). It calls [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `codes` (`key` set to `code`, `value` set to `grant`, `expires` set to `grant.expires`, and `now`).

It joins these parts in order to make `location`: `request.redirectUri`, `"?code="`, the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `code`), `"&state="`, and the value from [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input` set to `request.state`). It sets `headers` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to the value from `with` on the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (`name` set to `"location"` and `value` set to `location`), `name` set to `"aug_authorize"`, `value` set to `""`, `path` set to `"/provider"`, `maxAge` set to `0`, and `secure` set to `config.secureCookies`).

It returns a new `HttpResponse` (`body` set to the HTML element `p` containing `Returning to the application.` (server-rendered; text escaped), `status` set to `303`, and `headers`). If this attempt raises `HttpError`, it catches it as `error` and returns a new `HttpResponse` (`body` set to the value from [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message` set to `"The submitted form is invalid."`), `status` set to `400`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) takes `password` and `salt` as `Bytes` and `iterations` as `int`. It returns `Bytes`. It can use [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash). It can fail with `CryptoError`. [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) takes `size` as `int`. It returns `Bytes`. It can use [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random). It can fail with `CryptoError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) takes `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It returns no value. It can use [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`. [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). The file uses [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.

The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) from `august.web` takes `input` as `string`. It returns `string`. It can fail with `HttpError`. [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`. [`withCookie`](../common/headers.md#symbol-withCookie) from `common` takes `headers` as `Headers`, `name`, `value`, and `path` as `string`, `maxAge` as `int`, and `secure` as `bool`. It returns `Headers`. It can fail with `HttpError`.

The file uses [`Settings`](../common/settings.md#symbol-Settings). `baseUrl` is a read-only field of type `string`. `callback` is a read-only field of type `string`. `clientId` is a read-only field of type `string`. `secureCookies` is a read-only field of type `bool`. [`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings). The file uses [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) from `contracts`. Construction takes `clientId`, `redirectUri`, `challenge`, `nonce`, `subject`, and `name` as `string` and `expires` as `int`. `expires` is a read-only field of type `int`.

The file uses [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) from `contracts`. Construction takes `clientId`, `redirectUri`, `state`, `nonce`, `challenge`, `browser`, and `csrf` as `string` and `expires` as `int`. `browser` is a read-only field of type `string`. `challenge` is a read-only field of type `string`. `clientId` is a read-only field of type `string`. `csrf` is a read-only field of type `string`. `expires` is a read-only field of type `int`. `nonce` is a read-only field of type `string`. `redirectUri` is a read-only field of type `string`. `state` is a read-only field of type `string`.

The file uses [`LoginError`](contracts.md#symbol-LoginError) from `contracts`. Construction takes no caller inputs. The file uses [`LoginForm`](contracts.md#symbol-LoginForm) from `contracts`. `csrf` is a read-only field of type `string`. `password` is a read-only field of type `string`. `request_id` is a read-only field of type `string`. `username` is a read-only field of type `string`. [`verifyCredentials`](credentials.md#symbol-verifyCredentials) from `credentials` takes `username` and `password` as `string`. It returns `bool`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), and [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). It can fail with `CryptoError`.

[`ProviderFailure`](views.md#symbol-ProviderFailure) from `views` takes `message` as `string`. It returns `Html`. [`ProviderLogin`](views.md#symbol-ProviderLogin) from `views` takes `requestId`, `csrf`, and `message` as `string` and `submit` as `HttpAction`. It returns `Html`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64. `Bytes.length`: Read the number of elements. `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. `string.bytes`: Encode this string as immutable UTF-8 bytes. `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length. `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::

---
title: "provider/authorization.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/authorization.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Code {#code}

::: code-group

```aug [Indentation]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`authorize`](authorization.md#symbol-authorize) handles `GET` `/provider/authorize` returning `HttpResponse<Html>`.
- [`providerLogin`](authorization.md#symbol-providerLogin) handles `POST` `/provider/login` returning `HttpResponse<Html>`.

### `authorize` {#symbol-authorize}

[source](authorization.md#code)

**Inputs**

- `response_type` (`string`) — read from the HTTP query.
- `client_id` (`string`) — read from the HTTP query.
- `redirect_uri` (`string`) — read from the HTTP query.
- `requestedScope` (`string`) — read from the HTTP query named `scope`.
- `state` (`string`) — read from the HTTP query.
- `nonce` (`string`) — read from the HTTP query.
- `code_challenge` (`string`) — read from the HTTP query.
- `code_challenge_method` (`string`) — read from the HTTP query.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/provider/authorize`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`LoginError`](contracts.md#symbol-LoginError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- If (((`client_id` does not equal `clientId` of `config`) or (`redirect_uri` does not equal `callback` of `config`)) or (`response_type` does not equal `"code"`)) or (`code_challenge_method` does not equal `"S256"`):
  - Fail with call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If (`requestedScope` does not equal `"openid"`) and (`requestedScope` does not equal `"openid profile"`):
  - Fail with call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If (not (call `isToken` on `state` with `min` = `43`; `max` = `128`) or not (call `isToken` on `nonce` with `min` = `43`; `max` = `128`)) or (call `length` on `code_challenge` does not equal `43`):
  - Fail with call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - If call `length` on call [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` = `code_challenge` does not equal `32`:
    - Fail with call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- Set `requestId` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `browser` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `csrf` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
- Set `now` to call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `request` to call [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) with `clientId` = `client_id`; `redirectUri` = `redirect_uri`; `state` = `state`; `nonce` = `nonce`; `challenge` = `code_challenge`; `browser` = `browser`; `csrf` = `csrf`; `expires` = (`now` plus `300`).
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `requests` with `key` = `requestId`; `value` = `request`; `expires` = `expires` of `request`; `now` = `now`.
- Set `headers` to call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders); `name` = `"aug_authorize"`; `value` = `browser`; `path` = `"/provider"`; `maxAge` = `300`; `secure` = `secureCookies` of `config`.
- Return call `HttpResponse` with `body` = call [`ProviderLogin`](views.md#symbol-ProviderLogin) with `requestId` = `requestId`; `csrf` = `csrf`; `message` = `"Authorize the registered August login app."`; `submit` = a deferred HTTP form action for [`providerLogin`](authorization.md#symbol-providerLogin); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method; `headers` = `headers`.

**Author documentation**

Validate the registered client before offering a login form. A malformed redirect is never followed.

### `providerLogin` {#symbol-providerLogin}

[source](authorization.md#code)

**Inputs**

- `form` ([`LoginForm`](contracts.md#symbol-LoginForm)) — read from the HTTP form.
- `browser` (`optional string`) — read from the HTTP cookie named `aug_authorize`; absent value becomes null.
- `origin` (`optional string`) — read from the HTTP header named `origin`; absent value becomes null.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.
- `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`codes.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Can fail with `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `POST` `/provider/login`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Try these operations:
  - If `origin` does not equal `baseUrl` of `config`:
    - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The sign-in form must come from this app."`; `status` = `403`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
  - Select the matching case for call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `requests` with `key` = `request_id` of `form`; `now` = call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
    - A null value, including omitted optional input:
      - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The sign-in request expired or was already used."`; `status` = `400`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
    - A present, non-null value, named `request`:
      - Select the matching case for `browser`:
        - A null value, including omitted optional input:
          - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The browser binding is missing."`; `status` = `403`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
        - A present, non-null value, named `secret`:
          - If not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `secret`; `right` = call `bytes` on `browser` of `request`) or not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `csrf` of `form`; `right` = call `bytes` on `csrf` of `request`):
            - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The sign-in form could not be verified."`; `status` = `403`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - If not (call [`verifyCredentials`](credentials.md#symbol-verifyCredentials) with `username` = `username` of `form`; `password` = `password` of `form`; inject `crypto` from `crypto`):
        - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The username or password was not accepted."`; `status` = `401`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - Set `now` to call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - Set `code` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
      - Set `grant` to call [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) with `clientId` = `clientId` of `request`; `redirectUri` = `redirectUri` of `request`; `challenge` = `challenge` of `request`; `nonce` = `nonce` of `request`; `subject` = `"demo-ada"`; `name` = `"Ada"`; `expires` = (`now` plus `60`).
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `codes` with `key` = `code`; `value` = `grant`; `expires` = `expires` of `grant`; `now` = `now`.
      - Build `location` by joining these text parts without separators, in order:
        1. `redirectUri` of `request`
        2. `"?code="`
        3. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `code`
        4. `"&state="`
        5. call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` = `state` of `request`
      - Set `headers` to call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` = call `with` on call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` = `"location"`; `value` = `location`; `name` = `"aug_authorize"`; `value` = `""`; `path` = `"/provider"`; `maxAge` = `0`; `secure` = `secureCookies` of `config`.
      - Return call `HttpResponse` with `body` = the HTML element `p` containing `Returning to the application.` (rendered on the server with embedded text escaped); `status` = `303`; `headers` = `headers`.
- If they fail with `HttpError`, name the failure `error` and recover:
  - Return call `HttpResponse` with `body` = call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` = `"The submitted form is invalid."`; `status` = `400`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

**Author documentation**

The browser binding and CSRF token are checked before credentials. Each form request is consumed once.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) (`password`: `Bytes`, `salt`: `Bytes`, `iterations`: `int`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`.

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

#### [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode)

Function from `august.web`.

- [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input`: `string`) → `string`; can fail with `HttpError`.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Function from `common`.

- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError`.

#### [`withCookie`](../common/headers.md#symbol-withCookie)

Function from `common`.

- [`withCookie`](../common/headers.md#symbol-withCookie) (`headers`: `Headers`, `name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError`.

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `baseUrl` (`string`).
- Read `callback` (`string`).
- Read `clientId` (`string`).
- Read `secureCookies` (`bool`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

#### [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode)

Record from `contracts`.

- Construct with `clientId`: `string`, `redirectUri`: `string`, `challenge`: `string`, `nonce`: `string`, `subject`: `string`, `name`: `string`, `expires`: `int` → [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode).
- Read `expires` (`int`).

#### [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest)

Record from `contracts`.

- Construct with `clientId`: `string`, `redirectUri`: `string`, `state`: `string`, `nonce`: `string`, `challenge`: `string`, `browser`: `string`, `csrf`: `string`, `expires`: `int` → [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest).
- Read `browser` (`string`).
- Read `challenge` (`string`).
- Read `clientId` (`string`).
- Read `csrf` (`string`).
- Read `expires` (`int`).
- Read `nonce` (`string`).
- Read `redirectUri` (`string`).
- Read `state` (`string`).

#### [`LoginError`](contracts.md#symbol-LoginError)

Class from `contracts`.

- Construct with no caller inputs → [`LoginError`](contracts.md#symbol-LoginError).

#### [`LoginForm`](contracts.md#symbol-LoginForm)

Record from `contracts`.

- Read `csrf` (`string`).
- Read `password` (`string`).
- Read `request_id` (`string`).
- Read `username` (`string`).

#### [`verifyCredentials`](credentials.md#symbol-verifyCredentials)

Function from `credentials`.

- [`verifyCredentials`](credentials.md#symbol-verifyCredentials) (`username`: `string`, `password`: `string`) → `bool`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal); can fail with `CryptoError`.

#### [`ProviderFailure`](views.md#symbol-ProviderFailure)

Function from `views`.

- [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message`: `string`) → `Html`.

#### [`ProviderLogin`](views.md#symbol-ProviderLogin)

Function from `views`.

- [`ProviderLogin`](views.md#symbol-ProviderLogin) (`requestId`: `string`, `csrf`: `string`, `message`: `string`, `submit`: `HttpAction`) → `Html`.

### Built-in operations used by this file

- `Bytes.base64url` (no inputs) → `string`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Bytes.length` (no inputs) → `int`: Read the number of elements.
- `Headers.with` (`name`: `string`, `value`: `string`) → `Headers`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. Can fail with `HttpError`.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken` (`min`: `int`, `max`: `int`) → `bool`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

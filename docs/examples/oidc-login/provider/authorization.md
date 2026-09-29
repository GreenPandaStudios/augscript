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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-authorize"></a>
### `authorize` · [source](authorization.md#code)

Validate the registered client before offering a login form. A malformed redirect is never followed.

**Inputs:** Take `response_type` (`string`) from HTTP query. Take `client_id` (`string`) from HTTP query. Take `redirect_uri` (`string`) from HTTP query. Take `requestedScope` (`string`) from HTTP query `scope`. Take `state` (`string`) from HTTP query. Take `nonce` (`string`) from HTTP query. Take `code_challenge` (`string`) from HTTP query. Take `code_challenge_method` (`string`) from HTTP query. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `requests`.

Returns `HttpResponse<Html>`. Uses [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). Can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

HTTP route: `GET` `/provider/authorize`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`LoginError`](contracts.md#symbol-LoginError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- If (((`client_id` does not equal `clientId` of `config`) or (`redirect_uri` does not equal `callback` of `config`)) or (`response_type` does not equal `"code"`)) or (`code_challenge_method` does not equal `"S256"`):
  - Fail with a new [`LoginError`](contracts.md#symbol-LoginError).
- If (`requestedScope` does not equal `"openid"`) and (`requestedScope` does not equal `"openid profile"`):
  - Fail with a new [`LoginError`](contracts.md#symbol-LoginError).
- If (not (the result of `isToken` on `state` with `min` as `43`, `max` as `128`) or not (the result of `isToken` on `nonce` with `min` as `43`, `max` as `128`)) or (the result of `length` on `code_challenge` does not equal `43`):
  - Fail with a new [`LoginError`](contracts.md#symbol-LoginError).
- Try:
  - If the result of `length` on the result of [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` as `code_challenge` does not equal `32`:
    - Fail with a new [`LoginError`](contracts.md#symbol-LoginError).
- Catch `CryptoError` as `error`:
  - Fail with a new [`LoginError`](contracts.md#symbol-LoginError).
- Set `requestId` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `browser` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `csrf` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
- Set `now` to the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `request` to a new [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) with `clientId` as `client_id`, `redirectUri` as `redirect_uri`, `state`, `nonce`, `challenge` as `code_challenge`, `browser`, `csrf`, `expires` as `now` plus `300`.
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `requests` with `key` as `requestId`, `value` as `request`, `expires` as `expires` of `request`, `now`.
- Set `headers` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders), `name` as `"aug_authorize"`, `value` as `browser`, `path` as `"/provider"`, `maxAge` as `300`, `secure` as `secureCookies` of `config`.
- Return a new `HttpResponse` with `body` as the result of [`ProviderLogin`](views.md#symbol-ProviderLogin) with `requestId`, `csrf`, `message` as `"Authorize the registered August login app."`, `submit` as a deferred HTTP form action for [`providerLogin`](authorization.md#symbol-providerLogin); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method, `headers`.

<a id="symbol-providerLogin"></a>
### `providerLogin` · [source](authorization.md#code)

The browser binding and CSRF token are checked before credentials. Each form request is consumed once.

**Inputs:** Take `form` ([`LoginForm`](contracts.md#symbol-LoginForm)) from HTTP form. Take `browser` (`optional string`) from HTTP cookie `aug_authorize`; omitted means null. Take `origin` (`optional string`) from HTTP header `origin`; omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `requests`. Resolve [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `codes`.

Returns `HttpResponse<Html>`. Uses [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`codes.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). Can fail with `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

HTTP route: `POST` `/provider/login`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Try:
  - If `origin` does not equal `baseUrl` of `config`:
    - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The sign-in form must come from this app."`, `status` as `403`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
  - Match the result of [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `requests` with `key` as `request_id` of `form`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
    - A null value, including omitted optional input:
      - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The sign-in request expired or was already used."`, `status` as `400`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
    - A present, non-null value, named `request`:
      - Match `browser`:
        - A null value, including omitted optional input:
          - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The browser binding is missing."`, `status` as `403`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
        - A present, non-null value, named `secret`:
          - If not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `secret`, `right` as the result of `bytes` on `browser` of `request`) or not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `csrf` of `form`, `right` as the result of `bytes` on `csrf` of `request`):
            - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The sign-in form could not be verified."`, `status` as `403`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - If not (the result of [`verifyCredentials`](credentials.md#symbol-verifyCredentials) with `username` as `username` of `form`, `password` as `password` of `form` using `crypto`):
        - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The username or password was not accepted."`, `status` as `401`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
      - Set `now` to the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - Set `code` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
      - Set `grant` to a new [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) with `clientId` as `clientId` of `request`, `redirectUri` as `redirectUri` of `request`, `challenge` as `challenge` of `request`, `nonce` as `nonce` of `request`, `subject` as `"demo-ada"`, `name` as `"Ada"`, `expires` as `now` plus `60`.
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `codes` with `key` as `code`, `value` as `grant`, `expires` as `expires` of `grant`, `now`.
      - Join `redirectUri` of `request`, `"?code="`, the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `code`, `"&state="` and the result of [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` as `state` of `request` to make `location`.
      - Set `headers` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as the result of `with` on the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` as `"location"`, `value` as `location`, `name` as `"aug_authorize"`, `value` as `""`, `path` as `"/provider"`, `maxAge` as `0`, `secure` as `secureCookies` of `config`.
      - Return a new `HttpResponse` with `body` as the HTML element `p` containing `Returning to the application.` (server-rendered; text escaped), `status` as `303`, `headers`.
- Catch `HttpError` as `error`:
  - Return a new `HttpResponse` with `body` as the result of [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` as `"The submitted form is invalid."`, `status` as `400`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) (`password`: `Bytes`, `salt`: `Bytes`, `iterations`: `int`) → `Bytes`; can fail with `CryptoError`; [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) (`key`: `string`, `value`: `T`, `expires`: `int`, `now`: `int`) → `void`; can fail with `StoreFull`; [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.
- [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) (`input`: `string`) → `string`; can fail with `HttpError` from `august.web`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`withCookie`](../common/headers.md#symbol-withCookie) (`headers`: `Headers`, `name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError` from `common`.
- [`Settings`](../common/settings.md#symbol-Settings): read `baseUrl` (`string`); read `callback` (`string`); read `clientId` (`string`); read `secureCookies` (`bool`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.
- [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) from `contracts`: construct with `clientId`: `string`, `redirectUri`: `string`, `challenge`: `string`, `nonce`: `string`, `subject`: `string`, `name`: `string`, `expires`: `int`; read `expires` (`int`).
- [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) from `contracts`: construct with `clientId`: `string`, `redirectUri`: `string`, `state`: `string`, `nonce`: `string`, `challenge`: `string`, `browser`: `string`, `csrf`: `string`, `expires`: `int`; read `browser` (`string`); read `challenge` (`string`); read `clientId` (`string`); read `csrf` (`string`); read `expires` (`int`); read `nonce` (`string`); read `redirectUri` (`string`); read `state` (`string`).
- [`LoginError`](contracts.md#symbol-LoginError) from `contracts`: construct with no caller inputs.
- [`LoginForm`](contracts.md#symbol-LoginForm) from `contracts`: read `csrf` (`string`); read `password` (`string`); read `request_id` (`string`); read `username` (`string`).
- [`verifyCredentials`](credentials.md#symbol-verifyCredentials) (`username`: `string`, `password`: `string`) → `bool`; can fail with `CryptoError` from `credentials`.
- [`ProviderFailure`](views.md#symbol-ProviderFailure) (`message`: `string`) → `Html` from `views`.
- [`ProviderLogin`](views.md#symbol-ProviderLogin) (`requestId`: `string`, `csrf`: `string`, `message`: `string`, `submit`: `HttpAction`) → `Html` from `views`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `Bytes.length`: Read the number of elements.
- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::

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

**[`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash)**

**Inputs and dependencies**

- `password`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `salt`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `iterations`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random)**

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

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

#### [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode)

Available from `august.web`.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `HttpError`. The caller must catch or propagate them.

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

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `clientId`: `string`. Read-only after initialization.

Field `callback`: `string`. Read-only after initialization.

Field `secureCookies`: `bool`. Read-only after initialization.

Field `baseUrl`: `string`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

#### [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `clientId`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `redirectUri`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `subject`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode).

Field `expires`: `int`. Read-only after initialization.

#### [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `clientId`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `redirectUri`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `browser`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest).

Field `expires`: `int`. Read-only after initialization.

Field `browser`: `string`. Read-only after initialization.

Field `csrf`: `string`. Read-only after initialization.

Field `clientId`: `string`. Read-only after initialization.

Field `redirectUri`: `string`. Read-only after initialization.

Field `challenge`: `string`. Read-only after initialization.

Field `nonce`: `string`. Read-only after initialization.

Field `state`: `string`. Read-only after initialization.

#### [`LoginError`](contracts.md#symbol-LoginError)

Available from `contracts`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`LoginError`](contracts.md#symbol-LoginError).

#### [`LoginForm`](contracts.md#symbol-LoginForm)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `request_id`: `string`. Read-only after initialization.

Field `csrf`: `string`. Read-only after initialization.

Field `username`: `string`. Read-only after initialization.

Field `password`: `string`. Read-only after initialization.

#### [`verifyCredentials`](credentials.md#symbol-verifyCredentials)

Available from `credentials`.

**Inputs and dependencies**

- `username`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `password`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `bool`.

Capabilities: [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`ProviderFailure`](views.md#symbol-ProviderFailure)

Available from `views`.

**Inputs and dependencies**

- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

#### [`ProviderLogin`](views.md#symbol-ProviderLogin)

Available from `views`.

**Inputs and dependencies**

- `requestId`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `csrf`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `submit`: `HttpAction`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Html`.

### Built-in operations used by this file

#### `Bytes.base64url`

Encode immutable bytes as unpadded RFC 4648 URL-safe base64.

Result: `string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Bytes.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

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

#### `string.length`

Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `authorize` {#symbol-authorize}

[source](authorization.md#code)

**Inputs and dependencies**

- `response_type`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `client_id`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `redirect_uri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `requestedScope`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query named `scope`.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `code_challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `code_challenge_method`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `requests`: [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/authorize`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`LoginError`](contracts.md#symbol-LoginError) returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**Author documentation**

Validate the registered client before offering a login form. A malformed redirect is never followed.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- If ((((`client_id` does not equal `clientId` of `config`) or (`redirect_uri` does not equal `callback` of `config`)) or (`response_type` does not equal `"code"`)) or (`code_challenge_method` does not equal `"S256"`)) is true:
  - Fail with the result of call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If ((`requestedScope` does not equal `"openid"`) and (`requestedScope` does not equal `"openid profile"`)) is true:
  - Fail with the result of call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If ((not (the result of call `isToken` on `state` with `min` set to `43`; `max` set to `128`) or not (the result of call `isToken` on `nonce` with `min` set to `43`; `max` set to `128`)) or (the result of call `length` on `code_challenge` does not equal `43`)) is true:
  - Fail with the result of call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- Try these operations:
  - If (the result of call `length` on the result of call [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) on `crypto` with `input` set to `code_challenge` does not equal `32`) is true:
    - Fail with the result of call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Fail with the result of call [`LoginError`](contracts.md#symbol-LoginError). Transfer control to a matching catch or propagate the failure.
- Set `requestId` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `browser` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `csrf` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
- Set `now` to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `request` to the result of call [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) with `clientId` set to `client_id`; `redirectUri` set to `redirect_uri`; `state` set to `state`; `nonce` set to `nonce`; `challenge` set to `code_challenge`; `browser` set to `browser`; `csrf` set to `csrf`; `expires` set to (`now` plus `300`).
- Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `requests` with `key` set to `requestId`; `value` set to `request`; `expires` set to `expires` of `request`; `now` set to `now`.
- Set `headers` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders); `name` set to `"aug_authorize"`; `value` set to `browser`; `path` set to `"/provider"`; `maxAge` set to `300`; `secure` set to `secureCookies` of `config`.
- Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderLogin`](views.md#symbol-ProviderLogin) with `requestId` set to `requestId`; `csrf` set to `csrf`; `message` set to `"Authorize the registered August login app."`; `submit` set to a deferred HTTP form action for [`providerLogin`](authorization.md#symbol-providerLogin); inputs: `1` from the checked form input supplied when the HTTP form is submitted; capture supplied values when rendering, and read form inputs when submitted; send the form to that endpoint with its declared HTTP method; `headers` set to `headers` and finish this operation.

### `providerLogin` {#symbol-providerLogin}

[source](authorization.md#code)

**Inputs and dependencies**

- `form`: [`LoginForm`](contracts.md#symbol-LoginForm). The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP form.
- `browser`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_authorize`.
- `origin`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header named `origin`.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `requests`: [`ExpiringStore<AuthorizationRequest>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `codes`: [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`codes.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/provider/login`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**Author documentation**

The browser binding and CSRF token are checked before credentials. Each form request is consumed once.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Try these operations:
  - If (`origin` does not equal `baseUrl` of `config`) is true:
    - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The sign-in form must come from this app."`; `status` set to `403`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
  - Select the matching case for the result of call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `requests` with `key` set to `request_id` of `form`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`:
    - A null value, including omitted optional input:
      - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The sign-in request expired or was already used."`; `status` set to `400`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
    - A present, non-null value, named `request`:
      - Select the matching case for `browser`:
        - A null value, including omitted optional input:
          - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The browser binding is missing."`; `status` set to `403`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
        - A present, non-null value, named `secret`:
          - If (not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `secret`; `right` set to the result of call `bytes` on `browser` of `request`) or not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `csrf` of `form`; `right` set to the result of call `bytes` on `csrf` of `request`)) is true:
            - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The sign-in form could not be verified."`; `status` set to `403`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
      - If not (the result of call [`verifyCredentials`](credentials.md#symbol-verifyCredentials) with `username` set to `username` of `form`; `password` set to `password` of `form`; supply dependencies `crypto` from `crypto`) is true:
        - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The username or password was not accepted."`; `status` set to `401`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
      - Set `now` to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - Set `code` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
      - Set `grant` to the result of call [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) with `clientId` set to `clientId` of `request`; `redirectUri` set to `redirectUri` of `request`; `challenge` set to `challenge` of `request`; `nonce` set to `nonce` of `request`; `subject` set to `"demo-ada"`; `name` set to `"Ada"`; `expires` set to (`now` plus `60`).
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `codes` with `key` set to `code`; `value` set to `grant`; `expires` set to `expires` of `grant`; `now` set to `now`.
      - Set `location` to ((((`redirectUri` of `request` plus `"?code="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `code`) plus `"&state="`) plus the result of call [`urlEncode`](../dependencies/august/0.19.0/web/contracts.md#symbol-urlEncode) with `input` set to `state` of `request`).
      - Set `headers` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to the result of call `with` on the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` set to `"location"`; `value` set to `location`; `name` set to `"aug_authorize"`; `value` set to `""`; `path` set to `"/provider"`; `maxAge` set to `0`; `secure` set to `secureCookies` of `config`.
      - Return the result of call `HttpResponse` with `body` set to the HTML element `p`; children: `Returning to the application.`. Escape embedded text; render components on the server; `status` set to `303`; `headers` set to `headers` and finish this operation.
- If they fail with `HttpError`, name the failure `error` and recover:
  - Return the result of call `HttpResponse` with `body` set to the result of call [`ProviderFailure`](views.md#symbol-ProviderFailure) with `message` set to `"The submitted form is invalid."`; `status` set to `400`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

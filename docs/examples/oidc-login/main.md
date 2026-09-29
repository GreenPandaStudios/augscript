---
title: "main.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[OpenID Connect login application](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`client/contracts.aug`](client/contracts.md)
- [`client/endpoints.aug`](client/endpoints.md)
- [`client/export.aug`](client/export.md)
- [`client/login.aug`](client/login.md)
- [`client/logout.aug`](client/logout.md)
- [`client/protocol.aug`](client/protocol.md)
- [`client/session.aug`](client/session.md)
- [`client/views.aug`](client/views.md)
- [`common/export.aug`](common/export.md)
- [`common/headers.aug`](common/headers.md)
- [`common/keys.aug`](common/keys.md)
- [`common/settings.aug`](common/settings.md)
- [`common/views.aug`](common/views.md)
- [`provider/authorization.aug`](provider/authorization.md)
- [`provider/contracts.aug`](provider/contracts.md)
- [`provider/credentials.aug`](provider/credentials.md)
- [`provider/discovery.aug`](provider/discovery.md)
- [`provider/export.aug`](provider/export.md)
- [`provider/token.aug`](provider/token.md)
- [`provider/userinfo.aug`](provider/userinfo.md)
- [`provider/views.aug`](provider/views.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Crypto and GnuTlsCrypto from august.crypto
import Clock and SystemClock from august.time
import HttpClient and WebHttpClient from august.web
import ExpiringStore and MemoryStore from august.memory
import LoginTransaction and SessionClaims and home and me and logout and startLogin and loginCallback from client
import AuthorizationRequest and AuthorizationCode and AccessGrant and discovery and jwks and authorize and providerLogin and token and userinfo from provider
import SigningKeys and MemorySigningKeys and initializeKeys and KeyError from common
implement Crypto with GnuTlsCrypto
implement Clock with SystemClock
implement HttpClient with WebHttpClient
implement SigningKeys with MemorySigningKeys shared mutable
implement ExpiringStore<LoginTransaction> with MemoryStore<LoginTransaction> shared mutable
implement ExpiringStore<AuthorizationRequest> with MemoryStore<AuthorizationRequest> shared mutable
implement ExpiringStore<AuthorizationCode> with MemoryStore<AuthorizationCode> shared mutable
implement ExpiringStore<SessionClaims> with MemoryStore<SessionClaims> shared mutable
implement ExpiringStore<AccessGrant> with MemoryStore<AccessGrant> shared mutable
try:
    initializeKeys()
catch CryptoError error:
    print(value="Cryptographic initialization failed")
    exit(status=1)
catch KeyError error:
    print(value="Signing keys could not be initialized")
    exit(status=1)
serve home and me and logout and startLogin and loginCallback and discovery and jwks and authorize and providerLogin and token and userinfo on port 8787
```

```aug [Braces]
import Crypto and GnuTlsCrypto from august.crypto
import Clock and SystemClock from august.time
import HttpClient and WebHttpClient from august.web
import ExpiringStore and MemoryStore from august.memory
import LoginTransaction and SessionClaims and home and me and logout and startLogin and loginCallback from client
import AuthorizationRequest and AuthorizationCode and AccessGrant and discovery and jwks and authorize and providerLogin and token and userinfo from provider
import SigningKeys and MemorySigningKeys and initializeKeys and KeyError from common
implement Crypto with GnuTlsCrypto
implement Clock with SystemClock
implement HttpClient with WebHttpClient
implement SigningKeys with MemorySigningKeys shared mutable
implement ExpiringStore<LoginTransaction> with MemoryStore<LoginTransaction> shared mutable
implement ExpiringStore<AuthorizationRequest> with MemoryStore<AuthorizationRequest> shared mutable
implement ExpiringStore<AuthorizationCode> with MemoryStore<AuthorizationCode> shared mutable
implement ExpiringStore<SessionClaims> with MemoryStore<SessionClaims> shared mutable
implement ExpiringStore<AccessGrant> with MemoryStore<AccessGrant> shared mutable
try {
    initializeKeys()
}
catch CryptoError error {
    print(value="Cryptographic initialization failed")
    exit(status=1)
}
catch KeyError error {
    print(value="Signing keys could not be initialized")
    exit(status=1)
}
serve home and me and logout and startLogin and loginCallback and discovery and jwks and authorize and providerLogin and token and userinfo on port 8787
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore)

Available from `august.memory`.

Class. Follow the linked specification for its full explanation.

#### [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock)

Available from `august.time`.

Class. Follow the linked specification for its full explanation.

#### [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient)

Available from `august.web`.

Class. Follow the linked specification for its full explanation.

#### [`home`](client/endpoints.md#symbol-home)

Available from `client`.

**Inputs and dependencies**

- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_session`.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `KeyError`, `TimeError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

#### [`me`](client/endpoints.md#symbol-me)

Available from `client`.

**Inputs and dependencies**

- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_session`.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<UserInfo>`.

Capabilities: [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `SessionError`, `KeyError`, `TimeError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/me`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `SessionError` returns status 401.

#### [`loginCallback`](client/login.md#symbol-loginCallback)

Available from `client`.

**Inputs and dependencies**

- `code`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `browser`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_login`.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `client`: [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `transactions`: [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`transactions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`sessions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/login/callback`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `SessionError` returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; `StoreFull` returns status 503.

#### [`startLogin`](client/login.md#symbol-startLogin)

Available from `client`.

**Inputs and dependencies**

- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `client`: [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `transactions`: [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`transactions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/login/start`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `SessionError` returns status 502; `CryptoError` returns status 503; `TimeError` returns status 503; `StoreFull` returns status 503.

#### [`logout`](client/logout.md#symbol-logout)

Available from `client`.

**Inputs and dependencies**

- `input`: [`LogoutForm`](client/contracts.md#symbol-LogoutForm). The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP form.
- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_session`.
- `origin`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

Possible failures: `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/logout`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `SessionError` returns status 403.

#### [`KeyError`](common/keys.md#symbol-KeyError)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`initializeKeys`](common/keys.md#symbol-initializeKeys)

Available from `common`.

**Inputs and dependencies**

- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`crypto.generateRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`keys.configure`](common/keys.md#symbol-SigningKeys.configure).

Possible failures: `CryptoError`, `KeyError`. The caller must catch or propagate them.

#### [`authorize`](provider/authorization.md#symbol-authorize)

Available from `provider`.

**Inputs and dependencies**

- `response_type`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `client_id`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `redirect_uri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `requestedScope`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query named `scope`.
- `state`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `code_challenge`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `code_challenge_method`: `string`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP query.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `requests`: [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/authorize`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `LoginError` returns status 400; `CryptoError` returns status 503; `TimeError` returns status 503; `StoreFull` returns status 503.

#### [`providerLogin`](provider/authorization.md#symbol-providerLogin)

Available from `provider`.

**Inputs and dependencies**

- `form`: [`LoginForm`](provider/contracts.md#symbol-LoginForm). The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP form.
- `browser`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_authorize`.
- `origin`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header named `origin`.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `requests`: [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `codes`: [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`codes.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `CryptoError`, `TimeError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/provider/login`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; `StoreFull` returns status 503.

#### [`discovery`](provider/discovery.md#symbol-discovery)

Available from `provider`.

Result: [`Discovery`](provider/discovery.md#symbol-Discovery).

HTTP route: `GET` `/provider/.well-known/openid-configuration`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

#### [`jwks`](provider/discovery.md#symbol-jwks)

Available from `provider`.

**Inputs and dependencies**

- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

Capabilities: [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.exportRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Possible failures: `KeyError`, `CryptoError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/jwks`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

#### [`token`](provider/token.md#symbol-token)

Available from `provider`.

**Inputs and dependencies**

- `http`: `HttpRequest`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP request.
- `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `codes`: [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `access`: [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Json>`.

Capabilities: [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`codes.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`access.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/provider/token`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; `StoreFull` returns status 503.

#### [`userinfo`](provider/userinfo.md#symbol-userinfo)

Available from `provider`.

**Inputs and dependencies**

- `authorization`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header.
- `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `access`: [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Json>`.

Capabilities: [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`access.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `TimeError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/userinfo`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

### Built-in operations used by this file

#### `exit`

Exit from main with a status from 0 to 255 after cancellation and cleanup.

Inputs: `status`: `int`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 16384 bytes and buffered responses to 1048576 bytes.

Serve the OpenAPI document at `/openapi.json` and API documentation at `/docs`.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) when `Crypto` is requested. Reuse one instance.
- Provide [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) when `Clock` is requested. Reuse one instance.
- Provide [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) when `HttpClient` is requested. Reuse one instance.
- Provide [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) when `SigningKeys` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore` is requested. Reuse one instance. Permit explicit shared mutation.

### Startup, in source order

- Try these operations:
  - Call [`initializeKeys`](common/keys.md#symbol-initializeKeys); supply dependencies `crypto` from `Crypto`, `keys` from `SigningKeys`.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Call `print` with `value` set to `"Cryptographic initialization failed"`.
  - Call `exit` with `status` set to `1`.
- If they fail with [`KeyError`](common/keys.md#symbol-KeyError), name the failure `error` and recover:
  - Call `print` with `value` set to `"Signing keys could not be initialized"`.
  - Call `exit` with `status` set to `1`.
- Serve [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`logout`](client/logout.md#symbol-logout), [`startLogin`](client/login.md#symbol-startLogin), [`loginCallback`](client/login.md#symbol-loginCallback), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`token`](provider/token.md#symbol-token), [`userinfo`](provider/userinfo.md#symbol-userinfo) on port `8787`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

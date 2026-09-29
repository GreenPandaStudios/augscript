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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 9 dependency providers before startup.
- Run startup operations with checked error recovery.
- Serve 11 HTTP routes.

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 16384 bytes and buffered responses to 1048576 bytes.

Serve the OpenAPI document at `/openapi.json` and API documentation at `/docs`.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) when `Crypto` is requested. Reuse one instance.
- Provide [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) when `Clock` is requested. Reuse one instance.
- Provide [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) when `HttpClient` is requested. Reuse one instance.
- Provide [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) when `SigningKeys` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore<LoginTransaction>` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore<AuthorizationRequest>` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore<AuthorizationCode>` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore<SessionClaims>` is requested. Reuse one instance. Permit explicit shared mutation.
- Provide [`MemoryStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) when `ExpiringStore<AccessGrant>` is requested. Reuse one instance. Permit explicit shared mutation.

### Startup, in source order

- Try these operations:
  - Call [`initializeKeys`](common/keys.md#symbol-initializeKeys); inject `crypto` from `Crypto`, `keys` from `SigningKeys`.
- If they fail with `CryptoError`, name the failure `error` and recover:
  - Call `print` with `value` = `"Cryptographic initialization failed"`.
  - Call `exit` with `status` = `1`.
- If they fail with [`KeyError`](common/keys.md#symbol-KeyError), name the failure `error` and recover:
  - Call `print` with `value` = `"Signing keys could not be initialized"`.
  - Call `exit` with `status` = `1`.
- Serve [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`logout`](client/logout.md#symbol-logout), [`startLogin`](client/login.md#symbol-startLogin), [`loginCallback`](client/login.md#symbol-loginCallback), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`token`](provider/token.md#symbol-token), [`userinfo`](provider/userinfo.md#symbol-userinfo) on port `8787`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto)

Class from `august.crypto`.

Used as a type or provider.

#### [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore)

Class from `august.memory`.

Used as a type or provider.

#### [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock)

Class from `august.time`.

Used as a type or provider.

#### [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient)

Class from `august.web`.

Used as a type or provider.

#### [`home`](client/endpoints.md#symbol-home)

Function from `client`.

- [`home`](client/endpoints.md#symbol-home) (`token`: `optional string` from HTTP cookie `aug_session`) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys), `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get); can fail with `KeyError`, `TimeError`, `HttpError`.

#### [`me`](client/endpoints.md#symbol-me)

Function from `client`.

- [`me`](client/endpoints.md#symbol-me) (`token`: `optional string` from HTTP cookie `aug_session`) → `HttpResponse<UserInfo>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys), `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get); can fail with `SessionError`, `KeyError`, `TimeError`, `HttpError`.

#### [`loginCallback`](client/login.md#symbol-loginCallback)

Function from `client`.

- [`loginCallback`](client/login.md#symbol-loginCallback) (`code`: `string` from HTTP query, `state`: `string` from HTTP query, `browser`: `optional string` from HTTP cookie `aug_login`) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client`: [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys), `transactions`: [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`transactions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`sessions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put); can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError`.

#### [`startLogin`](client/login.md#symbol-startLogin)

Function from `client`.

- [`startLogin`](client/login.md#symbol-startLogin) (no caller inputs) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client`: [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), `transactions`: [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`transactions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put); can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

#### [`logout`](client/logout.md#symbol-logout)

Function from `client`.

- [`logout`](client/logout.md#symbol-logout) (`input`: [`LogoutForm`](client/contracts.md#symbol-LogoutForm) from HTTP form, `token`: `optional string` from HTTP cookie `aug_session`, `origin`: `optional string` from HTTP header) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys), `sessions`: [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take); can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`.

#### [`KeyError`](common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys)

Class from `common`.

Used as a type or provider.

#### [`initializeKeys`](common/keys.md#symbol-initializeKeys)

Function from `common`.

- [`initializeKeys`](common/keys.md#symbol-initializeKeys) (no caller inputs) → `void`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys); uses [`crypto.generateRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`keys.configure`](common/keys.md#symbol-SigningKeys.configure); can fail with `CryptoError`, `KeyError`.

#### [`authorize`](provider/authorization.md#symbol-authorize)

Function from `provider`.

- [`authorize`](provider/authorization.md#symbol-authorize) (`response_type`: `string` from HTTP query, `client_id`: `string` from HTTP query, `redirect_uri`: `string` from HTTP query, `requestedScope`: `string` from HTTP query `scope`, `state`: `string` from HTTP query, `nonce`: `string` from HTTP query, `code_challenge`: `string` from HTTP query, `code_challenge_method`: `string` from HTTP query) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `requests`: [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put); can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

#### [`providerLogin`](provider/authorization.md#symbol-providerLogin)

Function from `provider`.

- [`providerLogin`](provider/authorization.md#symbol-providerLogin) (`form`: [`LoginForm`](provider/contracts.md#symbol-LoginForm) from HTTP form, `browser`: `optional string` from HTTP cookie `aug_authorize`, `origin`: `optional string` from HTTP header `origin`) → `HttpResponse<Html>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `requests`: [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), `codes`: [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`codes.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put); can fail with `CryptoError`, `TimeError`, `StoreFull`, `HttpError`.

#### [`discovery`](provider/discovery.md#symbol-discovery)

Function from `provider`.

- [`discovery`](provider/discovery.md#symbol-discovery) (no caller inputs) → [`Discovery`](provider/discovery.md#symbol-Discovery).

#### [`jwks`](provider/discovery.md#symbol-jwks)

Function from `provider`.

- [`jwks`](provider/discovery.md#symbol-jwks) (no caller inputs) → [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks); inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys); uses [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.exportRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa); can fail with `KeyError`, `CryptoError`.

#### [`token`](provider/token.md#symbol-token)

Function from `provider`.

- [`token`](provider/token.md#symbol-token) (`http`: `HttpRequest` from HTTP request) → `HttpResponse<Json>`; inject `crypto`: [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](common/keys.md#symbol-SigningKeys), `codes`: [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), `access`: [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`codes.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`access.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put); can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError`.

#### [`userinfo`](provider/userinfo.md#symbol-userinfo)

Function from `provider`.

- [`userinfo`](provider/userinfo.md#symbol-userinfo) (`authorization`: `optional string` from HTTP header) → `HttpResponse<Json>`; inject `clock`: [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `access`: [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`access.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get); can fail with `TimeError`, `HttpError`.

### Built-in operations used by this file

- `exit` (`status`: `int`) → `void`: Exit from main with a status from 0 to 255 after cancellation and cleanup.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

---
title: "main.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 16384 bytes and buffered responses to 1048576 bytes. Serve OpenAPI at `/openapi.json` and API docs at `/docs`.

### Providers

- Provide [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) for `Crypto`. Share one instance.
- Provide [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) for `Clock`. Share one instance.
- Provide [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) for `HttpClient`. Share one instance.
- Provide [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) for `SigningKeys`. Share one instance. Allow shared mutation.
- Provide [`MemoryStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<LoginTransaction>`. Share one instance. Allow shared mutation.
- Provide [`MemoryStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AuthorizationRequest>`. Share one instance. Allow shared mutation.
- Provide [`MemoryStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AuthorizationCode>`. Share one instance. Allow shared mutation.
- Provide [`MemoryStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<SessionClaims>`. Share one instance. Allow shared mutation.
- Provide [`MemoryStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AccessGrant>`. Share one instance. Allow shared mutation.

### Startup

- Try:
  - Call [`initializeKeys`](common/keys.md#symbol-initializeKeys) using `Crypto` for `crypto`, `SigningKeys` for `keys`.
- Catch `CryptoError` as `error`:
  - Call `print` with `value` as `"Cryptographic initialization failed"`.
  - Call `exit` with `status` as `1`.
- Catch [`KeyError`](common/keys.md#symbol-KeyError) as `error`:
  - Call `print` with `value` as `"Signing keys could not be initialized"`.
  - Call `exit` with `status` as `1`.
- Serve [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`logout`](client/logout.md#symbol-logout), [`startLogin`](client/login.md#symbol-startLogin), [`loginCallback`](client/login.md#symbol-loginCallback), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`token`](provider/token.md#symbol-token), [`userinfo`](provider/userinfo.md#symbol-userinfo) on port `8787`.

### Dependencies

- [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) from `august.crypto`.
- [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).
- [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) from `august.memory`.
- [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) from `august.time`.
- [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) from `august.web`.
- [`LogoutForm`](client/contracts.md#symbol-LogoutForm).
- [`home`](client/endpoints.md#symbol-home) (`token`: `optional string` from HTTP cookie `aug_session`) → `HttpResponse<Html>`; can fail with `KeyError`, `TimeError`, `HttpError` from `client`.
- [`me`](client/endpoints.md#symbol-me) (`token`: `optional string` from HTTP cookie `aug_session`) → `HttpResponse<UserInfo>`; can fail with `SessionError`, `KeyError`, `TimeError`, `HttpError` from `client`.
- [`loginCallback`](client/login.md#symbol-loginCallback) (`code`: `string` from HTTP query, `state`: `string` from HTTP query, `browser`: `optional string` from HTTP cookie `aug_login`) → `HttpResponse<Html>`; can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, `HttpError` from `client`.
- [`startLogin`](client/login.md#symbol-startLogin) (no caller inputs) → `HttpResponse<Html>`; can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError` from `client`.
- [`logout`](client/logout.md#symbol-logout) (`input`: [`LogoutForm`](client/contracts.md#symbol-LogoutForm) from HTTP form, `token`: `optional string` from HTTP cookie `aug_session`, `origin`: `optional string` from HTTP header) → `HttpResponse<Html>`; can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError` from `client`.
- [`KeyError`](common/keys.md#symbol-KeyError) from `common`.
- [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) from `common`.
- [`initializeKeys`](common/keys.md#symbol-initializeKeys) (no caller inputs) → `void`; can fail with `CryptoError`, `KeyError` from `common`.
- [`authorize`](provider/authorization.md#symbol-authorize) (`response_type`: `string` from HTTP query, `client_id`: `string` from HTTP query, `redirect_uri`: `string` from HTTP query, `requestedScope`: `string` from HTTP query `scope`, `state`: `string` from HTTP query, `nonce`: `string` from HTTP query, `code_challenge`: `string` from HTTP query, `code_challenge_method`: `string` from HTTP query) → `HttpResponse<Html>`; can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, `HttpError` from `provider`.
- [`providerLogin`](provider/authorization.md#symbol-providerLogin) (`form`: [`LoginForm`](provider/contracts.md#symbol-LoginForm) from HTTP form, `browser`: `optional string` from HTTP cookie `aug_authorize`, `origin`: `optional string` from HTTP header `origin`) → `HttpResponse<Html>`; can fail with `CryptoError`, `TimeError`, `StoreFull`, `HttpError` from `provider`.
- [`LoginForm`](provider/contracts.md#symbol-LoginForm).
- [`UserInfo`](provider/contracts.md#symbol-UserInfo).
- [`Discovery`](provider/discovery.md#symbol-Discovery).
- [`discovery`](provider/discovery.md#symbol-discovery) (no caller inputs) → [`Discovery`](provider/discovery.md#symbol-Discovery) from `provider`.
- [`jwks`](provider/discovery.md#symbol-jwks) (no caller inputs) → [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks); can fail with `KeyError`, `CryptoError` from `provider`.
- [`token`](provider/token.md#symbol-token) (`http`: `HttpRequest` from HTTP request) → `HttpResponse<Json>`; can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError` from `provider`.
- [`userinfo`](provider/userinfo.md#symbol-userinfo) (`authorization`: `optional string` from HTTP header) → `HttpResponse<Json>`; can fail with `TimeError`, `HttpError` from `provider`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `exit`: Exit from main with a status from 0 to 255 after cancellation and cleanup.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::

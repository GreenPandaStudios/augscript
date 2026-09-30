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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Provide [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) for `Crypto`. Share one instance. Provide [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) for `Clock`. Share one instance. Provide [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) for `HttpClient`. Share one instance. Provide [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) for `SigningKeys`. Share one instance. Allow shared mutation. Provide [`MemoryStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<LoginTransaction>`. Share one instance. Allow shared mutation. Provide [`MemoryStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AuthorizationRequest>`. Share one instance. Allow shared mutation. Provide [`MemoryStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AuthorizationCode>`. Share one instance. Allow shared mutation. Provide [`MemoryStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<SessionClaims>`. Share one instance. Allow shared mutation. Provide [`MemoryStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) for `ExpiringStore<AccessGrant>`. Share one instance. Allow shared mutation.

### Startup

It tries to call [`initializeKeys`](common/keys.md#symbol-initializeKeys) using `Crypto` for `crypto`, `SigningKeys` for `keys`. If this attempt raises `CryptoError`, it catches it as `error` and calls `print` (`value` set to `"Cryptographic initialization failed"`); then it calls `exit` (`status` set to `1`). If this attempt raises [`KeyError`](common/keys.md#symbol-KeyError), it catches it as `error` and calls `print` (`value` set to `"Signing keys could not be initialized"`); then it calls `exit` (`status` set to `1`).

It serves [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`logout`](client/logout.md#symbol-logout), [`startLogin`](client/login.md#symbol-startLogin), [`loginCallback`](client/login.md#symbol-loginCallback), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`token`](provider/token.md#symbol-token), and [`userinfo`](provider/userinfo.md#symbol-userinfo) on port `8787`.

### Dependencies

The file uses [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`exportRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa) takes `publicKey` as `RsaPublicKey`. It returns `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. [`generateRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`Crypto.generateRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`. [`importRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa) takes `modulus` and `exponent` as `Bytes`. It returns `RsaPublicKey`. It can use [`Crypto.importRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`. [`passwordHash`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash) takes `password` and `salt` as `Bytes` and `iterations` as `int`. It returns `Bytes`. It can use [`Crypto.passwordHash`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash). It can fail with `CryptoError`. [`publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. [`random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) takes `size` as `int`. It returns `Bytes`. It can use [`Crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random). It can fail with `CryptoError`. [`sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) takes `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`. [`signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. [`verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`GnuTlsCrypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-GnuTlsCrypto) from `august.crypto`. The file uses [`JwtError`](dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError). The file uses [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

The file uses [`ExpiringStore`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). [`put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) takes `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It returns no value. It can use [`ExpiringStore.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`. [`take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

The file uses [`MemoryStore`](dependencies/august/0.19.0/memory/store.md#symbol-MemoryStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. The file uses [`StoreFull`](dependencies/august/0.19.0/memory/store.md#symbol-StoreFull). The file uses [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. The file uses [`SystemClock`](dependencies/august/0.19.0/time/contracts.md#symbol-SystemClock) from `august.time`.

The file uses [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient) from `august.web`. [`request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request) takes `method` and `url` as `string`, `headers` as `optional Headers` (omitted means null), and `body` as `optional Bytes` (omitted means null). It returns `HttpResponse<Bytes>`. It can use [`HttpClient.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request). It can fail with `HttpError`. The file uses [`WebHttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-WebHttpClient) from `august.web`. The file uses [`LoginTransaction`](client/contracts.md#symbol-LoginTransaction) from `client`. The file uses [`LogoutForm`](client/contracts.md#symbol-LogoutForm). The file uses [`SessionClaims`](client/contracts.md#symbol-SessionClaims) from `client`. The file uses [`SessionError`](client/contracts.md#symbol-SessionError).

[`home`](client/endpoints.md#symbol-home) from `client` takes `token` as `optional string` from HTTP cookie `aug_session` (omitted means null). It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `KeyError`, `TimeError`, and `HttpError`.

[`me`](client/endpoints.md#symbol-me) from `client` takes `token` as `optional string` from HTTP cookie `aug_session` (omitted means null). It returns `HttpResponse<UserInfo>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `SessionError`, `KeyError`, `TimeError`, and `HttpError`.

[`loginCallback`](client/login.md#symbol-loginCallback) from `client` takes `code` and `state` as `string` from HTTP query and `browser` as `optional string` from HTTP cookie `aug_login` (omitted means null). It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client` as [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys), `transactions` as [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `sessions` as [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.importRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.importRsa), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`transactions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`sessions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `SessionError`, `CryptoError`, `TimeError`, `KeyError`, `StoreFull`, `JwtError`, `JsonError`, and `HttpError`.

[`startLogin`](client/login.md#symbol-startLogin) from `client` takes no caller inputs. It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `client` as [`HttpClient`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient), and `transactions` as [`ExpiringStore<LoginTransaction>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`client.request`](dependencies/august/0.19.0/web/contracts.md#symbol-HttpClient.request), and [`transactions.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `SessionError`, `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`.

[`logout`](client/logout.md#symbol-logout) from `client` takes `input` as [`LogoutForm`](client/contracts.md#symbol-LogoutForm) from HTTP form, `token` as `optional string` from HTTP cookie `aug_session` (omitted means null), and `origin` as `optional string` from HTTP header (omitted means null). It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](common/keys.md#symbol-SigningKeys.session), [`sessions.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), and [`sessions.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). It can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, and `HttpError`. The file uses [`KeyError`](common/keys.md#symbol-KeyError) from `common`. The file uses [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys) from `common`.

The file uses [`SigningKeys`](common/keys.md#symbol-SigningKeys) from `common`. [`configure`](common/keys.md#symbol-SigningKeys.configure) takes `provider` and `session` as `RsaPrivateKey`. It returns no value. It can use [`SigningKeys.configure`](common/keys.md#symbol-SigningKeys.configure). It can fail with `KeyError`. [`provider`](common/keys.md#symbol-SigningKeys.provider) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.provider`](common/keys.md#symbol-SigningKeys.provider). It can fail with `KeyError`. [`session`](common/keys.md#symbol-SigningKeys.session) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.session`](common/keys.md#symbol-SigningKeys.session). It can fail with `KeyError`.

[`initializeKeys`](common/keys.md#symbol-initializeKeys) from `common` takes no caller inputs. It returns no value. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) and `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys). It can use [`crypto.generateRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) and [`keys.configure`](common/keys.md#symbol-SigningKeys.configure). It can fail with `CryptoError` and `KeyError`.

[`authorize`](provider/authorization.md#symbol-authorize) from `provider` takes `response_type`, `client_id`, and `redirect_uri` as `string` from HTTP query, `requestedScope` as `string` from HTTP query `scope`, and `state`, `nonce`, `code_challenge`, and `code_challenge_method` as `string` from HTTP query. It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), and `requests` as [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), and [`requests.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `LoginError`, `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`.

[`providerLogin`](provider/authorization.md#symbol-providerLogin) from `provider` takes `form` as [`LoginForm`](provider/contracts.md#symbol-LoginForm) from HTTP form, `browser` as `optional string` from HTTP cookie `aug_authorize` (omitted means null), and `origin` as `optional string` from HTTP header `origin` (omitted means null). It returns `HttpResponse<Html>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `requests` as [`ExpiringStore<AuthorizationRequest>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `codes` as [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.passwordHash`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.passwordHash), [`crypto.decodeBase64url`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`requests.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`codes.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `CryptoError`, `TimeError`, `StoreFull`, and `HttpError`. The file uses [`AccessGrant`](provider/contracts.md#symbol-AccessGrant) from `provider`. The file uses [`AuthorizationCode`](provider/contracts.md#symbol-AuthorizationCode) from `provider`.

The file uses [`AuthorizationRequest`](provider/contracts.md#symbol-AuthorizationRequest) from `provider`. The file uses [`LoginError`](provider/contracts.md#symbol-LoginError). The file uses [`LoginForm`](provider/contracts.md#symbol-LoginForm). The file uses [`UserInfo`](provider/contracts.md#symbol-UserInfo). The file uses [`Discovery`](provider/discovery.md#symbol-Discovery). [`discovery`](provider/discovery.md#symbol-discovery) from `provider` takes no caller inputs. It returns [`Discovery`](provider/discovery.md#symbol-Discovery). [`jwks`](provider/discovery.md#symbol-jwks) from `provider` takes no caller inputs. It returns [`RsaJwks`](dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) and `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys). It can use [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`crypto.exportRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `KeyError` and `CryptoError`.

[`token`](provider/token.md#symbol-token) from `provider` takes `http` as `HttpRequest` from HTTP request. It returns `HttpResponse<Json>`. Dependency injection supplies `crypto` as [`Crypto`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](common/keys.md#symbol-SigningKeys), `codes` as [`ExpiringStore<AuthorizationCode>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `access` as [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.sha256`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](common/keys.md#symbol-SigningKeys.provider), [`codes.take`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`access.put`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, and `HttpError`.

[`userinfo`](provider/userinfo.md#symbol-userinfo) from `provider` takes `authorization` as `optional string` from HTTP header (omitted means null). It returns `HttpResponse<Json>`. Dependency injection supplies `clock` as [`Clock`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock) and `access` as [`ExpiringStore<AccessGrant>`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`clock.now`](dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) and [`access.get`](dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `TimeError` and `HttpError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`exit`: Exit from main with a status from 0 to 255 after cancellation and cleanup. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::

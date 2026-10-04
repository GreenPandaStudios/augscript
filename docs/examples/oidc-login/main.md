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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzYwNzE1ZjA1NDA4NTkxMDFhZWNhOWIyNjkxMzgzNGNkNzc2NWU1MTI2ODE2ODAzMmYxYWY1Y2EzNjg2MzY2YyIsImZvcm1hdHRlZFNoYTI1NiI6IjEzMTQ1OWE0NzhjOGNlNDAwNGFiMGFjYjg5ZGRlNzg3MzQ1MDhiMmQ2M2ZhZTVmYmU3MjlkZjMyOTg1MTQ1NzQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIwLUwyOSIsImZpcnN0IjoxOCwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto and GnuTlsCrypto from crypto
import Clock and SystemClock from time
import HttpClient and WebHttpClient from web
import ExpiringStore and MemoryStore from memory
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzYwNzE1ZjA1NDA4NTkxMDFhZWNhOWIyNjkxMzgzNGNkNzc2NWU1MTI2ODE2ODAzMmYxYWY1Y2EzNjg2MzY2YyIsImZvcm1hdHRlZFNoYTI1NiI6IjZlMTU4YzE0NDMwOGVhMDM2ODdiMTJiMjRkMDBjNjM0ZDZhMTE0MWJmM2MzMGVkNDE4ZWE3NDUwMjA3Yzc4ZDciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIwLUwyOSIsImZpcnN0IjoxOCwibGFzdCI6MjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto and GnuTlsCrypto from crypto
import Clock and SystemClock from time
import HttpClient and WebHttpClient from web
import ExpiringStore and MemoryStore from memory
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

`Crypto` is provided by [`GnuTlsCrypto`](dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-GnuTlsCrypto). The same instance is shared. `Clock` is provided by [`SystemClock`](dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-SystemClock). The same instance is shared.

`HttpClient` is provided by [`WebHttpClient`](dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-WebHttpClient). The same instance is shared.

`SigningKeys` is provided by [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys). The same instance is shared. Shared mutation is allowed.

`ExpiringStore<LoginTransaction>` is provided by [`MemoryStore<LoginTransaction>`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore). The same instance is shared. Shared mutation is allowed.

`ExpiringStore<AuthorizationRequest>` is provided by [`MemoryStore<AuthorizationRequest>`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore). The same instance is shared. Shared mutation is allowed.

`ExpiringStore<AuthorizationCode>` is provided by [`MemoryStore<AuthorizationCode>`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore). The same instance is shared. Shared mutation is allowed.

`ExpiringStore<SessionClaims>` is provided by [`MemoryStore<SessionClaims>`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore). The same instance is shared. Shared mutation is allowed.

`ExpiringStore<AccessGrant>` is provided by [`MemoryStore<AccessGrant>`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore). The same instance is shared. Shared mutation is allowed.

### Startup

::: spec-paragraph specification-paragraph-1
It tries to call [`initializeKeys`](common/keys.md#symbol-initializeKeys) using injected `Crypto` for `crypto` and `SigningKeys` for `keys`. If this work raises `CryptoError`, it prints `"Cryptographic initialization failed"`; then it calls `exit` with `status` `1`. If this work raises [`KeyError`](common/keys.md#symbol-KeyError), it prints `"Signing keys could not be initialized"`; then it calls `exit` with `status` `1`. It serves [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`logout`](client/logout.md#symbol-logout), [`startLogin`](client/login.md#symbol-startLogin), [`loginCallback`](client/login.md#symbol-loginCallback), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`token`](provider/token.md#symbol-token), and [`userinfo`](provider/userinfo.md#symbol-userinfo) on port `8787`. [source](main.md#source-L20-L29)
:::

### Dependencies

It uses [`MemoryStore`](dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-MemoryStore) from `memory`. It uses [`WebHttpClient`](dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-WebHttpClient) from `web`. It uses [`GnuTlsCrypto`](dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-GnuTlsCrypto) from `crypto`. It uses [`SystemClock`](dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-SystemClock) from `time`.

It uses [`home`](client/endpoints.md#symbol-home), [`me`](client/endpoints.md#symbol-me), [`loginCallback`](client/login.md#symbol-loginCallback), [`startLogin`](client/login.md#symbol-startLogin), and [`logout`](client/logout.md#symbol-logout) from `client`. It uses [`KeyError`](common/keys.md#symbol-KeyError), [`MemorySigningKeys`](common/keys.md#symbol-MemorySigningKeys), and [`initializeKeys`](common/keys.md#symbol-initializeKeys) from `common`. It uses [`authorize`](provider/authorization.md#symbol-authorize), [`providerLogin`](provider/authorization.md#symbol-providerLogin), [`discovery`](provider/discovery.md#symbol-discovery), [`jwks`](provider/discovery.md#symbol-jwks), [`token`](provider/token.md#symbol-token), and [`userinfo`](provider/userinfo.md#symbol-userinfo) from `provider`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

---
title: "provider data flow"
generated: true
source: "examples/oidc-login/.aug-spec/diagrams/folders/provider/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider data flow

[OpenID Connect login application](../../../index.md)

[Project overview](../../index.md)

This view opens the provider folder one level deeper. Each arrow shows the called operation and the data it returns to its caller. Calls inside a file stay in that file’s sequence view.

### authorization request flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["common"]
    n2["authorization"]
    n3["credentials"]
    n4["views"]
    n0 -->|"2 HTTP routes → Html response"| n2
    n2 -->|"securityHeaders / settings + 1 more → Headers / Settings"| n1
    n2 -->|"verifyCredentials(username, password) → bool"| n3
    n2 -->|"ProviderFailure(message) / ProviderLogin(requestId, csrf, …) → Html"| n4
    n4 -->|"Page(title, children) → Html"| n1
```

### discovery request flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["common"]
    n2["discovery"]
    n0 -->|"2 HTTP routes → Discovery / RsaJwks"| n2
    n2 -->|"SigningKeys.provider / settings → RsaPrivateKey / Settings"| n1
```

### token request flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["common"]
    n2["token"]
    n0 -->|"POST /provider/token(http) → Json response"| n2
    n2 -->|"SigningKeys.provider / securityHeaders + 1 more → Headers / RsaPrivateKey + 1 more"| n1
```

### userinfo request flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["common"]
    n2["userinfo"]
    n0 -->|"GET /provider/userinfo(authorization) → Json response"| n2
    n2 -->|"securityHeaders → Headers"| n1
```

### Package boundaries

::: details authorization package calls

```mermaid
flowchart LR
    n0["memory"]
    n1["web"]
    n2["crypto"]
    n3["time"]
    n4["authorization"]
    n4 -->|"ExpiringStore.put(key, value, …) / ExpiringStore.take(key, now) → optional AuthorizationRequest"| n0
    n4 -->|"urlEncode(input) → string"| n1
    n4 -->|"Crypto.decodeBase64url(input) / Crypto.equal(left, right) + 1 more → Bytes / bool"| n2
    n4 -->|"Clock.now → int"| n3
```

:::

::: details credentials package calls

```mermaid
flowchart LR
    n0["crypto"]
    n1["credentials"]
    n1 -->|"Crypto.decodeBase64url(input) / Crypto.equal(left, right) + 1 more → Bytes / bool"| n0
```

:::

::: details discovery package calls

```mermaid
flowchart LR
    n0["crypto"]
    n1["discovery"]
    n1 -->|"Crypto.publicRsa(key) / rsaJwk(publicKey, kid) → RsaJwk / RsaPublicKey"| n0
```

:::

::: details token package calls

```mermaid
flowchart LR
    n0["memory"]
    n1["crypto"]
    n2["time"]
    n3["token"]
    n3 -->|"ExpiringStore.put(key, value, …) / ExpiringStore.take(key, now) → optional AuthorizationCode"| n0
    n3 -->|"Crypto.equal(left, right) / Crypto.random(size) + 2 more → Bytes / bool + 1 more"| n1
    n3 -->|"Clock.now → int"| n2
```

:::

::: details userinfo package calls

```mermaid
flowchart LR
    n0["memory"]
    n1["time"]
    n2["userinfo"]
    n2 -->|"ExpiringStore.get(key, now) → optional AccessGrant"| n0
    n2 -->|"Clock.now → int"| n1
```

:::

::: details Data crossing these boundaries (52 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| HTTP requests | authorization | [GET /provider/authorize](../../../provider/authorization.md#symbol-authorize) · response\_type: string from query, client\_id: string from query, redirect\_uri: string from query, requestedScope: string from query, state: string from query, nonce: string from query, code\_challenge: string from query, code\_challenge\_method: string from query · HTTP endpoint | HttpResponse\<Html\> |
| HTTP requests | authorization | [POST /provider/login](../../../provider/authorization.md#symbol-providerLogin) · form: LoginForm from form, browser: optional string from cookie, origin: optional string from header · HTTP endpoint | HttpResponse\<Html\> |
| HTTP requests | discovery | [GET /provider/.well-known/openid-configuration](../../../provider/discovery.md#symbol-discovery) · HTTP endpoint | Discovery |
| HTTP requests | discovery | [GET /provider/jwks](../../../provider/discovery.md#symbol-jwks) · HTTP endpoint | RsaJwks |
| HTTP requests | token | [POST /provider/token](../../../provider/token.md#symbol-token) · http: HttpRequest from request · HTTP endpoint | HttpResponse\<Json\> |
| HTTP requests | userinfo | [GET /provider/userinfo](../../../provider/userinfo.md#symbol-userinfo) · authorization: optional string from header · HTTP endpoint | HttpResponse\<Json\> |
| client | contracts | [IdClaims](../../../provider/contracts.md#symbol-IdClaims) · iss: string, sub: string, aud: string, exp: int, iat: int, nonce: string, name: string · value construction | IdClaims |
| client | contracts | [UserInfo](../../../provider/contracts.md#symbol-UserInfo) · sub: string, name: string · value construction | UserInfo |
| authorization | common | [securityHeaders](../../../common/headers.md#symbol-securityHeaders) | Headers |
| authorization | common | [settings](../../../common/settings.md#symbol-settings) | Settings |
| authorization | common | [withCookie](../../../common/headers.md#symbol-withCookie) · headers: Headers, name: string, value: string, path: string, maxAge: int, secure: bool | Headers |
| authorization | memory | [ExpiringStore.put](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) · key: string, value: AuthorizationCode, expires: int, now: int · interface dispatch | void |
| authorization | memory | [ExpiringStore.put](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) · key: string, value: AuthorizationRequest, expires: int, now: int · interface dispatch | void |
| authorization | memory | [ExpiringStore.take](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) · key: string, now: int · interface dispatch | optional AuthorizationRequest |
| authorization | web | [urlEncode](../../../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-urlEncode) · input: string | string |
| authorization | crypto | [Crypto.decodeBase64url](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url) · input: string · interface dispatch | Bytes |
| authorization | crypto | [Crypto.equal](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) · left: Bytes, right: Bytes · interface dispatch | bool |
| authorization | crypto | [Crypto.random](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) · size: int · interface dispatch | Bytes |
| authorization | time | [Clock.now](../../../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) · interface dispatch | int |
| authorization | contracts | [AuthorizationCode](../../../provider/contracts.md#symbol-AuthorizationCode) · clientId: string, redirectUri: string, challenge: string, nonce: string, subject: string, name: string, expires: int · value construction | AuthorizationCode |
| authorization | contracts | [AuthorizationRequest](../../../provider/contracts.md#symbol-AuthorizationRequest) · clientId: string, redirectUri: string, state: string, nonce: string, challenge: string, browser: string, csrf: string, expires: int · value construction | AuthorizationRequest |
| authorization | contracts | [LoginError](../../../provider/contracts.md#symbol-LoginError) · value construction | LoginError |
| authorization | credentials | [verifyCredentials](../../../provider/credentials.md#symbol-verifyCredentials) · username: string, password: string | bool |
| authorization | views | [ProviderFailure](../../../provider/views.md#symbol-ProviderFailure) · message: string | Html |
| authorization | views | [ProviderLogin](../../../provider/views.md#symbol-ProviderLogin) · requestId: string, csrf: string, message: string, submit: HttpAction | Html |
| credentials | crypto | [Crypto.decodeBase64url](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url) · input: string · interface dispatch | Bytes |
| credentials | crypto | [Crypto.equal](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) · left: Bytes, right: Bytes · interface dispatch | bool |
| credentials | crypto | [Crypto.passwordHash](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash) · password: Bytes, salt: Bytes, iterations: int · interface dispatch | Bytes |
| discovery | common | [SigningKeys.provider](../../../common/keys.md#symbol-SigningKeys.provider) · interface dispatch | RsaPrivateKey |
| discovery | common | [settings](../../../common/settings.md#symbol-settings) | Settings |
| discovery | crypto | [Crypto.publicRsa](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa) · key: RsaPrivateKey · interface dispatch | RsaPublicKey |
| discovery | crypto | [RsaJwks](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks) · keys: List\<RsaJwk\> · value construction | RsaJwks |
| discovery | crypto | [rsaJwk](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-rsaJwk) · publicKey: RsaPublicKey, kid: string | RsaJwk |
| token | common | [SigningKeys.provider](../../../common/keys.md#symbol-SigningKeys.provider) · interface dispatch | RsaPrivateKey |
| token | common | [securityHeaders](../../../common/headers.md#symbol-securityHeaders) | Headers |
| token | common | [settings](../../../common/settings.md#symbol-settings) | Settings |
| token | memory | [ExpiringStore.put](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) · key: string, value: AccessGrant, expires: int, now: int · interface dispatch | void |
| token | memory | [ExpiringStore.take](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) · key: string, now: int · interface dispatch | optional AuthorizationCode |
| token | crypto | [Crypto.equal](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) · left: Bytes, right: Bytes · interface dispatch | bool |
| token | crypto | [Crypto.random](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) · size: int · interface dispatch | Bytes |
| token | crypto | [Crypto.sha256](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.sha256) · input: Bytes · interface dispatch | Bytes |
| token | crypto | [signJwt](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) · key: RsaPrivateKey, claims: Json, kid: string, tokenType: string | string |
| token | time | [Clock.now](../../../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) · interface dispatch | int |
| token | contracts | [AccessGrant](../../../provider/contracts.md#symbol-AccessGrant) · subject: string, name: string, expires: int · value construction | AccessGrant |
| token | contracts | [IdClaims](../../../provider/contracts.md#symbol-IdClaims) · iss: string, sub: string, aud: string, exp: int, iat: int, nonce: string, name: string · value construction | IdClaims |
| token | contracts | [OAuthError](../../../provider/contracts.md#symbol-OAuthError) · error: string, error\_description: string · value construction | OAuthError |
| token | contracts | [TokenResponse](../../../provider/contracts.md#symbol-TokenResponse) · token\_type: string, access\_token: string, id\_token: string, expires\_in: int, scope: string · value construction | TokenResponse |
| userinfo | common | [securityHeaders](../../../common/headers.md#symbol-securityHeaders) | Headers |
| userinfo | memory | [ExpiringStore.get](../../../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get) · key: string, now: int · interface dispatch | optional AccessGrant |
| userinfo | time | [Clock.now](../../../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now) · interface dispatch | int |
| userinfo | contracts | [UserInfo](../../../provider/contracts.md#symbol-UserInfo) · sub: string, name: string · value construction | UserInfo |
| views | common | [Page](../../../common/views.md#symbol-Page) · title: string, children: List\<Html\> | Html |

:::

## Files in this folder

| Module | Read |
| --- | --- |
| provider/authorization.aug | [Flow and sequences](../../../provider/authorization-diagrams.md) · [Explanation](../../../provider/authorization.md) |
| provider/contracts.aug | [Flow and sequences](../../../provider/contracts-diagrams.md) · [Explanation](../../../provider/contracts.md) |
| provider/credentials.aug | [Flow and sequences](../../../provider/credentials-diagrams.md) · [Explanation](../../../provider/credentials.md) |
| provider/discovery.aug | [Flow and sequences](../../../provider/discovery-diagrams.md) · [Explanation](../../../provider/discovery.md) |
| provider/export.aug | [Flow and sequences](../../../provider/export-diagrams.md) · [Explanation](../../../provider/export.md) |
| provider/token.aug | [Flow and sequences](../../../provider/token-diagrams.md) · [Explanation](../../../provider/token.md) |
| provider/userinfo.aug | [Flow and sequences](../../../provider/userinfo-diagrams.md) · [Explanation](../../../provider/userinfo.md) |
| provider/views.aug | [Flow and sequences](../../../provider/views-diagrams.md) · [Explanation](../../../provider/views.md) |

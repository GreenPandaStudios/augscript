---
title: "client/login.aug diagrams"
generated: true
source: "examples/oidc-login/client/login.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/login.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](login.md)

## Class interactions

### loginCallback

#### View 1 of 3

```mermaid
flowchart LR
    n0["loginCallback"]
    n1["discover"]
    n2["responseJson"]
    n3["validateIdentity"]
    n4["securityHeaders"]
    n5["withCookie"]
    n6["SigningKeys"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n0 -->|"calls"| n5
    n0 -->|"calls session； depends on"| n6
```

#### View 2 of 3

```mermaid
flowchart LR
    n0["loginCallback"]
    n1["settings"]
    n2["ExpiringStore"]
    n3["HttpClient"]
    n4["urlEncode"]
    n5["Crypto"]
    n6["signJwt"]
    n0 -->|"calls"| n1
    n0 -->|"calls put； calls take； depends on"| n2
    n0 -->|"calls request； depends on"| n3
    n0 -->|"calls"| n4
    n0 -->|"calls equal； calls random； depends on"| n5
    n0 -->|"calls"| n6
```

#### View 3 of 3

```mermaid
flowchart LR
    n0["loginCallback"]
    n1["Clock"]
    n0 -->|"calls now； depends on"| n1
```

### startLogin

#### View 1 of 2

```mermaid
flowchart LR
    n0["startLogin"]
    n1["discover"]
    n2["securityHeaders"]
    n3["withCookie"]
    n4["settings"]
    n5["ExpiringStore"]
    n6["HttpClient"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n0 -->|"calls put； depends on"| n5
    n0 -->|"depends on"| n6
```

#### View 2 of 2

```mermaid
flowchart LR
    n0["startLogin"]
    n1["urlEncode"]
    n2["Crypto"]
    n3["Clock"]
    n0 -->|"calls"| n1
    n0 -->|"calls random； calls sha256； depends on"| n2
    n0 -->|"calls now； depends on"| n3
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### startLogin {#sequence-startLogin}

::: spec-paragraph specification-paragraph-1
[Source](login.md#source-L12)
:::

#### Sequence 1 of 3

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as common/settings
    participant p2 as client/protocol
    participant p3 as crypto: Crypto
    participant p4 as clock: Clock
    Note over p0: GET /login/start
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: discover()
    p2-->>p0: document: Discovery
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: random result: Bytes
    p0->>p0: random result.base64url()
    p0-->>p0: browser: string
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: random result 2: Bytes
    p0->>p0: random result 2.base64url()
    p0-->>p0: state: string
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: random result 3: Bytes
    p0->>p0: random result 3.base64url()
    p0-->>p0: nonce: string
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: random result 4: Bytes
    p0->>p0: random result 4.base64url()
    p0-->>p0: verifier: string
    p0->>p4: now() · interface dispatch
    p4-->>p0: now result: int
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as clock: Clock
    participant p2 as transactions: ExpiringStore
    participant p3 as crypto: Crypto
    participant p4 as web/contracts
    Note over p0: Sequence continued from the previous view
    p0->>p0: LoginTransaction(state=state, nonce=nonce,<br/>verifier=verifier, expires=now result + 300) · construct<br/>value
    p0-->>p0: transaction: LoginTransaction
    p0->>p1: now() · interface dispatch
    p1-->>p0: now result 2: int
    p0->>p2: put(key=browser, value=transaction,<br/>expires=transaction.expires, now=now result 2) ·<br/>interface dispatch
    p0->>p0: verifier.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p3: sha256(input=bytes result) · interface dispatch
    p3-->>p0: sha256 result: Bytes
    p0->>p0: sha256 result.base64url()
    p0-->>p0: challenge: string
    p0->>p4: urlEncode(input=config.clientId)
    p4-->>p0: urlEncode result: string
    p0->>p4: urlEncode(input=config.callback)
    p4-->>p0: urlEncode result 2: string
    p0->>p4: urlEncode(input=state)
    p4-->>p0: urlEncode result 3: string
    p0->>p4: urlEncode(input=nonce)
    p4-->>p0: urlEncode result 4: string
    p0->>p4: urlEncode(input=challenge)
    p4-->>p0: urlEncode result 5: string
    Note over p0: Set location to document.authorization_endpoint +<br/>”?response_type=code＆client_id=” + urlEncode result +<br/>”＆redirect_ur…
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as common/headers
    Note over p0: Sequence continued from the previous view
    p0->>p1: securityHeaders()
    p1-->>p0: securityHeaders result: Headers
    p0->>p0: securityHeaders result.with(name=”location”,<br/>value=location)
    p0-->>p0: with result: Headers
    p0->>p1: withCookie(headers=with result, name=”aug_login”,<br/>value=browser, path=”/login”, maxAge=300,<br/>secure=config.secureCookies)
    p1-->>p0: headers: Headers
    p0->>p0: HttpResponse(body=‹p›Opening the identity provider.‹/p›,<br/>status=303, headers=headers)
    p0-->>p0: HttpResponse result: HttpResponse‹Html›
    Note over p0: Return HttpResponse(body=‹p›Opening the identity<br/>provider.‹/p›, status=303, headers=headers)； required<br/>cleanup runs b…
    Note over p0: May leave with checked errors: CryptoError, HttpError,<br/>SessionError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

### loginCallback {#sequence-loginCallback}

::: spec-paragraph specification-paragraph-2
[Source](login.md#source-L27)
:::

#### Sequence 1 of 5

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as clock: Clock
    participant p2 as transactions: ExpiringStore
    participant p3 as crypto: Crypto
    Note over p0: GET /login/callback
    p0->>p0: code.isToken(min=43, max=43)
    p0-->>p0: isToken result: bool
    opt Left is false
    p0->>p0: state.isToken(min=43, max=43)
    p0-->>p0: isToken result 2: bool
    end
    alt not code.isToken(min=43, max=43)) or (not state.isToken(min=43, max=43)
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    alt Match when null:
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 2: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    else Match when some secret:
    p0->>p1: now() · interface dispatch
    p1-->>p0: now result: int
    p0->>p2: take(key=secret, now=now result) · interface dispatch
    p2-->>p0: take result: optional LoginTransaction
    alt Match when null:
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 3: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    else Match when some transaction:
    p0->>p0: transaction.state.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p0: state.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p3: equal(left=bytes result, right=bytes result 2) ·<br/>interface dispatch
    p3-->>p0: equal result: bool
    end
    end
```

#### Sequence 2 of 5 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as common/settings
    participant p2 as client/protocol
    participant p3 as web/contracts
    alt Continuing Match when some secret:
    alt Continuing Match when some transaction:
    alt not crypto.equal(left=transaction.state.bytes(), right=state.bytes())
    Note over p0: Sequence continued from the previous view
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 4: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: discover()
    p2-->>p0: document: Discovery
    p0->>p3: urlEncode(input=code)
    p3-->>p0: urlEncode result: string
    p0->>p3: urlEncode(input=config.callback)
    p3-->>p0: urlEncode result 2: string
    p0->>p3: urlEncode(input=config.clientId)
    p3-->>p0: urlEncode result 3: string
    p0->>p3: urlEncode(input=transaction.verifier)
    p3-->>p0: urlEncode result 4: string
    Note over p0: Set body to ”grant_type=authorization_code＆code=” +<br/>urlEncode result + ”＆redirect_uri=” + urlEncode result 2<br/>+ ”＆clie…
    p0->>p0: Headers()
    p0-->>p0: Headers result: Headers
    p0->>p0: Headers result.with(name=”content-type”,<br/>value=”application/x-www-form-urlencoded”)
    p0-->>p0: headers: Headers
    p0->>p0: body.bytes()
    p0-->>p0: bytes result 3: Bytes
    end
    end
```

#### Sequence 3 of 5 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as client: HttpClient
    participant p2 as client/protocol
    participant p3 as clock: Clock
    alt Continuing Match when some secret:
    alt Continuing Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: request(method=”POST”, url=document.token_endpoint,<br/>headers=headers, body=bytes result 3) · interface<br/>dispatch
    p1-->>p0: request result: HttpResponse‹Bytes›
    p0->>p2: responseJson(response=request result)
    p2-->>p0: responseJson result: Json
    p0->>p0: responseJson result.decode‹TokenResponse›()
    p0-->>p0: tokens: TokenResponse
    opt Left is false
    p0->>p0: tokens.access_token.isToken(min=43, max=43)
    p0-->>p0: isToken result 3: bool
    end
    alt tokens.token_type != ”Bearer” or (not tokens.access_token.isToken(min=43, max=43)) or tokens.expires_in ‹= 0
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 5: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p1: request(method=”GET”, url=document.jwks_uri) · interface<br/>dispatch
    p1-->>p0: request result 2: HttpResponse‹Bytes›
    p0->>p2: responseJson(response=request result 2)
    p2-->>p0: responseJson result 2: Json
    p0->>p0: responseJson result 2.decode‹RsaJwks›()
    p0-->>p0: jwks: RsaJwks
    p0->>p3: now() · interface dispatch
    p3-->>p0: now result 2: int
    p0->>p2: validateIdentity(token=tokens.id_token,<br/>nonce=transaction.nonce, now=now result 2, jwks=jwks)
    p2-->>p0: identity: IdClaims
    p0->>p0: Headers()
    p0-->>p0: Headers result 2: Headers
    end
    end
```

#### Sequence 4 of 5 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as client: HttpClient
    participant p2 as client/protocol
    participant p3 as clock: Clock
    participant p4 as crypto: Crypto
    alt Continuing Match when some secret:
    alt Continuing Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p0: Headers result 2.with(name=”authorization”,<br/>value=”Bearer ” + tokens.access_token)
    p0-->>p0: authHeaders: Headers
    p0->>p1: request(method=”GET”, url=document.userinfo_endpoint,<br/>headers=authHeaders) · interface dispatch
    p1-->>p0: request result 3: HttpResponse‹Bytes›
    p0->>p2: responseJson(response=request result 3)
    p2-->>p0: responseJson result 3: Json
    p0->>p0: responseJson result 3.decode‹UserInfo›()
    p0-->>p0: user: UserInfo
    alt user.sub != identity.sub
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 6: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p3: now() · interface dispatch
    p3-->>p0: now: int
    p0->>p4: random(size=32) · interface dispatch
    p4-->>p0: random result: Bytes
    p0->>p0: random result.base64url()
    p0-->>p0: base64url result: string
    p0->>p4: random(size=32) · interface dispatch
    p4-->>p0: random result 2: Bytes
    p0->>p0: random result 2.base64url()
    p0-->>p0: base64url result 2: string
    p0->>p0: SessionClaims(iss=config.baseUrl + ”/app”,<br/>sub=identity.sub, aud=”august-app”, exp=now +<br/>config.sessionSeconds, iat=n…
    p0-->>p0: session: SessionClaims
    end
    end
```

#### Sequence 5 of 5 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as keys: SigningKeys
    participant p2 as crypto/jose
    participant p3 as sessions: ExpiringStore
    participant p4 as common/headers
    alt Continuing Match when some secret:
    alt Continuing Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: session() · interface dispatch
    p1-->>p0: session result: RsaPrivateKey
    p0->>p0: Json(value=session)
    p0-->>p0: Json result: Json
    p0->>p2: signJwt(key=session result, claims=Json result,<br/>kid=”session-1”, tokenType=”august-session+jwt”)
    p2-->>p0: jwt: string
    p0->>p3: put(key=session.jti, value=session, expires=session.exp,<br/>now=now) · interface dispatch
    p0->>p4: securityHeaders()
    p4-->>p0: securityHeaders result: Headers
    p0->>p0: securityHeaders result.with(name=”location”, value=”/”)
    p0-->>p0: with result 3: Headers
    p0->>p4: withCookie(headers=with result 3, name=”aug_session”,<br/>value=jwt, path=”/”, maxAge=config.sessionSeconds,<br/>secure=confi…
    p4-->>p0: responseHeaders: Headers
    p0->>p4: withCookie(headers=responseHeaders, name=”aug_login”,<br/>value=””, path=”/login”, maxAge=0,<br/>secure=config.secureCookies)
    p4-->>p0: responseHeaders: Headers
    p0->>p0: HttpResponse(body=‹p›Signed in.‹/p›, status=303,<br/>headers=responseHeaders)
    p0-->>p0: HttpResponse result: HttpResponse‹Html›
    Note over p0: Return HttpResponse(body=‹p›Signed in.‹/p›, status=303,<br/>headers=responseHeaders)； required cleanup runs before<br/>exit
    end
    end
    Note over p0: May leave with checked errors: CryptoError, HttpError,<br/>JsonError, JwtError, KeyError, SessionError, StoreFull,<br/>TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

## Called contracts

- [LoginTransaction](contracts-diagrams.md#sequence-LoginTransaction-20-constructor) — client/contracts.aug
- [SessionClaims](contracts-diagrams.md#sequence-SessionClaims-20-constructor) — client/contracts.aug
- [SessionError](contracts-diagrams.md#sequence-SessionError-20-constructor) — client/contracts.aug
- [discover](protocol-diagrams.md#sequence-discover) — client/protocol.aug
- [responseJson](protocol-diagrams.md#sequence-responseJson) — client/protocol.aug
- [validateIdentity](protocol-diagrams.md#sequence-validateIdentity) — client/protocol.aug
- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [withCookie](../common/headers-diagrams.md#sequence-withCookie) — common/headers.aug
- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [SigningKeys.session](../common/keys-diagrams.md#sequence-SigningKeys.session) — common/keys.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.put](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.put) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.take](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.take) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [HttpClient](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [HttpClient.request](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-HttpClient.request) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [urlEncode](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-urlEncode) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.random](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.random) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.sha256](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.sha256) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [signJwt](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-signJwt) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

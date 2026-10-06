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

#### View 1 of 2

```mermaid
flowchart TD
    n0["LoginTransaction · client/contracts.aug"]
    n1["SessionClaims · client/contracts.aug"]
    n2["SessionError · client/contracts.aug"]
    n3["loginCallback · client/login.aug"]
    n4["startLogin · client/login.aug"]
    n5["discover · client/protocol.aug"]
    n6["responseJson · client/protocol.aug"]
    n7["validateIdentity · client/protocol.aug"]
    n8["securityHeaders · common/headers.aug"]
    n9["withCookie · common/headers.aug"]
    n10["SigningKeys · common/keys.aug"]
    n11["settings · common/settings.aug"]
    n12["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n13["HttpClient · package/@git/url_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n14["urlEncode · package/@git/url_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n15["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n16["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n17["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
    n3 -->|"calls"| n5
    n3 -->|"calls"| n6
    n3 -->|"calls"| n7
    n3 -->|"calls"| n8
    n3 -->|"calls"| n9
    n3 -->|"calls"| n10
    n3 -->|"depends on"| n10
    n3 -->|"calls"| n11
    n3 -->|"calls"| n12
    n3 -->|"depends on"| n12
    n3 -->|"calls"| n13
    n3 -->|"depends on"| n13
    n3 -->|"calls"| n14
    n3 -->|"calls"| n15
    n3 -->|"depends on"| n15
    n3 -->|"calls"| n16
    n3 -->|"calls"| n17
    n3 -->|"depends on"| n17
    n4 -->|"calls"| n0
    n4 -->|"calls"| n5
    n4 -->|"calls"| n8
    n4 -->|"calls"| n9
    n4 -->|"calls"| n11
    n4 -->|"calls"| n12
    n4 -->|"depends on"| n12
    n4 -->|"depends on"| n13
    n4 -->|"calls"| n14
    n4 -->|"calls"| n15
```

#### View 2 of 2

```mermaid
flowchart TD
    n0["startLogin · client/login.aug"]
    n1["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n2["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n0 -->|"depends on"| n1
    n0 -->|"calls"| n2
    n0 -->|"depends on"| n2
```

## API calls

#### View 1 of 2

```mermaid
flowchart TD
    n0["SessionClaims · client/contracts.aug"]
    n1["SessionError · client/contracts.aug"]
    n2["loginCallback · client/login.aug"]
    n3["discover · client/protocol.aug"]
    n4["responseJson · client/protocol.aug"]
    n5["validateIdentity · client/protocol.aug"]
    n6["securityHeaders · common/headers.aug"]
    n7["withCookie · common/headers.aug"]
    n8["SigningKeys.session · common/keys.aug"]
    n9["settings · common/settings.aug"]
    n10["ExpiringStore.put · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n11["ExpiringStore.take · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n12["HttpClient.request · package/@git/url_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contrac…"]
    n13["urlEncode · package/@git/url_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n14["Crypto.equal · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n15["Crypto.random · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n16["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n17["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
    n2 -->|"calls"| n3
    n2 -->|"calls"| n4
    n2 -->|"calls"| n5
    n2 -->|"calls"| n6
    n2 -->|"calls"| n7
    n2 -->|"calls"| n8
    n2 -->|"calls"| n9
    n2 -->|"calls"| n10
    n2 -->|"calls"| n11
    n2 -->|"calls"| n12
    n2 -->|"calls"| n13
    n2 -->|"calls"| n14
    n2 -->|"calls"| n15
    n2 -->|"calls"| n16
    n2 -->|"calls"| n17
```

#### View 2 of 2

```mermaid
flowchart TD
    n0["LoginTransaction · client/contracts.aug"]
    n1["startLogin · client/login.aug"]
    n2["discover · client/protocol.aug"]
    n3["securityHeaders · common/headers.aug"]
    n4["withCookie · common/headers.aug"]
    n5["settings · common/settings.aug"]
    n6["ExpiringStore.put · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n7["urlEncode · package/@git/url_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n8["Crypto.random · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n9["Crypto.sha256 · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n10["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n3
    n1 -->|"calls"| n4
    n1 -->|"calls"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n7
    n1 -->|"calls"| n8
    n1 -->|"calls"| n9
    n1 -->|"calls"| n10
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### startLogin {#sequence-startLogin}

::: spec-paragraph specification-paragraph-1
[Source](login.md#source-L12)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as settings
    participant p2 as discover
    participant p3 as Crypto.random
    participant p4 as crypto.random(size=32).base64url
    participant p5 as Clock.now
    participant p6 as LoginTransaction
    participant p7 as ExpiringStore.put
    participant p8 as verifier.bytes
    participant p9 as Crypto.sha256
    participant p10 as crypto.sha256(input=verifier.bytes()).base64url
    participant p11 as urlEncode
    Note over p0: GET /login/start
    p0->>p1: settings()
    p0->>p2: discover()
    p0->>p3: random(size) · interface dispatch
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size) · interface dispatch
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size) · interface dispatch
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size) · interface dispatch
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p5: now() · interface dispatch
    p0->>p6: LoginTransaction(state, nonce, verifier, expires)
    p0->>p5: now() · interface dispatch
    p0->>p7: put(key, value, expires, now) · interface dispatch
    p0->>p8: verifier.bytes()
    p0->>p9: sha256(input) · interface dispatch
    p0->>p10: crypto.sha256(input=verifier.bytes()).base64url()
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as securityHeaders
    participant p2 as securityHeaders().with
    participant p3 as withCookie
    participant p4 as HttpResponse
    Note over p0: Sequence continued from the previous view
    p0->>p1: securityHeaders()
    p0->>p2: securityHeaders().with(name, value)
    p0->>p3: withCookie(headers, name, value, path, maxAge, secure)
    p0->>p4: HttpResponse(body, status, headers)
    Note over p0: Return HttpResponse(body=#60;p#62;Opening the identity provider.#60;/p#62;, status=303, headers=headers)#59; required cleanup runs b…
    Note over p0: May leave with checked errors: CryptoError, HttpError, SessionError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

### loginCallback {#sequence-loginCallback}

::: spec-paragraph specification-paragraph-2
[Source](login.md#source-L27)
:::

#### Sequence 1 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as code.isToken
    participant p2 as state.isToken
    participant p3 as SessionError
    participant p4 as Clock.now
    participant p5 as ExpiringStore.take
    participant p6 as transaction.state.bytes
    participant p7 as state.bytes
    participant p8 as Crypto.equal
    participant p9 as settings
    participant p10 as discover
    participant p11 as urlEncode
    Note over p0: GET /login/callback
    p0->>p1: code.isToken(min, max)
    opt Left is false
    p0->>p2: state.isToken(min, max)
    end
    alt not code.isToken(min=43, max=43)) or (not state.isToken(min=43, max=43)
    p0->>p3: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    alt Match when null:
    p0->>p3: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    else Match when some secret:
    p0->>p4: now() · interface dispatch
    p0->>p5: take(key, now) · interface dispatch
    alt Match when null:
    p0->>p3: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    else Match when some transaction:
    p0->>p6: transaction.state.bytes()
    p0->>p7: state.bytes()
    p0->>p8: equal(left, right) · interface dispatch
    alt not crypto.equal(left=transaction.state.bytes(), right=state.bytes())
    p0->>p3: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p9: settings()
    p0->>p10: discover()
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    p0->>p11: urlEncode(input)
    end
    end
```

#### Sequence 2 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as Headers
    participant p2 as Headers().with
    participant p3 as body.bytes
    participant p4 as HttpClient.request
    participant p5 as responseJson
    participant p6 as responseJson(response=client.request(method=#34;POST#34;, url=document.token_endpoint, headers, body=body.bytes())).decode
    participant p7 as tokens.access_token.isToken
    participant p8 as SessionError
    participant p9 as responseJson(response=client.request(method=#34;GET#34;, url=document.jwks_uri)).decode
    participant p10 as Clock.now
    participant p11 as validateIdentity
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: Headers()
    p0->>p2: Headers().with(name, value)
    p0->>p3: body.bytes()
    p0->>p4: request(method, url, headers, body) · interface dispatch
    p0->>p5: responseJson(response)
    p0->>p6: responseJson(response=client.request(method=#34;POST#34;, url=document.token_endpoint, headers, body=body.bytes())).decode()
    opt Left is false
    p0->>p7: tokens.access_token.isToken(min, max)
    end
    opt Left is false
    end
    alt tokens.token_type != #34;Bearer#34; or (not tokens.access_token.isToken(min=43, max=43)) or tokens.expires_in #60;= 0
    p0->>p8: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p4: request(method, url) · interface dispatch
    p0->>p5: responseJson(response)
    p0->>p9: responseJson(response=client.request(method=#34;GET#34;, url=document.jwks_uri)).decode()
    p0->>p10: now() · interface dispatch
    p0->>p11: validateIdentity(token, nonce, now, jwks)
    p0->>p1: Headers()
    p0->>p2: Headers().with(name, value)
    p0->>p4: request(method, url, headers) · interface dispatch
    p0->>p5: responseJson(response)
    end
    end
```

#### Sequence 3 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as responseJson(response=client.request(method=#34;GET#34;, url=document.userinfo_endpoint, headers=authHeaders)).decode
    participant p2 as SessionError
    participant p3 as Clock.now
    participant p4 as Crypto.random
    participant p5 as crypto.random(size=32).base64url
    participant p6 as SessionClaims
    participant p7 as SigningKeys.session
    participant p8 as Json
    participant p9 as signJwt
    participant p10 as ExpiringStore.put
    participant p11 as securityHeaders
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: responseJson(response=client.request(method=#34;GET#34;, url=document.userinfo_endpoint, headers=authHeaders)).decode()
    alt user.sub != identity.sub
    p0->>p2: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p3: now() · interface dispatch
    p0->>p4: random(size) · interface dispatch
    p0->>p5: crypto.random(size=32).base64url()
    p0->>p4: random(size) · interface dispatch
    p0->>p5: crypto.random(size=32).base64url()
    p0->>p6: SessionClaims(iss, sub, aud, exp, iat, jti, csrf, name)
    p0->>p7: session() · interface dispatch
    p0->>p8: Json(value)
    p0->>p9: signJwt(key, claims, kid, tokenType)
    p0->>p10: put(key, value, expires, now) · interface dispatch
    p0->>p11: securityHeaders()
    end
    end
```

#### Sequence 4 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as securityHeaders().with
    participant p2 as withCookie
    participant p3 as HttpResponse
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: securityHeaders().with(name, value)
    p0->>p2: withCookie(headers, name, value, path, maxAge, secure)
    p0->>p2: withCookie(headers, name, value, path, maxAge, secure)
    p0->>p3: HttpResponse(body, status, headers)
    Note over p0: Return HttpResponse(body=#60;p#62;Signed in.#60;/p#62;, status=303, headers=responseHeaders)#59; required cleanup runs before exit
    end
    end
    Note over p0: May leave with checked errors: CryptoError, HttpError, JsonError, JwtError, KeyError, SessionError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
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

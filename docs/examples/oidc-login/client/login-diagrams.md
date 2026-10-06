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

```mermaid
flowchart TD
    n0["loginCallback"]
    n1["startLogin"]
    n2["discover"]
    n3["responseJson"]
    n4["validateIdentity"]
    n5["securityHeaders"]
    n6["withCookie"]
    n7["SigningKeys"]
    n8["settings"]
    n9["ExpiringStore"]
    n10["HttpClient"]
    n11["urlEncode"]
    n12["Crypto"]
    n13["signJwt"]
    n14["Clock"]
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n0 -->|"calls"| n5
    n0 -->|"calls"| n6
    n0 -->|"calls"| n7
    n0 -->|"depends on"| n7
    n0 -->|"calls"| n8
    n0 -->|"calls"| n9
    n0 -->|"depends on"| n9
    n0 -->|"calls"| n10
    n0 -->|"depends on"| n10
    n0 -->|"calls"| n11
    n0 -->|"calls"| n12
    n0 -->|"depends on"| n12
    n0 -->|"calls"| n13
    n0 -->|"calls"| n14
    n0 -->|"depends on"| n14
    n1 -->|"calls"| n2
    n1 -->|"calls"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n8
    n1 -->|"calls"| n9
    n1 -->|"depends on"| n9
    n1 -->|"depends on"| n10
    n1 -->|"calls"| n11
    n1 -->|"calls"| n12
    n1 -->|"depends on"| n12
    n1 -->|"calls"| n14
    n1 -->|"depends on"| n14
```

::: details Call relationships

#### View 1 of 2

```mermaid
flowchart TD
    n0["SessionClaims"]
    n1["SessionError"]
    n2["loginCallback"]
    n3["discover"]
    n4["responseJson"]
    n5["validateIdentity"]
    n6["securityHeaders"]
    n7["withCookie"]
    n8["SigningKeys.session"]
    n9["settings"]
    n10["ExpiringStore.put"]
    n11["ExpiringStore.take"]
    n12["HttpClient.request"]
    n13["urlEncode"]
    n14["Crypto.equal"]
    n15["Crypto.random"]
    n16["signJwt"]
    n17["Clock.now"]
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
    n0["LoginTransaction"]
    n1["startLogin"]
    n2["discover"]
    n3["securityHeaders"]
    n4["withCookie"]
    n5["settings"]
    n6["ExpiringStore.put"]
    n7["urlEncode"]
    n8["Crypto.random"]
    n9["Crypto.sha256"]
    n10["Clock.now"]
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

:::

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
    participant p3 as Crypto
    participant p4 as crypto.random(size=32).base64url
    participant p5 as Clock
    participant p6 as LoginTransaction
    participant p7 as ExpiringStore
    Note over p0: GET /login/start
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: discover()
    p2-->>p0: document: Discovery
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: Bytes
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: Bytes
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: Bytes
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p3: random(size=32) · interface dispatch
    p3-->>p0: Bytes
    p0->>p4: crypto.random(size=32).base64url()
    p0->>p5: now() · interface dispatch
    p5-->>p0: int
    p0->>p6: LoginTransaction(state=state, nonce=nonce, verifier=verifier, expires=clock.now() + 300)
    p6-->>p0: transaction: LoginTransaction
    p0->>p5: now() · interface dispatch
    p5-->>p0: int
    p0->>p7: put(key=browser, value=transaction, expires=transaction.expires, now=clock.now()) · interface dispatch
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as startLogin
    participant p1 as verifier.bytes
    participant p2 as Crypto
    participant p3 as crypto.sha256(input=verifier.bytes()).base64url
    participant p4 as urlEncode
    participant p5 as securityHeaders
    participant p6 as securityHeaders().with
    participant p7 as withCookie
    participant p8 as HttpResponse
    Note over p0: Sequence continued from the previous view
    p0->>p1: verifier.bytes()
    p0->>p2: sha256(input=verifier.bytes()) · interface dispatch
    p2-->>p0: Bytes
    p0->>p3: crypto.sha256(input=verifier.bytes()).base64url()
    p0->>p4: urlEncode(input=config.clientId)
    p4-->>p0: string
    p0->>p4: urlEncode(input=config.callback)
    p4-->>p0: string
    p0->>p4: urlEncode(input=state)
    p4-->>p0: string
    p0->>p4: urlEncode(input=nonce)
    p4-->>p0: string
    p0->>p4: urlEncode(input=challenge)
    p4-->>p0: string
    p0->>p5: securityHeaders()
    p5-->>p0: Headers
    p0->>p6: securityHeaders().with(name=”location”, value=location)
    p0->>p7: withCookie(headers=securityHeaders().with(name=”location”, value=location), name=”aug_login”, value=browser, path=”/l…
    p7-->>p0: headers: Headers
    p0->>p8: HttpResponse(body=‹p›Opening the identity provider.‹/p›, status=303, headers=headers)
    Note over p0: Return HttpResponse(body=‹p›Opening the identity provider.‹/p›, status=303, headers=headers)； required cleanup runs b…
    Note over p0: May leave with checked errors: CryptoError, HttpError, SessionError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping； unhandled request failure returns 500
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
    participant p4 as Clock
    participant p5 as ExpiringStore
    participant p6 as transaction.state.bytes
    participant p7 as state.bytes
    participant p8 as Crypto
    participant p9 as settings
    Note over p0: GET /login/callback
    p0->>p1: code.isToken(min=43, max=43)
    opt Left is false
    p0->>p2: state.isToken(min=43, max=43)
    end
    alt not code.isToken(min=43, max=43)) or (not state.isToken(min=43, max=43)
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    alt Match when null:
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    else Match when some secret:
    p0->>p4: now() · interface dispatch
    p4-->>p0: int
    p0->>p5: take(key=secret, now=clock.now()) · interface dispatch
    p5-->>p0: optional LoginTransaction
    alt Match when null:
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    else Match when some transaction:
    p0->>p6: transaction.state.bytes()
    p0->>p7: state.bytes()
    p0->>p8: equal(left=transaction.state.bytes(), right=state.bytes()) · interface dispatch
    p8-->>p0: bool
    alt not crypto.equal(left=transaction.state.bytes(), right=state.bytes())
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    p0->>p9: settings()
    end
    end
```

#### Sequence 2 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as settings
    participant p2 as discover
    participant p3 as urlEncode
    participant p4 as Headers
    participant p5 as Headers().with
    participant p6 as body.bytes
    participant p7 as HttpClient
    participant p8 as responseJson
    participant p9 as responseJson(response=client.request(method=”POST”, url=document.token_endpoint, headers, body=body.bytes())).decode
    participant p10 as tokens.access_token.isToken
    participant p11 as SessionError
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p1-->>p0: config: Settings
    p0->>p2: discover()
    p2-->>p0: document: Discovery
    p0->>p3: urlEncode(input=code)
    p3-->>p0: string
    p0->>p3: urlEncode(input=config.callback)
    p3-->>p0: string
    p0->>p3: urlEncode(input=config.clientId)
    p3-->>p0: string
    p0->>p3: urlEncode(input=transaction.verifier)
    p3-->>p0: string
    p0->>p4: Headers()
    p0->>p5: Headers().with(name=”content-type”, value=”application/x-www-form-urlencoded”)
    p0->>p6: body.bytes()
    p0->>p7: request(method=”POST”, url=document.token_endpoint, headers=headers, body=body.bytes()) · interface dispatch
    p7-->>p0: HttpResponse‹Bytes›
    p0->>p8: responseJson(response=client.request(method=”POST”, url=document.token_endpoint, headers, body=body.bytes()))
    p8-->>p0: Json
    p0->>p9: responseJson(response=client.request(method=”POST”, url=document.token_endpoint, headers, body=body.bytes())).decode()
    opt Left is false
    p0->>p10: tokens.access_token.isToken(min=43, max=43)
    end
    opt Left is false
    end
    alt tokens.token_type != ”Bearer” or (not tokens.access_token.isToken(min=43, max=43)) or tokens.expires_in ‹= 0
    p0->>p11: SessionError()
    p11-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    end
    end
```

#### Sequence 3 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as HttpClient
    participant p2 as responseJson
    participant p3 as responseJson(response=client.request(method=”GET”, url=document.jwks_uri)).decode
    participant p4 as Clock
    participant p5 as validateIdentity
    participant p6 as Headers
    participant p7 as Headers().with
    participant p8 as responseJson(response=client.request(method=”GET”, url=document.userinfo_endpoint, headers=authHeaders)).decode
    participant p9 as SessionError
    participant p10 as Crypto
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: request(method=”GET”, url=document.jwks_uri) · interface dispatch
    p1-->>p0: HttpResponse‹Bytes›
    p0->>p2: responseJson(response=client.request(method=”GET”, url=document.jwks_uri))
    p2-->>p0: Json
    p0->>p3: responseJson(response=client.request(method=”GET”, url=document.jwks_uri)).decode()
    p0->>p4: now() · interface dispatch
    p4-->>p0: int
    p0->>p5: validateIdentity(token=tokens.id_token, nonce=transaction.nonce, now=clock.now(), jwks=jwks)
    p5-->>p0: identity: IdClaims
    p0->>p6: Headers()
    p0->>p7: Headers().with(name=”authorization”, value=”Bearer ” + tokens.access_token)
    p0->>p1: request(method=”GET”, url=document.userinfo_endpoint, headers=authHeaders) · interface dispatch
    p1-->>p0: HttpResponse‹Bytes›
    p0->>p2: responseJson(response=client.request(method=”GET”, url=document.userinfo_endpoint, headers=authHeaders))
    p2-->>p0: Json
    p0->>p8: responseJson(response=client.request(method=”GET”, url=document.userinfo_endpoint, headers=authHeaders)).decode()
    alt user.sub != identity.sub
    p0->>p9: SessionError()
    p9-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    p0->>p4: now() · interface dispatch
    p4-->>p0: now: int
    p0->>p10: random(size=32) · interface dispatch
    p10-->>p0: Bytes
    end
    end
```

#### Sequence 4 of 4 (continued)

```mermaid
sequenceDiagram
    participant p0 as loginCallback
    participant p1 as crypto.random(size=32).base64url
    participant p2 as Crypto
    participant p3 as SessionClaims
    participant p4 as SigningKeys
    participant p5 as Json
    participant p6 as signJwt
    participant p7 as ExpiringStore
    participant p8 as securityHeaders
    participant p9 as securityHeaders().with
    participant p10 as withCookie
    participant p11 as HttpResponse
    alt Match when null:
    else Match when some secret:
    alt Match when null:
    else Match when some transaction:
    Note over p0: Sequence continued from the previous view
    p0->>p1: crypto.random(size=32).base64url()
    p0->>p2: random(size=32) · interface dispatch
    p2-->>p0: Bytes
    p0->>p1: crypto.random(size=32).base64url()
    p0->>p3: SessionClaims(iss=config.baseUrl + ”/app”, sub=identity.sub, aud=”august-app”, exp=now + config.sessionSeconds, iat=n…
    p3-->>p0: session: SessionClaims
    p0->>p4: session() · interface dispatch
    p4-->>p0: RsaPrivateKey
    p0->>p5: Json(value=session)
    p0->>p6: signJwt(key=keys.session(), claims=Json(value=session), kid=”session-1”, tokenType=”august-session+jwt”)
    p6-->>p0: jwt: string
    p0->>p7: put(key=session.jti, value=session, expires=session.exp, now=now) · interface dispatch
    p0->>p8: securityHeaders()
    p8-->>p0: Headers
    p0->>p9: securityHeaders().with(name=”location”, value=”/”)
    p0->>p10: withCookie(headers=securityHeaders().with(name=”location”, value=”/”), name=”aug_session”, value=jwt, path=”/”, maxAg…
    p10-->>p0: responseHeaders: Headers
    p0->>p10: withCookie(headers=responseHeaders, name=”aug_login”, value=””, path=”/login”, maxAge=0, secure=config.secureCookies)
    p10-->>p0: responseHeaders: Headers
    p0->>p11: HttpResponse(body=‹p›Signed in.‹/p›, status=303, headers=responseHeaders)
    Note over p0: Return HttpResponse(body=‹p›Signed in.‹/p›, status=303, headers=responseHeaders)； required cleanup runs before exit
    end
    end
    Note over p0: May leave with checked errors: CryptoError, HttpError, JsonError, JwtError, KeyError, SessionError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping； unhandled request failure returns 500
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

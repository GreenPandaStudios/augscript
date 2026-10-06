---
title: "client/protocol.aug diagrams"
generated: true
source: "examples/oidc-login/client/protocol.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/protocol.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](protocol.md)

## Class interactions

```mermaid
flowchart TD
    n0["discover"]
    n1["responseJson"]
    n2["validateIdentity"]
    n3["settings"]
    n4["client/protocol.aug"]
    n5["HttpClient"]
    n6["Crypto"]
    n7["importJwk"]
    n8["rsaJwk"]
    n9["signJwt"]
    n10["verifyJwt"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n3
    n0 -->|"calls"| n5
    n0 -->|"depends on"| n5
    n2 -->|"calls"| n3
    n2 -->|"calls"| n6
    n2 -->|"depends on"| n6
    n2 -->|"calls"| n7
    n2 -->|"calls"| n10
    n4 -->|"calls"| n2
    n4 -->|"calls"| n3
    n4 -->|"calls"| n6
    n4 -->|"calls"| n8
    n4 -->|"calls"| n9
```

::: details Call relationships

```mermaid
flowchart TD
    n0["SessionError"]
    n1["discover"]
    n2["responseJson"]
    n3["validateIdentity"]
    n4["settings"]
    n5["client/protocol.aug"]
    n6["parse"]
    n7["HttpClient.request"]
    n8["Crypto.equal"]
    n9["Crypto.generateRsa"]
    n10["Crypto.publicRsa"]
    n11["RsaJwks"]
    n12["importJwk"]
    n13["rsaJwk"]
    n14["signJwt"]
    n15["verifyJwt"]
    n16["IdClaims"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n4
    n1 -->|"calls"| n7
    n2 -->|"calls"| n0
    n2 -->|"calls"| n6
    n3 -->|"calls"| n0
    n3 -->|"calls"| n4
    n3 -->|"calls"| n8
    n3 -->|"calls"| n12
    n3 -->|"calls"| n15
    n5 -->|"calls"| n3
    n5 -->|"calls"| n4
    n5 -->|"calls"| n9
    n5 -->|"calls"| n10
    n5 -->|"calls"| n11
    n5 -->|"calls"| n13
    n5 -->|"calls"| n14
    n5 -->|"calls"| n16
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### responseJson {#sequence-responseJson}

::: spec-paragraph specification-paragraph-1
[Source](protocol.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as responseJson
    participant p1 as SessionError
    participant p2 as response.headers.get
    participant p3 as contentType.startsWith
    participant p4 as response.body.text
    participant p5 as parse
    alt response.status != 200
    p0->>p1: SessionError()
    p1-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    p0->>p2: response.headers.get(name=”content-type”)
    alt Match when null:
    p0->>p1: SessionError()
    p1-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    else Match when some contentType:
    p0->>p3: contentType.startsWith(prefix=”application/json”)
    alt not contentType.startsWith(prefix=”application/json”)
    p0->>p1: SessionError()
    p1-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    end
    opt Try body； stops on a checked failure
    p0->>p4: response.body.text()
    p0->>p5: parse(input=response.body.text())
    p5-->>p0: Json
    Note over p0: Return parse(input=response.body.text())； required cleanup runs before exit
    end
    opt Catch ConversionError
    p0->>p1: SessionError()
    p1-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p1: SessionError()
    p1-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: SessionError
```

### discover {#sequence-discover}

::: spec-paragraph specification-paragraph-2
[Source](protocol.md#source-L27)
:::

```mermaid
sequenceDiagram
    participant p0 as discover
    participant p1 as settings
    participant p2 as client: HttpClient
    participant p3 as responseJson
    participant p4 as json.decode
    participant p5 as SessionError
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: request(method=”GET”, url=config.issuer + ”/.well-known/openid-configuration”) · interface dispatch
    p2-->>p0: HttpResponse‹Bytes›
    p0->>p3: responseJson(response=client.request(method=”GET”, url=config.issuer + ”/.well-known/openid-configuration”))
    p3-->>p0: json: Json
    opt Try body； stops on a checked failure
    p0->>p4: json.decode()
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    alt document.issuer != config.issuer or document.authorization_endpoint != config.issuer + ”/authorize” or document.token…
    p0->>p5: SessionError()
    p5-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    Note over p0: Return document； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p5: SessionError()
    p5-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: HttpError, SessionError
```

### validateIdentity {#sequence-validateIdentity}

::: spec-paragraph specification-paragraph-3
[Source](protocol.md#source-L39)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as validateIdentity
    participant p1 as settings
    participant p2 as jwks.keys.length
    participant p3 as SessionError
    participant p4 as jwks.keys.get
    participant p5 as importJwk
    participant p6 as verifyJwt
    participant p7 as verifyJwt(token, publicKey, kid=”provider-1”, tokenType=”JWT”).decode
    participant p8 as claims.sub.length
    participant p9 as claims.nonce.bytes
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: jwks.keys.length()
    alt jwks.keys.length() != 1
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Try body； stops on a checked failure
    p0->>p4: jwks.keys.get(index=0)
    alt jwk.kid != ”provider-1”
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    p0->>p5: importJwk(jwk=jwk)
    p5-->>p0: publicKey: RsaPublicKey
    p0->>p6: verifyJwt(token=token, publicKey=publicKey, kid=”provider-1”, tokenType=”JWT”)
    p6-->>p0: Json
    p0->>p7: verifyJwt(token, publicKey, kid=”provider-1”, tokenType=”JWT”).decode()
    opt Left is false
    end
    opt Left is false
    p0->>p8: claims.sub.length()
    end
    opt Left is false
    p0->>p8: claims.sub.length()
    end
    alt claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() › 255
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    alt claims.exp ‹= now or claims.iat ‹ now - 300 or claims.iat › now + 30 or claims.exp ‹= claims.iat or claims.exp › now …
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    p0->>p9: claims.nonce.bytes()
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as validateIdentity
    participant p1 as nonce.bytes
    participant p2 as crypto: Crypto
    participant p3 as SessionError
    opt Try body； stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p0->>p1: nonce.bytes()
    p0->>p2: equal(left=claims.nonce.bytes(), right=nonce.bytes()) · interface dispatch
    p2-->>p0: bool
    alt not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes())
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    Note over p0: Return claims； required cleanup runs before exit
    end
    opt Catch JwtError
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Catch IndexError
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p3: SessionError()
    p3-->>p0: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: SessionError
```

## Called contracts

- [SessionError](contracts-diagrams.md#sequence-SessionError-20-constructor) — client/contracts.aug
- [responseJson](protocol-diagrams.md#sequence-responseJson) — client/protocol.aug
- [validateIdentity](protocol-diagrams.md#sequence-validateIdentity) — client/protocol.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [parse](../dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-parse) — package/@git/url\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [HttpClient](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [HttpClient.request](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-HttpClient.request) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.generateRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.generateRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.publicRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.publicRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [RsaJwks](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-RsaJwks-20-constructor) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [importJwk](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-importJwk) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [rsaJwk](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-rsaJwk) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [signJwt](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-signJwt) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [verifyJwt](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-verifyJwt) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [IdClaims](../provider/contracts-diagrams.md#sequence-IdClaims-20-constructor) — provider/contracts.aug

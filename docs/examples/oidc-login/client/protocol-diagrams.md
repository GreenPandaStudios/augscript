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

### discover

```mermaid
flowchart LR
    n0["discover"]
    n1["responseJson"]
    n2["settings"]
    n3["HttpClient"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls request； depends on"| n3
```

### validateIdentity

```mermaid
flowchart LR
    n0["validateIdentity"]
    n1["settings"]
    n2["Crypto"]
    n3["importJwk"]
    n4["verifyJwt"]
    n0 -->|"calls"| n1
    n0 -->|"calls equal； depends on"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
```

### module:client/protocol.aug

```mermaid
flowchart LR
    n0["validateIdentity"]
    n1["settings"]
    n2["client/protocol.aug"]
    n3["Crypto"]
    n4["rsaJwk"]
    n5["signJwt"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n1
    n2 -->|"calls generateRsa； calls publicRsa"| n3
    n2 -->|"calls"| n4
    n2 -->|"calls"| n5
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### responseJson {#sequence-responseJson}

::: spec-paragraph specification-paragraph-1
[Source](protocol.md#source-L10)
:::

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport.

It takes `response` as `HttpResponse<Bytes>`.

Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

#### Sequence 1 of 2

```mermaid
sequenceDiagram
    participant p0 as responseJson
    participant p1 as json/contracts
    alt response.status does not equal 200
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p0: response.headers.get(name=”content-type”)
    p0-->>p0: get result: optional string
    alt Match when null:
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 2: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    else Match when some contentType:
    p0->>p0: contentType.startsWith(prefix=”application/json”)
    p0-->>p0: startsWith result: bool
    alt contentType.startsWith with prefix ”application/json”<br/>returns false
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 3: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    end
    opt Try body； stops on a checked failure
    p0->>p0: response.body.text()
    p0-->>p0: text result: string
    p0->>p1: parse(input=text result)
    p1-->>p0: parse result: Json
    Note over p0: Return parse(input=response.body.text())； required<br/>cleanup runs before exit
    end
    opt Catch ConversionError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 4: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Catch JsonError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 5: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as responseJson

    Note over p0: Sequence continued from the previous view
    Note over p0: May leave with checked errors: SessionError
```

### discover {#sequence-discover}

::: spec-paragraph specification-paragraph-2
[Source](protocol.md#source-L27)
:::

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent.

It gets `client` ([`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient)) from dependency injection.

It can call [`HttpClient.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request). Failures can raise `HttpError` and [`SessionError`](contracts.md#symbol-SessionError).

```mermaid
sequenceDiagram
    participant p0 as discover
    participant p1 as common/settings
    participant p2 as client: HttpClient
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p2: request(method=”GET”, url=config.issuer +<br/>”/.well-known/openid-configuration”) · interface<br/>dispatch
    p2-->>p0: request result: HttpResponse‹Bytes›
    p0->>p0: responseJson(response=request result)
    p0-->>p0: json: Json
    opt Try body； stops on a checked failure
    p0->>p0: json.decode‹Discovery›()
    p0-->>p0: document: Discovery
    alt document.issuer does not equal config.issuer or<br/>document.authorization_endpoint does not equal the text<br/>｛config.issuer｝/authorize or document.token_endpoint<br/>does not equal the text ｛config.issuer｝/token or<br/>document.jwks_uri does not equal the text<br/>｛config.issuer｝/jwks or document.userinfo_endpoint does<br/>not equal the text ｛config.issuer｝/userinfo
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    Note over p0: Return document； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 2: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    Note over p0: May leave with checked errors: HttpError, SessionError
```

### validateIdentity {#sequence-validateIdentity}

::: spec-paragraph specification-paragraph-3
[Source](protocol.md#source-L39)
:::

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce.

It takes `token` and `nonce` as strings, `now` as an integer, and `jwks` as [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks). It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection.

It can call [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`Crypto.importRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.importRsa), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa). Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

#### Sequence 1 of 3

```mermaid
sequenceDiagram
    participant p0 as validateIdentity
    participant p1 as common/settings
    participant p2 as crypto/jose
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p0: jwks.keys.length()
    p0-->>p0: length result: int
    alt the number of elements in jwks.keys does not equal 1
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Try body； stops on a checked failure
    p0->>p0: jwks.keys.get(index=0)
    p0-->>p0: jwk: RsaJwk
    alt jwk.kid does not equal ”provider-1”
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 2: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p2: importJwk(jwk=jwk)
    p2-->>p0: publicKey: RsaPublicKey
    p0->>p2: verifyJwt(token=token, publicKey=publicKey,<br/>kid=”provider-1”, tokenType=”JWT”)
    p2-->>p0: verifyJwt result: Json
    p0->>p0: verifyJwt result.decode‹IdClaims›()
    p0-->>p0: claims: IdClaims
    opt (claims.iss != config.issuer or claims.aud !=<br/>config.clientId) is false
    p0->>p0: claims.sub.length()
    p0-->>p0: length result 2: int
    end
    opt (claims.iss != config.issuer or claims.aud !=<br/>config.clientId or length result 2 == 0) is false
    p0->>p0: claims.sub.length()
    p0-->>p0: length result 3: int
    end
    alt claims.iss does not equal config.issuer or claims.aud<br/>does not equal config.clientId or the byte length of<br/>claims.sub equals 0 or the byte length of claims.sub is<br/>greater than 255
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 3: SessionError
    end
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as validateIdentity
    participant p1 as crypto: Crypto
    opt Try body； stops on a checked failure
    alt claims.iss does not equal config.issuer or claims.aud<br/>does not equal config.clientId or the byte length of<br/>claims.sub equals 0 or the byte length of claims.sub is<br/>greater than 255
    Note over p0: Sequence continued from the previous view
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    alt claims.exp is at most now or claims.iat is less than<br/>(now minus 300) or claims.iat is greater than (now plus<br/>30) or claims.exp is at most claims.iat or claims.exp is<br/>greater than (now plus 330)
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 4: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p0: claims.nonce.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p0: nonce.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p1: equal(left=bytes result, right=bytes result 2) ·<br/>interface dispatch
    p1-->>p0: equal result: bool
    alt crypto.equal with left from the UTF-8 bytes of<br/>claims.nonce and right from the UTF-8 bytes of nonce<br/>returns false
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 5: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    Note over p0: Return claims； required cleanup runs before exit
    end
    opt Catch JwtError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 6: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Catch JsonError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 7: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Catch IndexError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 8: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as validateIdentity

    opt Catch CryptoError
    Note over p0: Sequence continued from the previous view
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 9: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
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

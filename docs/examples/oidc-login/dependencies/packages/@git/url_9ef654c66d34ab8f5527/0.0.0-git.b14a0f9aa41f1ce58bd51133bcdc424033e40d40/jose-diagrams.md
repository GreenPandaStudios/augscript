---
title: "package/@git/url\\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug diagrams"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](jose.md)

## Class interactions

```mermaid
flowchart TD
    n0["parse"]
    n1["Crypto"]
    n2["importJwk"]
    n3["rsaJwk"]
    n4["signJwt"]
    n5["verifyJwt"]
    n2 -->|"calls decodeBase64url； calls importRsa； depends on"| n1
    n3 -->|"calls exportRsa； depends on"| n1
    n4 -->|"calls signRsa； depends on"| n1
    n5 -->|"calls"| n0
    n5 -->|"calls decodeBase64url； calls verifyRsa； depends on"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### JwtError constructor {#sequence-JwtError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](jose.md#source-L7)
:::

[Explanation](jose.md).

### JwtHeader constructor {#sequence-JwtHeader-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](jose.md#source-L10)
:::

Receive fields: alg, kid, typ. [Explanation](jose.md).

### RsaJwk constructor {#sequence-RsaJwk-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](jose.md#source-L12)
:::

Receive fields: kty, kid, alg, use, n, e. [Explanation](jose.md).

### RsaJwks constructor {#sequence-RsaJwks-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](jose.md#source-L13)
:::

Receive fields: keys. [Explanation](jose.md).

### rsaJwk {#sequence-rsaJwk}

::: spec-paragraph specification-paragraph-5
[Source](jose.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as rsaJwk
    participant p1 as crypto: Crypto
    p0->>p1: exportRsa(publicKey=publicKey) · interface dispatch
    p1-->>p0: exportRsa result: Tuple‹Bytes, Bytes›
    p0->>p0: modulus.base64url()
    p0-->>p0: base64url result: string
    p0->>p0: exponent.base64url()
    p0-->>p0: base64url result 2: string
    p0->>p0: RsaJwk(kty=”RSA”, kid=kid, alg=”RS256”, use=”sig”,<br/>n=base64url result, e=base64url result 2) · construct<br/>value
    p0-->>p0: RsaJwk result: RsaJwk
    Note over p0: Return RsaJwk(kty=”RSA”, kid=kid, alg=”RS256”,<br/>use=”sig”, n=modulus.base64url(),<br/>e=exponent.base64url())； required cl…
    Note over p0: May leave with checked errors: CryptoError
```

### importJwk {#sequence-importJwk}

::: spec-paragraph specification-paragraph-6
[Source](jose.md#source-L21)
:::

```mermaid
sequenceDiagram
    participant p0 as importJwk
    participant p1 as crypto: Crypto
    alt jwk.kty != ”RSA” or jwk.alg != ”RS256” or jwk.use != ”sig”
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Try body； stops on a checked failure
    p0->>p1: decodeBase64url(input=jwk.n) · interface dispatch
    p1-->>p0: modulus: Bytes
    p0->>p1: decodeBase64url(input=jwk.e) · interface dispatch
    p1-->>p0: exponent: Bytes
    p0->>p1: importRsa(modulus=modulus, exponent=exponent) ·<br/>interface dispatch
    p1-->>p0: importRsa result: RsaPublicKey
    Note over p0: Return crypto.importRsa(modulus, exponent)； required<br/>cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 2: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

### signJwt {#sequence-signJwt}

::: spec-paragraph specification-paragraph-7
[Source](jose.md#source-L32)
:::

#### Sequence 1 of 2

```mermaid
sequenceDiagram
    participant p0 as signJwt
    participant p1 as crypto: Crypto
    opt Try body； stops on a checked failure
    p0->>p0: JwtHeader(alg=”RS256”, kid=kid, typ=tokenType) ·<br/>construct value
    p0-->>p0: JwtHeader result: JwtHeader
    p0->>p0: Json(value=JwtHeader result)
    p0-->>p0: Json result: Json
    p0->>p0: Json result.stringify()
    p0-->>p0: header: string
    p0->>p0: claims.stringify()
    p0-->>p0: payload: string
    p0->>p0: header.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p0: bytes result.base64url()
    p0-->>p0: base64url result: string
    p0->>p0: payload.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p0: bytes result 2.base64url()
    p0-->>p0: base64url result 2: string
    Note over p0: Set signing to base64url result + ”.” + base64url result<br/>2
    p0->>p0: signing.bytes()
    p0-->>p0: bytes result 3: Bytes
    p0->>p1: signRsa(key=key, input=bytes result 3) · interface<br/>dispatch
    p1-->>p0: signature: Bytes
    p0->>p0: signature.base64url()
    p0-->>p0: base64url result 3: string
    Note over p0: Return signing + ”.” + signature.base64url()； required<br/>cleanup runs before exit
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as signJwt

    opt Catch CryptoError
    Note over p0: Sequence continued from the previous view
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Catch JsonError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 2: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

### verifyJwt {#sequence-verifyJwt}

::: spec-paragraph specification-paragraph-8
[Source](jose.md#source-L45)
:::

#### Sequence 1 of 3

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as crypto: Crypto
    participant p2 as json/contracts
    p0->>p0: token.length()
    p0-->>p0: length result: int
    alt token.length() › 16384
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    p0->>p0: token.split(separator=”.”)
    p0-->>p0: parts: List‹string›
    p0->>p0: parts.length()
    p0-->>p0: length result 2: int
    alt parts.length() != 3
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 2: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Try body； stops on a checked failure
    p0->>p0: parts.get(index=0)
    p0-->>p0: first: string
    p0->>p0: parts.get(index=1)
    p0-->>p0: second: string
    p0->>p0: parts.get(index=2)
    p0-->>p0: third: string
    p0->>p1: decodeBase64url(input=first) · interface dispatch
    p1-->>p0: decodeBase64url result: Bytes
    p0->>p0: decodeBase64url result.text()
    p0-->>p0: text result: string
    p0->>p2: parse(input=text result)
    p2-->>p0: parse result: Json
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as crypto: Crypto
    participant p2 as json/contracts
    opt Try body； stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p0->>p0: parse result.decode‹JwtHeader›()
    p0-->>p0: header: JwtHeader
    alt header.alg != ”RS256” or header.kid != kid or header.typ != tokenType
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 3: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    p0->>p1: decodeBase64url(input=third) · interface dispatch
    p1-->>p0: signature: Bytes
    p0->>p0: first + ”.” + second.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p1: verifyRsa(publicKey=publicKey, input=bytes result,<br/>signature=signature) · interface dispatch
    p1-->>p0: verifyRsa result: bool
    alt not crypto.verifyRsa(publicKey=publicKey, input=(first + ”.” + second).bytes(), signature=signature)
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 4: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    p0->>p1: decodeBase64url(input=second) · interface dispatch
    p1-->>p0: decodeBase64url result 3: Bytes
    p0->>p0: decodeBase64url result 3.text()
    p0-->>p0: text result 2: string
    p0->>p2: parse(input=text result 2)
    p2-->>p0: parse result 2: Json
    Note over p0: Return<br/>parse(input=crypto.decodeBase64url(input=second).text())；<br/>required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 5: JwtError
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt

    opt Catch CryptoError
    Note over p0: Sequence continued from the previous view
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Catch ConversionError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 6: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Catch JsonError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 7: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    opt Catch IndexError
    p0->>p0: JwtError() · construct value
    p0-->>p0: JwtError result 8: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs<br/>before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

## Called contracts

- [parse](../../url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-parse) — package/@git/url\_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Crypto](contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.decodeBase64url](contracts-diagrams.md#sequence-Crypto.decodeBase64url) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.exportRsa](contracts-diagrams.md#sequence-Crypto.exportRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.importRsa](contracts-diagrams.md#sequence-Crypto.importRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.signRsa](contracts-diagrams.md#sequence-Crypto.signRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.verifyRsa](contracts-diagrams.md#sequence-Crypto.verifyRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [JwtError](jose-diagrams.md#sequence-JwtError-20-constructor) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [JwtHeader](jose-diagrams.md#sequence-JwtHeader-20-constructor) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [RsaJwk](jose-diagrams.md#sequence-RsaJwk-20-constructor) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug

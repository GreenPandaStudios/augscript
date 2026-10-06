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
    n2["JwtError"]
    n3["JwtHeader"]
    n4["RsaJwk"]
    n5["RsaJwks"]
    n6["importJwk"]
    n7["rsaJwk"]
    n8["signJwt"]
    n9["verifyJwt"]
    n6 -->|"calls"| n1
    n6 -->|"depends on"| n1
    n7 -->|"calls"| n1
    n7 -->|"depends on"| n1
    n8 -->|"calls"| n1
    n8 -->|"depends on"| n1
    n9 -->|"calls"| n0
    n9 -->|"calls"| n1
    n9 -->|"depends on"| n1
```

::: details Call relationships

```mermaid
flowchart TD
    n0["parse"]
    n1["Crypto.decodeBase64url"]
    n2["Crypto.exportRsa"]
    n3["Crypto.importRsa"]
    n4["Crypto.signRsa"]
    n5["Crypto.verifyRsa"]
    n6["JwtError"]
    n7["JwtHeader"]
    n8["RsaJwk"]
    n9["importJwk"]
    n10["rsaJwk"]
    n11["signJwt"]
    n12["verifyJwt"]
    n9 -->|"calls"| n1
    n9 -->|"calls"| n3
    n9 -->|"calls"| n6
    n10 -->|"calls"| n2
    n10 -->|"calls"| n8
    n11 -->|"calls"| n4
    n11 -->|"calls"| n6
    n11 -->|"calls"| n7
    n12 -->|"calls"| n0
    n12 -->|"calls"| n1
    n12 -->|"calls"| n5
    n12 -->|"calls"| n6
```

:::

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
    participant p2 as modulus.base64url
    participant p3 as exponent.base64url
    participant p4 as RsaJwk
    p0->>p1: exportRsa(publicKey=publicKey) · interface dispatch
    p1-->>p0: Tuple‹Bytes, Bytes›
    p0->>p2: modulus.base64url()
    p0->>p3: exponent.base64url()
    p0->>p4: RsaJwk(kty=”RSA”, kid=kid, alg=”RS256”, use=”sig”, n=modulus.base64url(), e=exponent.base64url())
    p4-->>p0: RsaJwk
    Note over p0: Return RsaJwk(kty=”RSA”, kid=kid, alg=”RS256”, use=”sig”, n=modulus.base64url(), e=exponent.base64url())； required cl…
    Note over p0: May leave with checked errors: CryptoError
```

### importJwk {#sequence-importJwk}

::: spec-paragraph specification-paragraph-6
[Source](jose.md#source-L21)
:::

```mermaid
sequenceDiagram
    participant p0 as importJwk
    participant p1 as JwtError
    participant p2 as crypto: Crypto
    opt Left is false
    end
    opt Left is false
    end
    alt jwk.kty != ”RSA” or jwk.alg != ”RS256” or jwk.use != ”sig”
    p0->>p1: JwtError()
    p1-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Try body； stops on a checked failure
    p0->>p2: decodeBase64url(input=jwk.n) · interface dispatch
    p2-->>p0: modulus: Bytes
    p0->>p2: decodeBase64url(input=jwk.e) · interface dispatch
    p2-->>p0: exponent: Bytes
    p0->>p2: importRsa(modulus=modulus, exponent=exponent) · interface dispatch
    p2-->>p0: RsaPublicKey
    Note over p0: Return crypto.importRsa(modulus, exponent)； required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p1: JwtError()
    p1-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

### signJwt {#sequence-signJwt}

::: spec-paragraph specification-paragraph-7
[Source](jose.md#source-L32)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as signJwt
    participant p1 as JwtHeader
    participant p2 as Json
    participant p3 as Json(value=JwtHeader(alg=”RS256”, kid=kid, typ=tokenType)).stringify
    participant p4 as claims.stringify
    participant p5 as header.bytes
    participant p6 as header.bytes().base64url
    participant p7 as payload.bytes
    participant p8 as payload.bytes().base64url
    participant p9 as signing.bytes
    participant p10 as crypto: Crypto
    participant p11 as signature.base64url
    opt Try body； stops on a checked failure
    p0->>p1: JwtHeader(alg=”RS256”, kid=kid, typ=tokenType)
    p1-->>p0: JwtHeader
    p0->>p2: Json(value=JwtHeader(alg=”RS256”, kid=kid, typ=tokenType))
    p0->>p3: Json(value=JwtHeader(alg=”RS256”, kid=kid, typ=tokenType)).stringify()
    p0->>p4: claims.stringify()
    p0->>p5: header.bytes()
    p0->>p6: header.bytes().base64url()
    p0->>p7: payload.bytes()
    p0->>p8: payload.bytes().base64url()
    p0->>p9: signing.bytes()
    p0->>p10: signRsa(key=key, input=signing.bytes()) · interface dispatch
    p10-->>p0: signature: Bytes
    p0->>p11: signature.base64url()
    Note over p0: Return signing + ”.” + signature.base64url()； required cleanup runs before exit
    end
    opt Catch CryptoError
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as signJwt
    participant p1 as JwtError
    opt Catch CryptoError
    Note over p0: Sequence continued from the previous view
    p0->>p1: JwtError()
    p1-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p1: JwtError()
    p1-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

### verifyJwt {#sequence-verifyJwt}

::: spec-paragraph specification-paragraph-8
[Source](jose.md#source-L45)
:::

#### Sequence 1 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as token.length
    participant p2 as JwtError
    participant p3 as token.split
    participant p4 as parts.length
    participant p5 as parts.get
    participant p6 as crypto: Crypto
    participant p7 as crypto.decodeBase64url(input=first).text
    participant p8 as parse
    participant p9 as parse(input=crypto.decodeBase64url(input=first).text()).decode
    participant p10 as first + ”.” + second).bytes
    p0->>p1: token.length()
    alt token.length() › 16384
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    p0->>p3: token.split(separator=”.”)
    p0->>p4: parts.length()
    alt parts.length() != 3
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Try body； stops on a checked failure
    p0->>p5: parts.get(index=0)
    p0->>p5: parts.get(index=1)
    p0->>p5: parts.get(index=2)
    p0->>p6: decodeBase64url(input=first) · interface dispatch
    p6-->>p0: Bytes
    p0->>p7: crypto.decodeBase64url(input=first).text()
    p0->>p8: parse(input=crypto.decodeBase64url(input=first).text())
    p8-->>p0: Json
    p0->>p9: parse(input=crypto.decodeBase64url(input=first).text()).decode()
    opt Left is false
    end
    opt Left is false
    end
    alt header.alg != ”RS256” or header.kid != kid or header.typ != tokenType
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    p0->>p6: decodeBase64url(input=third) · interface dispatch
    p6-->>p0: signature: Bytes
    p0->>p10: first + ”.” + second).bytes()
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as crypto: Crypto
    participant p2 as JwtError
    participant p3 as crypto.decodeBase64url(input=second).text
    participant p4 as parse
    opt Try body； stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p0->>p1: verifyRsa(publicKey=publicKey, input=first + ”.” + second).bytes(), signature=signature) · interface dispatch
    p1-->>p0: bool
    alt not crypto.verifyRsa(publicKey=publicKey, input=(first + ”.” + second).bytes(), signature=signature)
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    p0->>p1: decodeBase64url(input=second) · interface dispatch
    p1-->>p0: Bytes
    p0->>p3: crypto.decodeBase64url(input=second).text()
    p0->>p4: parse(input=crypto.decodeBase64url(input=second).text())
    p4-->>p0: Json
    Note over p0: Return parse(input=crypto.decodeBase64url(input=second).text())； required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Catch ConversionError
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
    opt Catch IndexError
    p0->>p2: JwtError()
    p2-->>p0: JwtError
    Note over p0: Raise checked failure JwtError()； required cleanup runs before exit
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt

    Note over p0: Sequence continued from the previous view
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

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
    n0["parse · package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n2["JwtError · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n3["JwtHeader · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n4["RsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n5["RsaJwks · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n6["importJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n7["rsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n8["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n9["verifyJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n6 -->|"calls"| n1
    n6 -->|"depends on"| n1
    n6 -->|"calls"| n2
    n7 -->|"calls"| n1
    n7 -->|"depends on"| n1
    n7 -->|"calls"| n4
    n8 -->|"calls"| n1
    n8 -->|"depends on"| n1
    n8 -->|"calls"| n2
    n8 -->|"calls"| n3
    n9 -->|"calls"| n0
    n9 -->|"calls"| n1
    n9 -->|"depends on"| n1
    n9 -->|"calls"| n2
```

## API calls

```mermaid
flowchart TD
    n0["parse · package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1["Crypto.decodeBase64url · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/con…"]
    n2["Crypto.exportRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts…"]
    n3["Crypto.importRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts…"]
    n4["Crypto.signRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n5["Crypto.verifyRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts…"]
    n6["JwtError · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n7["JwtHeader · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n8["RsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n9["importJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n10["rsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n11["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n12["verifyJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
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

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### JwtError constructor {#sequence-JwtError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](jose.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as JwtError constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

### JwtHeader constructor {#sequence-JwtHeader-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](jose.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as JwtHeader constructor

    Note over p0: Receive fields: alg, kid, typ
```

### RsaJwk constructor {#sequence-RsaJwk-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](jose.md#source-L12)
:::

```mermaid
sequenceDiagram
    participant p0 as RsaJwk constructor

    Note over p0: Receive fields: kty, kid, alg, use, n, e
```

### RsaJwks constructor {#sequence-RsaJwks-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](jose.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as RsaJwks constructor

    Note over p0: Receive fields: keys
```

### rsaJwk {#sequence-rsaJwk}

::: spec-paragraph specification-paragraph-5
[Source](jose.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as rsaJwk
    participant p1 as Crypto.exportRsa
    participant p2 as modulus.base64url
    participant p3 as exponent.base64url
    participant p4 as RsaJwk
    p0->>p1: exportRsa(publicKey) · interface dispatch
    p0->>p2: modulus.base64url()
    p0->>p3: exponent.base64url()
    p0->>p4: RsaJwk(kty, kid, alg, use, n, e)
    Note over p0: Return RsaJwk(kty=#34;RSA#34;, kid=kid, alg=#34;RS256#34;, use=#34;sig#34;, n=modulus.base64url(), e=exponent.base64url())#59; required cl…
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
    participant p2 as Crypto.decodeBase64url
    participant p3 as Crypto.importRsa
    opt Left is false
    end
    opt Left is false
    end
    alt jwk.kty != #34;RSA#34; or jwk.alg != #34;RS256#34; or jwk.use != #34;sig#34;
    p0->>p1: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Try body#59; stops on a checked failure
    p0->>p2: decodeBase64url(input) · interface dispatch
    p0->>p2: decodeBase64url(input) · interface dispatch
    p0->>p3: importRsa(modulus, exponent) · interface dispatch
    Note over p0: Return crypto.importRsa(modulus, exponent)#59; required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p1: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
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
    participant p3 as Json(value=JwtHeader(alg=#34;RS256#34;, kid=kid, typ=tokenType)).stringify
    participant p4 as claims.stringify
    participant p5 as header.bytes
    participant p6 as header.bytes().base64url
    participant p7 as payload.bytes
    participant p8 as payload.bytes().base64url
    participant p9 as signing.bytes
    participant p10 as Crypto.signRsa
    participant p11 as signature.base64url
    opt Try body#59; stops on a checked failure
    p0->>p1: JwtHeader(alg, kid, typ)
    p0->>p2: Json(value)
    p0->>p3: Json(value=JwtHeader(alg=#34;RS256#34;, kid=kid, typ=tokenType)).stringify()
    p0->>p4: claims.stringify()
    p0->>p5: header.bytes()
    p0->>p6: header.bytes().base64url()
    p0->>p7: payload.bytes()
    p0->>p8: payload.bytes().base64url()
    p0->>p9: signing.bytes()
    p0->>p10: signRsa(key, input) · interface dispatch
    p0->>p11: signature.base64url()
    Note over p0: Return signing + #34;.#34; + signature.base64url()#59; required cleanup runs before exit
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
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p1: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    Note over p0: May leave with checked errors: JwtError
```

### verifyJwt {#sequence-verifyJwt}

::: spec-paragraph specification-paragraph-8
[Source](jose.md#source-L45)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as token.length
    participant p2 as JwtError
    participant p3 as token.split
    participant p4 as parts.length
    participant p5 as parts.get
    participant p6 as Crypto.decodeBase64url
    participant p7 as crypto.decodeBase64url(input=first).text
    participant p8 as parse
    participant p9 as parse(input=crypto.decodeBase64url(input=first).text()).decode
    participant p10 as first + #34;.#34; + second).bytes
    participant p11 as Crypto.verifyRsa
    p0->>p1: token.length()
    alt token.length() #62; 16384
    p0->>p2: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    p0->>p3: token.split(separator)
    p0->>p4: parts.length()
    alt parts.length() != 3
    p0->>p2: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Try body#59; stops on a checked failure
    p0->>p5: parts.get(index)
    p0->>p5: parts.get(index)
    p0->>p5: parts.get(index)
    p0->>p6: decodeBase64url(input) · interface dispatch
    p0->>p7: crypto.decodeBase64url(input=first).text()
    p0->>p8: parse(input)
    p0->>p9: parse(input=crypto.decodeBase64url(input=first).text()).decode()
    opt Left is false
    end
    opt Left is false
    end
    alt header.alg != #34;RS256#34; or header.kid != kid or header.typ != tokenType
    p0->>p2: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    p0->>p6: decodeBase64url(input) · interface dispatch
    p0->>p10: first + #34;.#34; + second).bytes()
    p0->>p11: verifyRsa(publicKey, input, signature) · interface dispatch
    alt not crypto.verifyRsa(publicKey=publicKey, input=(first + #34;.#34; + second).bytes(), signature=signature)
    p0->>p2: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    p0->>p6: decodeBase64url(input) · interface dispatch
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as verifyJwt
    participant p1 as crypto.decodeBase64url(input=second).text
    participant p2 as parse
    participant p3 as JwtError
    opt Try body#59; stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p0->>p1: crypto.decodeBase64url(input=second).text()
    p0->>p2: parse(input)
    Note over p0: Return parse(input=crypto.decodeBase64url(input=second).text())#59; required cleanup runs before exit
    end
    opt Catch CryptoError
    p0->>p3: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Catch ConversionError
    p0->>p3: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p3: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
    end
    opt Catch IndexError
    p0->>p3: JwtError()
    Note over p0: Raise checked failure JwtError()#59; required cleanup runs before exit
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

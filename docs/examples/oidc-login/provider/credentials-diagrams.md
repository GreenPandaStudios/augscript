---
title: "provider/credentials.aug diagrams"
generated: true
source: "examples/oidc-login/provider/credentials.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/credentials.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](credentials.md)

## Class interactions

```mermaid
flowchart TD
    n0["Crypto"]
    n1["verifyCredentials"]
    n1 -->|"calls"| n0
    n1 -->|"depends on"| n0
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Crypto.decodeBase64url"]
    n1["Crypto.equal"]
    n2["Crypto.passwordHash"]
    n3["verifyCredentials"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### verifyCredentials {#sequence-verifyCredentials}

::: spec-paragraph specification-paragraph-1
[Source](credentials.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as verifyCredentials
    participant p1 as username.length
    participant p2 as password.length
    participant p3 as password.bytes
    participant p4 as ”August demo salt v1”.bytes
    participant p5 as crypto: Crypto
    participant p6 as username.bytes
    participant p7 as ”ada”.bytes
    p0->>p1: username.length()
    opt Left is false
    p0->>p2: password.length()
    end
    alt username.length() › 64 or password.length() › 256
    Note over p0: Return false； required cleanup runs before exit
    end
    p0->>p3: password.bytes()
    p0->>p4: ”August demo salt v1”.bytes()
    p0->>p5: passwordHash(password=password.bytes(), salt=”August<br/>demo salt v1”.bytes(), iterations=600000) · interface<br/>dispatch
    p5-->>p0: actual: Bytes
    p0->>p5: decodeBase64url(input=”s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A”)<br/>· interface dispatch
    p5-->>p0: expected: Bytes
    p0->>p6: username.bytes()
    p0->>p7: ”ada”.bytes()
    p0->>p5: equal(left=username.bytes(), right=”ada”.bytes()) ·<br/>interface dispatch
    p5-->>p0: userMatches: bool
    p0->>p5: equal(left=actual, right=expected) · interface dispatch
    p5-->>p0: passwordMatches: bool
    Note over p0: Return userMatches and passwordMatches； required cleanup<br/>runs before exit
    Note over p0: May leave with checked errors: CryptoError
```

## Called contracts

- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.decodeBase64url](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.decodeBase64url) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.passwordHash](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.passwordHash) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug

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
    n1 -->|"calls decodeBase64url； calls equal； calls passwordHash； depends on"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### verifyCredentials {#sequence-verifyCredentials}

::: spec-paragraph specification-paragraph-1
[Source](credentials.md#source-L4)
:::

One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability.

It takes `username` and `password` as strings. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection.

It can call [`Crypto.passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal). Failures can raise `CryptoError`.

```mermaid
sequenceDiagram
    participant p0 as verifyCredentials
    participant p1 as crypto: Crypto
    p0->>p0: username.length()
    p0-->>p0: length result: int
    opt (length result › 64) is false
    p0->>p0: password.length()
    p0-->>p0: length result 2: int
    end
    alt the byte length of username is greater than 64 or the<br/>byte length of password is greater than 256
    Note over p0: Return false； required cleanup runs before exit
    end
    p0->>p0: password.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p0: ”August demo salt v1”.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p1: passwordHash(password=bytes result, salt=bytes result 2,<br/>iterations=600000) · interface dispatch
    p1-->>p0: actual: Bytes
    p0->>p1: decodeBase64url(input=”s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A”)<br/>· interface dispatch
    p1-->>p0: expected: Bytes
    p0->>p0: username.bytes()
    p0-->>p0: bytes result 3: Bytes
    p0->>p0: ”ada”.bytes()
    p0-->>p0: bytes result 4: Bytes
    p0->>p1: equal(left=bytes result 3, right=bytes result 4) ·<br/>interface dispatch
    p1-->>p0: userMatches: bool
    p0->>p1: equal(left=actual, right=expected) · interface dispatch
    p1-->>p0: passwordMatches: bool
    Note over p0: Return userMatches and passwordMatches； required cleanup<br/>runs before exit
    Note over p0: May leave with checked errors: CryptoError
```

## Called contracts

- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.decodeBase64url](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.decodeBase64url) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.passwordHash](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.passwordHash) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug

---
title: "provider/discovery.aug diagrams"
generated: true
source: "examples/oidc-login/provider/discovery.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/discovery.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](discovery.md)

## Class interactions

```mermaid
flowchart TD
    n0["SigningKeys · common/keys.aug"]
    n1["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n2["RsaJwks · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n3["rsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n4["Discovery · provider/discovery.aug"]
    n5["discovery · provider/discovery.aug"]
    n6["jwks · provider/discovery.aug"]
    n5 -->|"calls"| n4
    n6 -->|"calls"| n0
    n6 -->|"depends on"| n0
    n6 -->|"calls"| n1
    n6 -->|"depends on"| n1
    n6 -->|"calls"| n2
    n6 -->|"calls"| n3
```

## API calls

```mermaid
flowchart TD
    n0["SigningKeys.provider · common/keys.aug"]
    n1["settings · common/settings.aug"]
    n2["Crypto.publicRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts…"]
    n3["RsaJwks · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n4["rsaJwk · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n5["Discovery · provider/discovery.aug"]
    n6["discovery · provider/discovery.aug"]
    n7["jwks · provider/discovery.aug"]
    n6 -->|"calls"| n1
    n6 -->|"calls"| n5
    n7 -->|"calls"| n0
    n7 -->|"calls"| n2
    n7 -->|"calls"| n3
    n7 -->|"calls"| n4
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Discovery constructor {#sequence-Discovery-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](discovery.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Discovery constructor

    Note over p0: Receive fields: issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri, response_types_supported…
```

### discovery {#sequence-discovery}

::: spec-paragraph specification-paragraph-2
[Source](discovery.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as discovery
    participant p1 as settings
    participant p2 as Discovery
    Note over p0: GET /provider/.well-known/openid-configuration
    p0->>p1: settings()
    p0->>p2: Discovery(issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri, response_types_supported, gran…
    Note over p0: Return Discovery(issuer=config.issuer, authorization_endpoint=config.issuer + #34;/authorize#34;, token_endpoint=config.iss…
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

### jwks {#sequence-jwks}

::: spec-paragraph specification-paragraph-3
[Source](discovery.md#source-L12)
:::

```mermaid
sequenceDiagram
    participant p0 as jwks
    participant p1 as SigningKeys.provider
    participant p2 as Crypto.publicRsa
    participant p3 as rsaJwk
    participant p4 as RsaJwks
    Note over p0: GET /provider/jwks
    p0->>p1: provider() · interface dispatch
    p0->>p2: publicRsa(key) · interface dispatch
    p0->>p3: rsaJwk(publicKey, kid)
    p0->>p4: RsaJwks(keys)
    Note over p0: Return RsaJwks(keys=#91;rsaJwk(publicKey=publicKey, kid=#34;provider-1#34;)#93;)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: CryptoError, KeyError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

## Called contracts

- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [SigningKeys.provider](../common/keys-diagrams.md#sequence-SigningKeys.provider) — common/keys.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.publicRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.publicRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [RsaJwks](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-RsaJwks-20-constructor) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [rsaJwk](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-rsaJwk) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [Discovery](discovery-diagrams.md#sequence-Discovery-20-constructor) — provider/discovery.aug

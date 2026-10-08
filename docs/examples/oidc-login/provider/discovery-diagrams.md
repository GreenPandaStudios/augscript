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
    n0["SigningKeys"]
    n1["Crypto"]
    n2["rsaJwk"]
    n3["jwks"]
    n3 -->|"calls provider； depends on"| n0
    n3 -->|"calls publicRsa； depends on"| n1
    n3 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Discovery constructor {#sequence-Discovery-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](discovery.md#source-L6)
:::

Discovery advertises exactly this provider's supported authorization-code profile.

It takes `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, and `jwks_uri` as strings, kept read-only and `response_types_supported`, `grant_types_supported`, `subject_types_supported`, `id_token_signing_alg_values_supported`, `token_endpoint_auth_methods_supported`, `scopes_supported`, `claims_supported`, and `code_challenge_methods_supported` as `List<string>`, kept read-only.

Receive fields: issuer, authorization\_endpoint, token\_endpoint, userinfo\_endpoint, jwks\_uri, response\_types\_supported, grant\_types\_supported, subject\_types\_supported, id\_token\_signing\_alg\_values\_supported, token\_endpoint\_auth\_methods\_supported, scopes\_supported, claims\_supported, code\_challenge\_methods\_supported. [Explanation](discovery.md).

### discovery {#sequence-discovery}

::: spec-paragraph specification-paragraph-2
[Source](discovery.md#source-L7)
:::

`discovery` handles `GET /provider/.well-known/openid-configuration`.

```mermaid
sequenceDiagram
    participant p0 as discovery
    participant p1 as common/settings
    Note over p0: GET /provider/.well-known/openid-configuration
    p0->>p1: settings()
    p1-->>p0: config: Settings
    p0->>p0: Discovery(issuer=config.issuer,<br/>authorization_endpoint=config.issuer + ”/authorize”,<br/>token_endpoint=config.issuer + ”/token”,<br/>userinfo_endpoint=config.issuer + ”/userinfo”,<br/>jwks_uri=config.issuer + ”/jwks”,<br/>response_types_supported=［”code”］,<br/>grant_types_supported=［”authorization_code”］,<br/>subject_types_supported=［”public”］,<br/>id_token_signing_alg_values_supported=［”RS256”］,<br/>token_endpoint_auth_methods_supported=［”none”］,<br/>scopes_supported=［”openid”, ”profile”］,<br/>claims_supported=［”iss”, ”sub”, ”aud”, ”exp”, ”iat”,<br/>”nonce”, ”name”］,<br/>code_challenge_methods_supported=［”S256”］) · construct<br/>value
    p0-->>p0: Discovery result: Discovery
    Note over p0: Return Discovery(issuer=config.issuer,<br/>authorization_endpoint=config.issuer + ”/authorize”,<br/>token_endpoint=config.issuer + ”/token”,<br/>userinfo_endpoint=config.issuer + ”/userinfo”,<br/>jwks_uri=config.issuer + ”/jwks”,<br/>response_types_supported=［”code”］,<br/>grant_types_supported=［”authorization_code”］,<br/>subject_types_supported=［”public”］,<br/>id_token_signing_alg_values_supported=［”RS256”］,<br/>token_endpoint_auth_methods_supported=［”none”］,<br/>scopes_supported=［”openid”, ”profile”］,<br/>claims_supported=［”iss”, ”sub”, ”aud”, ”exp”, ”iat”,<br/>”nonce”, ”name”］,<br/>code_challenge_methods_supported=［”S256”］)； required<br/>cleanup runs before exit
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

### jwks {#sequence-jwks}

::: spec-paragraph specification-paragraph-3
[Source](discovery.md#source-L12)
:::

`jwks` handles `GET /provider/jwks`.

Only the provider's public signing key is published. Session keys never enter this JWKS.

It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) from dependency injection.

It can call [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), and [`Crypto.exportRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.exportRsa).

It can also raise `CryptoError` and `KeyError`.

```mermaid
sequenceDiagram
    participant p0 as jwks
    participant p1 as keys: SigningKeys
    participant p2 as crypto: Crypto
    participant p3 as crypto/jose
    Note over p0: GET /provider/jwks
    p0->>p1: provider() · interface dispatch
    p1-->>p0: provider result: RsaPrivateKey
    p0->>p2: publicRsa(key=provider result) · interface dispatch
    p2-->>p0: publicKey: RsaPublicKey
    p0->>p3: rsaJwk(publicKey=publicKey, kid=”provider-1”)
    p3-->>p0: rsaJwk result: RsaJwk
    p0->>p0: RsaJwks(keys=［rsaJwk result］) · construct value
    p0-->>p0: RsaJwks result: RsaJwks
    Note over p0: Return RsaJwks(keys=［rsaJwk(publicKey=publicKey,<br/>kid=”provider-1”)］)； required cleanup runs before exit
    Note over p0: May leave with checked errors: CryptoError, KeyError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
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

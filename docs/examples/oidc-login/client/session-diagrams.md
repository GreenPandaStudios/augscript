---
title: "client/session.aug diagrams"
generated: true
source: "examples/oidc-login/client/session.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# client/session.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](session.md)

## Class interactions

```mermaid
flowchart TD
    n0["SessionError · client/contracts.aug"]
    n1["authenticate · client/session.aug"]
    n2["SigningKeys · common/keys.aug"]
    n3["settings · common/settings.aug"]
    n4["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n5["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n6["verifyJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n7["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"depends on"| n2
    n1 -->|"calls"| n3
    n1 -->|"calls"| n4
    n1 -->|"depends on"| n4
    n1 -->|"calls"| n5
    n1 -->|"depends on"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n7
    n1 -->|"depends on"| n7
```

## API calls

```mermaid
flowchart TD
    n0["SessionError · client/contracts.aug"]
    n1["authenticate · client/session.aug"]
    n2["SigningKeys.session · common/keys.aug"]
    n3["settings · common/settings.aug"]
    n4["ExpiringStore.get · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n5["Crypto.equal · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n6["Crypto.publicRsa · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts…"]
    n7["verifyJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n8["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n3
    n1 -->|"calls"| n4
    n1 -->|"calls"| n5
    n1 -->|"calls"| n6
    n1 -->|"calls"| n7
    n1 -->|"calls"| n8
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### authenticate {#sequence-authenticate}

::: spec-paragraph specification-paragraph-1
[Source](session.md#source-L9)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as authenticate
    participant p1 as SessionError
    participant p2 as SigningKeys.session
    participant p3 as Crypto.publicRsa
    participant p4 as verifyJwt
    participant p5 as verifyJwt(token=value, publicKey, kid=#34;session-1#34;, tokenType=#34;august-session+jwt#34;).decode
    participant p6 as settings
    participant p7 as Clock.now
    participant p8 as claims.sub.length
    participant p9 as claims.jti.isToken
    participant p10 as claims.csrf.isToken
    participant p11 as ExpiringStore.get
    alt Match when null:
    p0->>p1: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    else Match when some value:
    opt Try body#59; stops on a checked failure
    p0->>p2: session() · interface dispatch
    p0->>p3: publicRsa(key) · interface dispatch
    p0->>p4: verifyJwt(token, publicKey, kid, tokenType)
    p0->>p5: verifyJwt(token=value, publicKey, kid=#34;session-1#34;, tokenType=#34;august-session+jwt#34;).decode()
    p0->>p6: settings()
    p0->>p7: now() · interface dispatch
    opt Left is false
    end
    opt Left is false
    p0->>p8: claims.sub.length()
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    opt Left is false
    end
    alt claims.iss != config.baseUrl + #34;/app#34; or claims.aud != #34;august-app#34; or claims.sub.length() == 0 or claims.exp #60;= now …
    p0->>p1: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p9: claims.jti.isToken(min, max)
    opt Left is false
    p0->>p10: claims.csrf.isToken(min, max)
    end
    alt not claims.jti.isToken(min=43, max=43)) or (not claims.csrf.isToken(min=43, max=43)
    p0->>p1: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    p0->>p11: get(key, now) · interface dispatch
    alt Match when null:
    p0->>p1: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    else Match when some saved:
    opt Left is false
    end
    opt Left is false
    end
    end
    end
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as authenticate
    participant p1 as saved.csrf.bytes
    participant p2 as claims.csrf.bytes
    participant p3 as Crypto.equal
    participant p4 as SessionError
    alt Match when null:
    else Match when some value:
    opt Try body#59; stops on a checked failure
    alt Match when null:
    else Match when some saved:
    opt Left is false
    Note over p0: Sequence continued from the previous view
    p0->>p1: saved.csrf.bytes()
    p0->>p2: claims.csrf.bytes()
    p0->>p3: equal(left, right) · interface dispatch
    end
    alt saved.sub != claims.sub or saved.exp != claims.exp or (not crypto.equal(left=saved.csrf.bytes(), right=claims.csrf.by…
    p0->>p4: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    Note over p0: Return claims#59; required cleanup runs before exit
    end
    end
    opt Catch CryptoError
    p0->>p4: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    opt Catch JwtError
    p0->>p4: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    opt Catch JsonError
    p0->>p4: SessionError()
    Note over p0: Raise checked failure SessionError()#59; required cleanup runs before exit
    end
    end
    Note over p0: May leave with checked errors: KeyError, SessionError, TimeError
```

## Called contracts

- [SessionError](contracts-diagrams.md#sequence-SessionError-20-constructor) — client/contracts.aug
- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [SigningKeys.session](../common/keys-diagrams.md#sequence-SigningKeys.session) — common/keys.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.get](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.get) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.publicRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.publicRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [verifyJwt](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-verifyJwt) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

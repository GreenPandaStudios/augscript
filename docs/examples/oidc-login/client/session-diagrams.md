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

### authenticate

```mermaid
flowchart LR
    n0["authenticate"]
    n1["SigningKeys"]
    n2["settings"]
    n3["ExpiringStore"]
    n4["Crypto"]
    n5["verifyJwt"]
    n6["Clock"]
    n0 -->|"calls session； depends on"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls get； depends on"| n3
    n0 -->|"calls equal； calls publicRsa； depends on"| n4
    n0 -->|"calls"| n5
    n0 -->|"calls now； depends on"| n6
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### authenticate {#sequence-authenticate}

::: spec-paragraph specification-paragraph-1
[Source](session.md#source-L9)
:::

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately.

It takes `token` as `optional string`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null.

It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa). Failures can raise [`KeyError`](../common/keys.md#symbol-KeyError), [`SessionError`](contracts.md#symbol-SessionError), and `TimeError`.

#### Sequence 1 of 3

```mermaid
sequenceDiagram
    participant p0 as authenticate
    participant p1 as keys: SigningKeys
    participant p2 as crypto: Crypto
    participant p3 as crypto/jose
    participant p4 as common/settings
    participant p5 as clock: Clock
    alt Match when null:
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    else Match when some value:
    opt Try body； stops on a checked failure
    p0->>p1: session() · interface dispatch
    p1-->>p0: session result: RsaPrivateKey
    p0->>p2: publicRsa(key=session result) · interface dispatch
    p2-->>p0: publicKey: RsaPublicKey
    p0->>p3: verifyJwt(token=value, publicKey=publicKey,<br/>kid=”session-1”, tokenType=”august-session+jwt”)
    p3-->>p0: verifyJwt result: Json
    p0->>p0: verifyJwt result.decode‹SessionClaims›()
    p0-->>p0: claims: SessionClaims
    p0->>p4: settings()
    p4-->>p0: config: Settings
    p0->>p5: now() · interface dispatch
    p5-->>p0: now: int
    opt (claims.iss != config.baseUrl + ”/app” or claims.aud !=<br/>”august-app”) is false
    p0->>p0: claims.sub.length()
    p0-->>p0: length result: int
    end
    alt claims.iss does not equal the text ｛config.baseUrl｝/app<br/>or claims.aud does not equal ”august-app” or the byte<br/>length of claims.sub equals 0 or claims.exp is at most<br/>now or claims.iat is greater than (now plus 30) or<br/>claims.iat is less than (now minus<br/>config.sessionSeconds) or claims.exp is at most<br/>claims.iat or claims.exp is greater than ((now plus<br/>config.sessionSeconds) plus 30)
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 2: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p0: claims.jti.isToken(min=43, max=43)
    p0-->>p0: isToken result: bool
    opt (not isToken result) is false
    p0->>p0: claims.csrf.isToken(min=43, max=43)
    p0-->>p0: isToken result 2: bool
    end
    end
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as authenticate
    participant p1 as sessions: ExpiringStore
    participant p2 as crypto: Crypto
    alt Continuing Match when some value:
    opt Try body； stops on a checked failure
    alt claims.jti is not a URL-safe ASCII token with 43 to 43<br/>characters or claims.csrf is not a URL-safe ASCII token<br/>with 43 to 43 characters
    Note over p0: Sequence continued from the previous view
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 3: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    p0->>p1: get(key=claims.jti, now=now) · interface dispatch
    p1-->>p0: get result: optional SessionClaims
    alt Match when null:
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 4: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    else Match when some saved:
    opt (saved.sub != claims.sub or saved.exp != claims.exp) is<br/>false
    p0->>p0: saved.csrf.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p0: claims.csrf.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p2: equal(left=bytes result, right=bytes result 2) ·<br/>interface dispatch
    p2-->>p0: equal result: bool
    end
    alt saved.sub does not equal claims.sub or saved.exp does<br/>not equal claims.exp or crypto.equal with left from the<br/>UTF-8 bytes of saved.csrf and right from the UTF-8 bytes<br/>of claims.csrf returns false
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 5: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    Note over p0: Return claims； required cleanup runs before exit
    end
    end
    opt Catch CryptoError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 6: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Catch JwtError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 7: SessionError
    end
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as authenticate

    alt Continuing Match when some value:
    opt Catch JwtError
    Note over p0: Sequence continued from the previous view
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    opt Catch JsonError
    p0->>p0: SessionError() · construct value
    p0-->>p0: SessionError result 8: SessionError
    Note over p0: Raise checked failure SessionError()； required cleanup<br/>runs before exit
    end
    end
    Note over p0: May leave with checked errors: KeyError, SessionError,<br/>TimeError
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

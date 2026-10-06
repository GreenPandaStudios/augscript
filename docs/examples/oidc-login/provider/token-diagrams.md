---
title: "Diagrams · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/token.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# OpenID Connect login application diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](token.md)

### Class interactions

```mermaid
flowchart TD
    n0["securityHeaders · common/headers.aug"]
    n1["SigningKeys · common/keys.aug"]
    n2["settings · common/settings.aug"]
    n3["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n4["Crypto · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n5["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n6["Clock · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n7["AccessGrant · provider/contracts.aug"]
    n8["IdClaims · provider/contracts.aug"]
    n9["OAuthError · provider/contracts.aug"]
    n10["TokenResponse · provider/contracts.aug"]
    n11["_oauthError · provider/token.aug"]
    n12["token · provider/token.aug"]
    n11 -->|"calls"| n0
    n11 -->|"calls"| n9
    n12 -->|"calls"| n0
    n12 -->|"calls"| n1
    n12 -->|"depends on"| n1
    n12 -->|"calls"| n2
    n12 -->|"calls"| n3
    n12 -->|"depends on"| n3
    n12 -->|"calls"| n4
    n12 -->|"depends on"| n4
    n12 -->|"calls"| n5
    n12 -->|"calls"| n6
    n12 -->|"depends on"| n6
    n12 -->|"calls"| n7
    n12 -->|"calls"| n8
    n12 -->|"calls"| n10
    n12 -->|"calls"| n11
```

### API calls

```mermaid
flowchart TD
    n0["securityHeaders · common/headers.aug"]
    n1["SigningKeys.provider · common/keys.aug"]
    n2["settings · common/settings.aug"]
    n3["ExpiringStore.put · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n4["ExpiringStore.take · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n5["Crypto.equal · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n6["Crypto.random · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n7["Crypto.sha256 · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"]
    n8["signJwt · package/@git/url_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug"]
    n9["Clock.now · package/@git/url_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n10["AccessGrant · provider/contracts.aug"]
    n11["IdClaims · provider/contracts.aug"]
    n12["OAuthError · provider/contracts.aug"]
    n13["TokenResponse · provider/contracts.aug"]
    n14["_oauthError · provider/token.aug"]
    n15["token · provider/token.aug"]
    n14 -->|"calls"| n0
    n14 -->|"calls"| n12
    n15 -->|"calls"| n0
    n15 -->|"calls"| n1
    n15 -->|"calls"| n2
    n15 -->|"calls"| n3
    n15 -->|"calls"| n4
    n15 -->|"calls"| n5
    n15 -->|"calls"| n6
    n15 -->|"calls"| n7
    n15 -->|"calls"| n8
    n15 -->|"calls"| n9
    n15 -->|"calls"| n10
    n15 -->|"calls"| n11
    n15 -->|"calls"| n13
    n15 -->|"calls"| n14
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### \_oauthError {#sequence-_oauthError}

::: spec-paragraph specification-paragraph-1
[Source](token.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _oauthError
    participant p1 as OAuthError
    participant p2 as Json
    participant p3 as securityHeaders
    participant p4 as HttpResponse
    p0->>p1: OAuthError(error, error_description)
    p0->>p2: Json(value)
    p0->>p3: securityHeaders()
    p0->>p4: HttpResponse(body, status, headers)
    Note over p0: Return HttpResponse(body=Json(value=OAuthError(error=code, error_description=description)), status=400, headers=secur…
    Note over p0: May leave with checked errors: HttpError
```

#### token {#sequence-token}

::: spec-paragraph specification-paragraph-2
[Source](token.md#source-L12)
:::

##### Sequence 1 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as settings
    participant p2 as http.form
    participant p3 as _oauthError
    participant p4 as form.code.isToken
    participant p5 as form.code_verifier.isToken
    participant p6 as Clock.now
    participant p7 as ExpiringStore.take
    participant p8 as form.code_verifier.bytes
    participant p9 as Crypto.sha256
    participant p10 as crypto.sha256(input=form.code_verifier.bytes()).base64url
    participant p11 as challenge.bytes
    Note over p0: POST /provider/token
    p0->>p1: settings()
    opt Try body#59; stops on a checked failure
    p0->>p2: http.form()
    alt form.grant_type != #34;authorization_code#34;
    p0->>p3: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;unsupported_grant_type#34;, description=#34;Only authorization_code is supported.#34;)#59; required clea…
    end
    alt form.client_id != config.clientId
    p0->>p3: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;invalid_client#34;, description=#34;The registered client is required.#34;)#59; required cleanup runs be…
    end
    p0->>p4: form.code.isToken(min, max)
    opt Left is false
    p0->>p5: form.code_verifier.isToken(min, max)
    end
    alt not form.code.isToken(min=43, max=43)) or (not form.code_verifier.isToken(min=43, max=128)
    p0->>p3: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;invalid_grant#34;, description=#34;The authorization grant is invalid.#34;)#59; required cleanup runs be…
    end
    p0->>p6: now() · interface dispatch
    p0->>p7: take(key, now) · interface dispatch
    alt Match when null:
    p0->>p3: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;invalid_grant#34;, description=#34;The authorization grant is invalid.#34;)#59; required cleanup runs be…
    else Match when some grant:
    p0->>p8: form.code_verifier.bytes()
    p0->>p9: sha256(input) · interface dispatch
    p0->>p10: crypto.sha256(input=form.code_verifier.bytes()).base64url()
    opt Left is false
    end
    opt Left is false
    p0->>p11: challenge.bytes()
    end
    end
    end
```

##### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as grant.challenge.bytes
    participant p2 as Crypto.equal
    participant p3 as _oauthError
    participant p4 as IdClaims
    participant p5 as SigningKeys.provider
    participant p6 as Json
    participant p7 as signJwt
    participant p8 as Crypto.random
    participant p9 as crypto.random(size=32).base64url
    participant p10 as AccessGrant
    participant p11 as ExpiringStore.put
    opt Try body#59; stops on a checked failure
    alt Match when null:
    else Match when some grant:
    opt Left is false
    Note over p0: Sequence continued from the previous view
    p0->>p1: grant.challenge.bytes()
    p0->>p2: equal(left, right) · interface dispatch
    end
    alt grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or (not crypto.equal(left=challenge.bytes(…
    p0->>p3: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;invalid_grant#34;, description=#34;The authorization grant is invalid.#34;)#59; required cleanup runs be…
    end
    p0->>p4: IdClaims(iss, sub, aud, exp, iat, nonce, name)
    p0->>p5: provider() · interface dispatch
    p0->>p6: Json(value)
    p0->>p7: signJwt(key, claims, kid, tokenType)
    p0->>p8: random(size) · interface dispatch
    p0->>p9: crypto.random(size=32).base64url()
    p0->>p10: AccessGrant(subject, name, expires)
    p0->>p11: put(key, value, expires, now) · interface dispatch
    end
    end
```

##### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as TokenResponse
    participant p2 as Json
    participant p3 as securityHeaders
    participant p4 as HttpResponse
    participant p5 as _oauthError
    opt Try body#59; stops on a checked failure
    alt Match when null:
    else Match when some grant:
    Note over p0: Sequence continued from the previous view
    p0->>p1: TokenResponse(token_type, access_token, id_token, expires_in, scope)
    p0->>p2: Json(value)
    p0->>p3: securityHeaders()
    p0->>p4: HttpResponse(body, headers)
    Note over p0: Return HttpResponse(body=Json(value=body), headers=securityHeaders())#59; required cleanup runs before exit
    end
    end
    opt Catch HttpError
    p0->>p5: _oauthError(code, description)
    Note over p0: Return _oauthError(code=#34;invalid_request#34;, description=#34;Submit the required URL-encoded token fields once each.#34;)#59; re…
    end
    Note over p0: May leave with checked errors: CryptoError, HttpError, JwtError, KeyError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping#59; unhandled request failure returns 500
```

### Called contracts

- [securityHeaders](../common/headers-diagrams.md#sequence-securityHeaders) — common/headers.aug
- [SigningKeys](../common/keys-diagrams.md) — common/keys.aug
- [SigningKeys.provider](../common/keys-diagrams.md#sequence-SigningKeys.provider) — common/keys.aug
- [settings](../common/settings-diagrams.md#sequence-settings) — common/settings.aug
- [ExpiringStore](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.put](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.put) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [ExpiringStore.take](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store-diagrams.md#sequence-ExpiringStore.take) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.equal](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.equal) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.random](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.random) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.sha256](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.sha256) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [signJwt](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose-diagrams.md#sequence-signJwt) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.aug
- [Clock](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [Clock.now](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts-diagrams.md#sequence-Clock.now) — package/@git/url\_c092cd151499c4e1d8a1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [AccessGrant](contracts-diagrams.md#sequence-AccessGrant-20-constructor) — provider/contracts.aug
- [IdClaims](contracts-diagrams.md#sequence-IdClaims-20-constructor) — provider/contracts.aug
- [OAuthError](contracts-diagrams.md#sequence-OAuthError-20-constructor) — provider/contracts.aug
- [TokenResponse](contracts-diagrams.md#sequence-TokenResponse-20-constructor) — provider/contracts.aug
- [\_oauthError](token-diagrams.md#sequence-_oauthError) — provider/token.aug

---
title: "provider/token.aug diagrams"
generated: true
source: "examples/oidc-login/provider/token.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/token.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](token.md)

## Class interactions

```mermaid
flowchart TD
    n0["securityHeaders"]
    n1["SigningKeys"]
    n2["settings"]
    n3["ExpiringStore"]
    n4["Crypto"]
    n5["signJwt"]
    n6["Clock"]
    n7["_oauthError"]
    n8["token"]
    n8 -->|"calls"| n0
    n8 -->|"calls"| n1
    n8 -->|"depends on"| n1
    n8 -->|"calls"| n2
    n8 -->|"calls"| n3
    n8 -->|"depends on"| n3
    n8 -->|"calls"| n4
    n8 -->|"depends on"| n4
    n8 -->|"calls"| n5
    n8 -->|"calls"| n6
    n8 -->|"depends on"| n6
    n8 -->|"calls"| n7
```

::: details Call relationships

```mermaid
flowchart TD
    n0["securityHeaders"]
    n1["SigningKeys.provider"]
    n2["settings"]
    n3["ExpiringStore.put"]
    n4["ExpiringStore.take"]
    n5["Crypto.equal"]
    n6["Crypto.random"]
    n7["Crypto.sha256"]
    n8["signJwt"]
    n9["Clock.now"]
    n10["AccessGrant"]
    n11["IdClaims"]
    n12["OAuthError"]
    n13["TokenResponse"]
    n14["_oauthError"]
    n15["token"]
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

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_oauthError {#sequence-_oauthError}

::: spec-paragraph specification-paragraph-1
[Source](token.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _oauthError
    participant p1 as OAuthError
    participant p2 as Json
    participant p3 as common/headers
    participant p4 as HttpResponse
    p0->>p1: OAuthError(error=code, error_description=description)
    p1-->>p0: OAuthError
    p0->>p2: Json(value=OAuthError(error=code,<br/>error_description=description))
    p0->>p3: securityHeaders()
    p3-->>p0: Headers
    p0->>p4: HttpResponse(body=Json(value=OAuthError(error=code,<br/>error_description=description)), status=400,<br/>headers=securityHead…
    Note over p0: Return<br/>HttpResponse(body=Json(value=OAuthError(error=code,<br/>error_description=description)), status=400,<br/>headers=secur…
    Note over p0: May leave with checked errors: HttpError
```

### token {#sequence-token}

::: spec-paragraph specification-paragraph-2
[Source](token.md#source-L12)
:::

#### Sequence 1 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as common/settings
    participant p2 as http.form
    participant p3 as _oauthError
    participant p4 as form.code.isToken
    participant p5 as form.code_verifier.isToken
    participant p6 as clock: Clock
    participant p7 as codes: ExpiringStore
    participant p8 as form.code_verifier.bytes
    participant p9 as crypto: Crypto
    Note over p0: POST /provider/token
    p0->>p1: settings()
    p1-->>p0: config: Settings
    opt Try body； stops on a checked failure
    p0->>p2: http.form()
    alt form.grant_type != ”authorization_code”
    p0->>p3: _oauthError(code=”unsupported_grant_type”,<br/>description=”Only authorization_code is supported.”)
    p3-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”unsupported_grant_type”,<br/>description=”Only authorization_code is supported.”)；<br/>required clea…
    end
    alt form.client_id != config.clientId
    p0->>p3: _oauthError(code=”invalid_client”, description=”The<br/>registered client is required.”)
    p3-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_client”,<br/>description=”The registered client is required.”)；<br/>required cleanup runs be…
    end
    p0->>p4: form.code.isToken(min=43, max=43)
    opt Left is false
    p0->>p5: form.code_verifier.isToken(min=43, max=128)
    end
    alt not form.code.isToken(min=43, max=43)) or (not form.code_verifier.isToken(min=43, max=128)
    p0->>p3: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p3-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    end
    p0->>p6: now() · interface dispatch
    p6-->>p0: now: int
    p0->>p7: take(key=form.code, now=now) · interface dispatch
    p7-->>p0: optional AuthorizationCode
    alt Match when null:
    p0->>p3: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p3-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    else Match when some grant:
    p0->>p8: form.code_verifier.bytes()
    p0->>p9: sha256(input=form.code_verifier.bytes()) · interface<br/>dispatch
    end
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as crypto: Crypto
    participant p2 as crypto.sha256(input=form.code_verifier.bytes()).base64url
    participant p3 as challenge.bytes
    participant p4 as grant.challenge.bytes
    participant p5 as _oauthError
    participant p6 as IdClaims
    participant p7 as keys: SigningKeys
    participant p8 as Json
    participant p9 as @git/url_9ef654c66d34ab8f5527/jose
    participant p10 as crypto.random(size=32).base64url
    participant p11 as AccessGrant
    opt Try body； stops on a checked failure
    alt Match when null:
    else Match when some grant:
    Note over p0: Sequence continued from the previous view
    p1-->>p0: Bytes
    p0->>p2: crypto.sha256(input=form.code_verifier.bytes()).base64url()
    opt Left is false
    p0->>p3: challenge.bytes()
    p0->>p4: grant.challenge.bytes()
    p0->>p1: equal(left=challenge.bytes(),<br/>right=grant.challenge.bytes()) · interface dispatch
    p1-->>p0: bool
    end
    alt grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or (not crypto.equal(left=challenge.bytes(…
    p0->>p5: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p5-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    end
    p0->>p6: IdClaims(iss=config.issuer, sub=grant.subject,<br/>aud=grant.clientId, exp=now + 300, iat=now,<br/>nonce=grant.nonce, name=gr…
    p6-->>p0: claims: IdClaims
    p0->>p7: provider() · interface dispatch
    p7-->>p0: RsaPrivateKey
    p0->>p8: Json(value=claims)
    p0->>p9: signJwt(key=keys.provider(), claims=Json(value=claims),<br/>kid=”provider-1”, tokenType=”JWT”)
    p9-->>p0: idToken: string
    p0->>p1: random(size=32) · interface dispatch
    p1-->>p0: Bytes
    p0->>p10: crypto.random(size=32).base64url()
    p0->>p11: AccessGrant(subject=grant.subject, name=grant.name,<br/>expires=now + 300)
    p11-->>p0: value: AccessGrant
    end
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as access: ExpiringStore
    participant p2 as TokenResponse
    participant p3 as Json
    participant p4 as common/headers
    participant p5 as HttpResponse
    participant p6 as _oauthError
    opt Try body； stops on a checked failure
    alt Match when null:
    else Match when some grant:
    Note over p0: Sequence continued from the previous view
    p0->>p1: put(key=accessToken, value=value, expires=value.expires,<br/>now=now) · interface dispatch
    p0->>p2: TokenResponse(token_type=”Bearer”,<br/>access_token=accessToken, id_token=idToken,<br/>expires_in=300, scope=”openid profile”)
    p2-->>p0: body: TokenResponse
    p0->>p3: Json(value=body)
    p0->>p4: securityHeaders()
    p4-->>p0: Headers
    p0->>p5: HttpResponse(body=Json(value=body),<br/>headers=securityHeaders())
    Note over p0: Return HttpResponse(body=Json(value=body),<br/>headers=securityHeaders())； required cleanup runs before<br/>exit
    end
    end
    opt Catch HttpError
    p0->>p6: _oauthError(code=”invalid_request”, description=”Submit<br/>the required URL-encoded token fields once each.”)
    p6-->>p0: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_request”,<br/>description=”Submit the required URL-encoded token<br/>fields once each.”)； re…
    end
    Note over p0: May leave with checked errors: CryptoError, HttpError,<br/>JwtError, KeyError, StoreFull, TimeError
    Note over p0: HTTP result follows declared response and error mapping；<br/>unhandled request failure returns 500
```

## Called contracts

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

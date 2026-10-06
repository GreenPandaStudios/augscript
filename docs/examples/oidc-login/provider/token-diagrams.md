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

### token

#### View 1 of 2

```mermaid
flowchart LR
    n0["securityHeaders"]
    n1["SigningKeys"]
    n2["settings"]
    n3["ExpiringStore"]
    n4["Crypto"]
    n5["signJwt"]
    n6["token"]
    n6 -->|"calls"| n0
    n6 -->|"calls provider； depends on"| n1
    n6 -->|"calls"| n2
    n6 -->|"calls put； calls take； depends on"| n3
    n6 -->|"calls equal； calls random； calls sha256； depends on"| n4
    n6 -->|"calls"| n5
```

#### View 2 of 2

```mermaid
flowchart LR
    n0["Clock"]
    n1["_oauthError"]
    n2["token"]
    n2 -->|"calls now； depends on"| n0
    n2 -->|"calls"| n1
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_oauthError {#sequence-_oauthError}

::: spec-paragraph specification-paragraph-1
[Source](token.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _oauthError
    participant p1 as common/headers
    p0->>p0: OAuthError(error=code, error_description=description) ·<br/>construct value
    p0-->>p0: OAuthError result: OAuthError
    p0->>p0: Json(value=OAuthError result)
    p0-->>p0: Json result: Json
    p0->>p1: securityHeaders()
    p1-->>p0: securityHeaders result: Headers
    p0->>p0: HttpResponse(body=Json result, status=400,<br/>headers=securityHeaders result)
    p0-->>p0: HttpResponse result: HttpResponse‹Json›
    Note over p0: Return<br/>HttpResponse(body=Json(value=OAuthError(error=code,<br/>error_description=description)), status=400,<br/>headers=secur…
    Note over p0: May leave with checked errors: HttpError
```

### token {#sequence-token}

::: spec-paragraph specification-paragraph-2
[Source](token.md#source-L12)
:::

#### Sequence 1 of 3

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as common/settings
    participant p2 as clock: Clock
    participant p3 as codes: ExpiringStore
    Note over p0: POST /provider/token
    p0->>p1: settings()
    p1-->>p0: config: Settings
    opt Try body； stops on a checked failure
    p0->>p0: http.form‹TokenForm›()
    p0-->>p0: form: TokenForm
    alt form.grant_type != ”authorization_code”
    p0->>p0: _oauthError(code=”unsupported_grant_type”,<br/>description=”Only authorization_code is supported.”)
    p0-->>p0: _oauthError result: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”unsupported_grant_type”,<br/>description=”Only authorization_code is supported.”)；<br/>required clea…
    end
    alt form.client_id != config.clientId
    p0->>p0: _oauthError(code=”invalid_client”, description=”The<br/>registered client is required.”)
    p0-->>p0: _oauthError result 2: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_client”,<br/>description=”The registered client is required.”)；<br/>required cleanup runs be…
    end
    p0->>p0: form.code.isToken(min=43, max=43)
    p0-->>p0: isToken result: bool
    opt Left is false
    p0->>p0: form.code_verifier.isToken(min=43, max=128)
    p0-->>p0: isToken result 2: bool
    end
    alt not form.code.isToken(min=43, max=43)) or (not form.code_verifier.isToken(min=43, max=128)
    p0->>p0: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p0-->>p0: _oauthError result 3: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    end
    p0->>p2: now() · interface dispatch
    p2-->>p0: now: int
    p0->>p3: take(key=form.code, now=now) · interface dispatch
    p3-->>p0: take result: optional AuthorizationCode
    alt Match when null:
    p0->>p0: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p0-->>p0: _oauthError result 4: HttpResponse‹Json›
    end
    end
```

#### Sequence 2 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as crypto: Crypto
    participant p2 as keys: SigningKeys
    opt Try body； stops on a checked failure
    alt Match when null:
    Note over p0: Sequence continued from the previous view
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    else Match when some grant:
    p0->>p0: form.code_verifier.bytes()
    p0-->>p0: bytes result: Bytes
    p0->>p1: sha256(input=bytes result) · interface dispatch
    p1-->>p0: sha256 result: Bytes
    p0->>p0: sha256 result.base64url()
    p0-->>p0: challenge: string
    opt Left is false
    p0->>p0: challenge.bytes()
    p0-->>p0: bytes result 2: Bytes
    p0->>p0: grant.challenge.bytes()
    p0-->>p0: bytes result 3: Bytes
    p0->>p1: equal(left=bytes result 2, right=bytes result 3) ·<br/>interface dispatch
    p1-->>p0: equal result: bool
    end
    alt grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or (not crypto.equal(left=challenge.bytes(…
    p0->>p0: _oauthError(code=”invalid_grant”, description=”The<br/>authorization grant is invalid.”)
    p0-->>p0: _oauthError result 5: HttpResponse‹Json›
    Note over p0: Return _oauthError(code=”invalid_grant”,<br/>description=”The authorization grant is invalid.”)；<br/>required cleanup runs be…
    end
    p0->>p0: IdClaims(iss=config.issuer, sub=grant.subject,<br/>aud=grant.clientId, exp=now + 300, iat=now,<br/>nonce=grant.nonce, name=gr…
    p0-->>p0: claims: IdClaims
    p0->>p2: provider() · interface dispatch
    p2-->>p0: provider result: RsaPrivateKey
    p0->>p0: Json(value=claims)
    p0-->>p0: Json result: Json
    end
    end
```

#### Sequence 3 of 3 (continued)

```mermaid
sequenceDiagram
    participant p0 as token
    participant p1 as crypto/jose
    participant p2 as crypto: Crypto
    participant p3 as access: ExpiringStore
    participant p4 as common/headers
    opt Try body； stops on a checked failure
    alt Continuing Match when some grant:
    Note over p0: Sequence continued from the previous view
    p0->>p1: signJwt(key=provider result, claims=Json result,<br/>kid=”provider-1”, tokenType=”JWT”)
    p1-->>p0: idToken: string
    p0->>p2: random(size=32) · interface dispatch
    p2-->>p0: random result: Bytes
    p0->>p0: random result.base64url()
    p0-->>p0: accessToken: string
    p0->>p0: AccessGrant(subject=grant.subject, name=grant.name,<br/>expires=now + 300) · construct value
    p0-->>p0: value: AccessGrant
    p0->>p3: put(key=accessToken, value=value, expires=value.expires,<br/>now=now) · interface dispatch
    p0->>p0: TokenResponse(token_type=”Bearer”,<br/>access_token=accessToken, id_token=idToken,<br/>expires_in=300, scope=”openid profile”…
    p0-->>p0: body: TokenResponse
    p0->>p0: Json(value=body)
    p0-->>p0: Json result 2: Json
    p0->>p4: securityHeaders()
    p4-->>p0: securityHeaders result: Headers
    p0->>p0: HttpResponse(body=Json result 2, headers=securityHeaders<br/>result)
    p0-->>p0: HttpResponse result: HttpResponse‹Json›
    Note over p0: Return HttpResponse(body=Json(value=body),<br/>headers=securityHeaders())； required cleanup runs before<br/>exit
    end
    end
    opt Catch HttpError
    p0->>p0: _oauthError(code=”invalid_request”, description=”Submit<br/>the required URL-encoded token fields once each.”)
    p0-->>p0: _oauthError result 6: HttpResponse‹Json›
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

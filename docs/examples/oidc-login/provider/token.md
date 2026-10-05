---
title: "provider/token.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/token.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/token.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTcwNzI3MjNjZTNjM2QyNzM0MDBlNjU1ZDliODFmYzk1YTI1ZWY4OGY4MWVhMDUxNmQ4OTUwZTI1MGY1MWY3ZiIsImZvcm1hdHRlZFNoYTI1NiI6ImZlYmQzNGNmNTE2MmI5NjkzZWM5MGY0NGM0MGIzYWNlZWNjZjBlYTc5MDI2ZThlMzQ0MjIxNTVmYjBiNTRiMGYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjE0LCJsYXN0Ijo4OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdG9rZW4iXX0seyJpZCI6InNvdXJjZS1MMTMtTDM4IiwiZmlyc3QiOjE1LCJsYXN0Ijo4OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDIwLUwzNiIsImZpcnN0IjoyOCwibGFzdCI6ODQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNC1MMzgiLCJmaXJzdCI6MTYsImxhc3QiOjg5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMzEtTDM0IiwiZmlyc3QiOjU5LCJsYXN0Ijo3NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDM1LUwzOCIsImZpcnN0Ijo3NywibGFzdCI6ODksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjcsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1fb2F1dGhFcnJvciJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjgsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX1dfQ
// aug-spec: "token.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationCode and AccessGrant and TokenForm and TokenResponse and OAuthError and IdClaims from contracts
import settings and SigningKeys and KeyError and securityHeaders from common
import Crypto and signJwt and JwtError from crypto
import Clock from time
import ExpiringStore and StoreFull from memory
_oauthError(string code, string description):
    return HttpResponse(
        body=Json(value=OAuthError(error=code, error_description=description)),
        status=400,
        headers=securityHeaders()
    )
/** A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON. */
endpoint POST "/provider/token" as token(HttpRequest http from request, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<AuthorizationCode> codes, resolve ExpiringStore<AccessGrant> access) unless CryptoError with status 503 and TimeError with status 503 and KeyError and JwtError and StoreFull with status 503 and HttpError:
    config = settings()
    try:
        form = http.form<TokenForm>()
        if form.grant_type != "authorization_code":
            return _oauthError(
                code="unsupported_grant_type",
                description="Only authorization_code is supported."
            )
        if form.client_id != config.clientId:
            return _oauthError(
                code="invalid_client",
                description="The registered client is required."
            )
        if not form.code.isToken(min=43, max=43) or not form.code_verifier.isToken(min=43, max=128):
            return _oauthError(
                code="invalid_grant",
                description="The authorization grant is invalid."
            )
        now = clock.now()
        match codes.take(key=form.code, now=now):
            when null:
                return _oauthError(
                    code="invalid_grant",
                    description="The authorization grant is invalid."
                )
            when some grant:
                challenge = crypto.sha256(input=form.code_verifier.bytes()).base64url()
                if grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or not crypto.equal(
                    left=challenge.bytes(),
                    right=grant.challenge.bytes()
                ):
                    return _oauthError(
                        code="invalid_grant",
                        description="The authorization grant is invalid."
                    )
                claims = IdClaims(
                    iss=config.issuer,
                    sub=grant.subject,
                    aud=grant.clientId,
                    exp=now + 300,
                    iat=now,
                    nonce=grant.nonce,
                    name=grant.name
                )
                idToken = signJwt(
                    key=keys.provider(),
                    claims=Json(value=claims),
                    kid="provider-1",
                    tokenType="JWT"
                )
                accessToken = crypto.random(size=32).base64url()
                value = AccessGrant(
                    subject=grant.subject,
                    name=grant.name,
                    expires=now + 300
                )
                access.put(
                    key=accessToken,
                    value=value,
                    expires=value.expires,
                    now=now
                )
                body = TokenResponse(
                    token_type="Bearer",
                    access_token=accessToken,
                    id_token=idToken,
                    expires_in=300,
                    scope="openid profile"
                )
                return HttpResponse(body=Json(value=body), headers=securityHeaders())
    catch HttpError error:
        return _oauthError(
            code="invalid_request",
            description="Submit the required URL-encoded token fields once each."
        )
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTcwNzI3MjNjZTNjM2QyNzM0MDBlNjU1ZDliODFmYzk1YTI1ZWY4OGY4MWVhMDUxNmQ4OTUwZTI1MGY1MWY3ZiIsImZvcm1hdHRlZFNoYTI1NiI6ImVmMWViNDMyN2JiMWExZjBlMjQ2ZDUyMGM0MTNlZDY3MDY5MDg4NGZiY2MzNTc3ZmU2OWRhOTI1MmUyM2E0YWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjE1LCJsYXN0IjoxMDAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRva2VuIl19LHsiaWQiOiJzb3VyY2UtTDEzLUwzOCIsImZpcnN0IjoxNiwibGFzdCI6OTksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyMC1MMzYiLCJmaXJzdCI6MzEsImxhc3QiOjkyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTQtTDM4IiwiZmlyc3QiOjE3LCJsYXN0Ijo5OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDMxLUwzNCIsImZpcnN0Ijo2NSwibGFzdCI6ODIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwzNS1MMzgiLCJmaXJzdCI6ODMsImxhc3QiOjk5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtX29hdXRoRXJyb3IiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo4LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02Il19XX0
// aug-spec: "token.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationCode and AccessGrant and TokenForm and TokenResponse and OAuthError and IdClaims from contracts
import settings and SigningKeys and KeyError and securityHeaders from common
import Crypto and signJwt and JwtError from crypto
import Clock from time
import ExpiringStore and StoreFull from memory
_oauthError(string code, string description) {
    return HttpResponse(
        body=Json(value=OAuthError(error=code, error_description=description)),
        status=400,
        headers=securityHeaders()
    )
}
/** A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON. */
endpoint POST "/provider/token" as token(HttpRequest http from request, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<AuthorizationCode> codes, resolve ExpiringStore<AccessGrant> access) unless CryptoError with status 503 and TimeError with status 503 and KeyError and JwtError and StoreFull with status 503 and HttpError {
    config = settings()
    try {
        form = http.form<TokenForm>()
        if form.grant_type != "authorization_code" {
            return _oauthError(
                code="unsupported_grant_type",
                description="Only authorization_code is supported."
            )
        }
        if form.client_id != config.clientId {
            return _oauthError(
                code="invalid_client",
                description="The registered client is required."
            )
        }
        if not form.code.isToken(min=43, max=43) or not form.code_verifier.isToken(min=43, max=128) {
            return _oauthError(
                code="invalid_grant",
                description="The authorization grant is invalid."
            )
        }
        now = clock.now()
        match codes.take(key=form.code, now=now) {
            when null {
                return _oauthError(
                    code="invalid_grant",
                    description="The authorization grant is invalid."
                )
            }
            when some grant {
                challenge = crypto.sha256(input=form.code_verifier.bytes()).base64url()
                if grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or not crypto.equal(
                    left=challenge.bytes(),
                    right=grant.challenge.bytes()
                ) {
                    return _oauthError(
                        code="invalid_grant",
                        description="The authorization grant is invalid."
                    )
                }
                claims = IdClaims(
                    iss=config.issuer,
                    sub=grant.subject,
                    aud=grant.clientId,
                    exp=now + 300,
                    iat=now,
                    nonce=grant.nonce,
                    name=grant.name
                )
                idToken = signJwt(
                    key=keys.provider(),
                    claims=Json(value=claims),
                    kid="provider-1",
                    tokenType="JWT"
                )
                accessToken = crypto.random(size=32).base64url()
                value = AccessGrant(
                    subject=grant.subject,
                    name=grant.name,
                    expires=now + 300
                )
                access.put(
                    key=accessToken,
                    value=value,
                    expires=value.expires,
                    now=now
                )
                body = TokenResponse(
                    token_type="Bearer",
                    access_token=accessToken,
                    id_token=idToken,
                    expires_in=300,
                    scope="openid profile"
                )
                return HttpResponse(body=Json(value=body), headers=securityHeaders())
            }
        }
    }
    catch HttpError error {
        return _oauthError(
            code="invalid_request",
            description="Submit the required URL-encoded token fields once each."
        )
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `token` · [source](token.md#source-L12) {#symbol-token}

`token` handles `POST /provider/token`. A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON.

It takes labeled inputs `http`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)), and `access` ([`ExpiringStore<AccessGrant>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection.

::: spec-paragraph specification-paragraph-1
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `form` to `http.form` for [`TokenForm`](contracts.md#symbol-TokenForm). If `form.grant_type` does not equal `"authorization_code"`, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"unsupported_grant_type"` and `description` `"Only authorization_code is supported."`. If `form.client_id` does not equal `config.clientId`, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"invalid_client"` and `description` `"The registered client is required."`. [source](token.md#source-L13-L38)
:::

::: spec-paragraph specification-paragraph-2
If `form.code` is not a URL-safe ASCII token with `43` to `43` characters or `form.code_verifier` is not a URL-safe ASCII token with `43` to `128` characters, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"invalid_grant"` and `description` `"The authorization grant is invalid."`. It sets `now` to [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It obtains [`codes.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) with `key` from `form.code` and `now`. If no value is found, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"invalid_grant"` and `description` `"The authorization grant is invalid."`. [source](token.md#source-L20-L36)
:::

::: spec-paragraph specification-paragraph-3
The non-null result becomes `grant`. It sets `challenge` to the URL-safe base64 encoding of [`crypto.sha256`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.sha256) with `input` from the UTF-8 bytes of `form.code_verifier`. If `grant.clientId` does not equal `form.client_id` or `grant.redirectUri` does not equal `form.redirect_uri` or [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `challenge` and `right` from the UTF-8 bytes of `grant.challenge` returns false, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"invalid_grant"` and `description` `"The authorization grant is invalid."`. It sets `claims` to an [`IdClaims`](contracts.md#symbol-IdClaims) with `iss` from `config.issuer`, `sub` from `grant.subject`, `aud` from `grant.clientId`, `exp` from `now` plus `300`, `iat` from `now`, `grant.nonce`, and `grant.name`. [source](token.md#source-L14-L38)
:::

::: spec-paragraph specification-paragraph-4
It sets `idToken` to [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) with `key` from [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), `claims` from a `Json` with `value` from `claims`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `crypto`. It sets `accessToken` to the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`. It sets `value` to an [`AccessGrant`](contracts.md#symbol-AccessGrant) with `grant.subject`, `grant.name`, and `expires` from `now` plus `300`. It calls [`access.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) with `key` from `accessToken`, `value`, `value.expires`, and `now`. [source](token.md#source-L31-L34)
:::

::: spec-paragraph specification-paragraph-5
It sets `body` to a [`TokenResponse`](contracts.md#symbol-TokenResponse) with `token_type` `"Bearer"`, `access_token` from `accessToken`, `id_token` from `idToken`, `expires_in` `300`, and `scope` `"openid profile"`. It returns HTTP 200 with a `Json` with `value` from `body` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. If this work raises `HttpError`, it returns [`_oauthError`](token.md#symbol-_oauthError) with `code` `"invalid_request"` and `description` `"Submit the required URL-encoded token fields once each."`. [source](token.md#source-L35-L38)
:::

::: details Checked interface

```text
token(HttpRequest http, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<AuthorizationCode> codes, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> unless CryptoError and HttpError and JwtError and KeyError and StoreFull and TimeError uses Clock.now, ExpiringStore<AuthorizationCode>.take, Crypto.sha256, Crypto.equal, SigningKeys.provider, Crypto.random, ExpiringStore<AccessGrant>.put, Crypto.signRsa
```

It takes `http` as `HttpRequest` from the HTTP request. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)), and `access` ([`ExpiringStore<AccessGrant>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. The handler responds with HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`, `JwtError`, and `KeyError`.

:::

### `_oauthError` · [source](token.md#source-L8) {#symbol-_oauthError}

::: spec-paragraph specification-paragraph-6
It is private to its defining scope. It takes `code` and `description` as strings. It returns HTTP 400 with a `Json` with `value` from an [`OAuthError`](contracts.md#symbol-OAuthError) with `error` from `code` and `error_description` from `description` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](token.md#source-L9)
:::

::: details Checked interface

```text
_oauthError(string code, string description) returns HttpResponse<Json> unless HttpError
```

It takes `code` and `description` as strings. Failures can raise `HttpError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) and [`take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take)) and [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull) from `memory`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`sha256`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.sha256), and [`signRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.signRsa)), [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), and [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`provider`](../common/keys.md#symbol-SigningKeys.provider)), and [`settings`](../common/settings.md#symbol-settings) from `common`.

It uses [`Settings`](../common/settings.md#symbol-Settings) (`clientId` and `issuer`). It uses [`AccessGrant`](contracts.md#symbol-AccessGrant) (`expires`), [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) (`challenge`, `clientId`, `name`, `nonce`, `redirectUri`, and `subject`), [`IdClaims`](contracts.md#symbol-IdClaims), [`OAuthError`](contracts.md#symbol-OAuthError), [`TokenForm`](contracts.md#symbol-TokenForm) (`client_id`, `code`, `code_verifier`, `grant_type`, and `redirect_uri`), and [`TokenResponse`](contracts.md#symbol-TokenResponse) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

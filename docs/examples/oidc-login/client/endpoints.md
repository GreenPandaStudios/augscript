---
title: "client/endpoints.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/endpoints.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/endpoints.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](contracts.md)
- [`client/endpoints.aug`](endpoints.md)
- [`client/export.aug`](export.md)
- [`client/login.aug`](login.md)
- [`client/logout.aug`](logout.md)
- [`client/protocol.aug`](protocol.md)
- [`client/session.aug`](session.md)
- [`client/views.aug`](views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](../provider/authorization.md)
- [`provider/contracts.aug`](../provider/contracts.md)
- [`provider/credentials.aug`](../provider/credentials.md)
- [`provider/discovery.aug`](../provider/discovery.md)
- [`provider/export.aug`](../provider/export.md)
- [`provider/token.aug`](../provider/token.md)
- [`provider/userinfo.aug`](../provider/userinfo.md)
- [`provider/views.aug`](../provider/views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNzE3OTM1NDdkNDk3MGFiNDQ1YzcwMjQwMDA0YWY0ZjQyMGRiZGI2NjNmOWQxZTU1MjNmYWUzMzVlZDFhYzIyZSIsImZvcm1hdHRlZFNoYTI1NiI6IjhjNmYxZTUwMTQzYTIzYWMyYzMwOGFmODg3YzZiOGUwY2I1ZmM4ZjNjY2EyZWY1MjRiZmNkNDI4NjdiYTIwNWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjExLCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTUzMDJhODM3NWI5MyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNhMjIzMmE1ZjVlMCIsImVuZHBvaW50cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1ob21lIl19LHsiaWQiOiJzb3VyY2UtTDIwIiwiZmlyc3QiOjE4LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTUzMDJhODM3NWI5MyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNhMjIzMmE1ZjVlMCIsImVuZHBvaW50cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1tZSJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMywibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS03Mjg4OWM0MjQ1YjEiXX0seyJpZCI6InNvdXJjZS1MMjEiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNzI4ODljNDI0NWIxIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTZmNGJlNzQyMTY4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTY2MGQwNDkzZTUzOCIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWNhNGM5N2Y2NjZhMyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA1ODFlN2Q1YzgyZSJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02ZjRiZTc0MjE2OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02NjBkMDQ5M2U1MzgiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1jYTRjOTdmNjY2YTMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjAsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNjYwZDA0OTNlNTM4IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNTc5MGUxZWNjOTQ2IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktY2E0Yzk3ZjY2NmEzIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1jMDdhMTA3OWEwMGIiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00NjZiMzI3ZDk3ZjkiXX0seyJpZCI6InNvdXJjZS1MMTMtTDE3IiwiZmlyc3QiOjEyLCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDIxLUwyMiIsImZpcnN0IjoxOSwibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "endpoints.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import authenticate from session
import LoginPage and Welcome from views
import UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore from memory
/** The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. */
endpoint GET "/" as home(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions):
    try:
        session = authenticate(token)
        return HttpResponse(body=Welcome(session), headers=securityHeaders())
    catch SessionError error:
        return HttpResponse(body=LoginPage(), headers=securityHeaders())
/** A protected JSON resource accepts only a live, verified application session. */
endpoint GET "/me" as me(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 401 and KeyError and TimeError and HttpError:
    session = authenticate(token)
    return HttpResponse(
        body=UserInfo(sub=session.sub, name=session.name),
        headers=securityHeaders()
    )
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNzE3OTM1NDdkNDk3MGFiNDQ1YzcwMjQwMDA0YWY0ZjQyMGRiZGI2NjNmOWQxZTU1MjNmYWUzMzVlZDFhYzIyZSIsImZvcm1hdHRlZFNoYTI1NiI6IjFkOGZhYTM3OTY5YzhiMTU1NjEzZjk1MTViODEzNzhjNzAxMzE0Yzg2ZGYyYTIxNmNkZjJjMzNhODE1MzllMTciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjExLCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTUzMDJhODM3NWI5MyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNhMjIzMmE1ZjVlMCIsImVuZHBvaW50cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1ob21lIl19LHsiaWQiOiJzb3VyY2UtTDIwIiwiZmlyc3QiOjIxLCJsYXN0IjoyNywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTUzMDJhODM3NWI5MyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNhMjIzMmE1ZjVlMCIsImVuZHBvaW50cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1tZSJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMywibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS03Mjg4OWM0MjQ1YjEiXX0seyJpZCI6InNvdXJjZS1MMjEiLCJmaXJzdCI6MjIsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNzI4ODljNDI0NWIxIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE3LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTZmNGJlNzQyMTY4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTY2MGQwNDkzZTUzOCIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWNhNGM5N2Y2NjZhMyIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA1ODFlN2Q1YzgyZSJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02ZjRiZTc0MjE2OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02NjBkMDQ5M2U1MzgiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1jYTRjOTdmNjY2YTMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjMsImxhc3QiOjI2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNjYwZDA0OTNlNTM4IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNTc5MGUxZWNjOTQ2IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktY2E0Yzk3ZjY2NmEzIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1jMDdhMTA3OWEwMGIiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00NjZiMzI3ZDk3ZjkiXX0seyJpZCI6InNvdXJjZS1MMTMtTDE3IiwiZmlyc3QiOjEyLCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDIxLUwyMiIsImZpcnN0IjoyMiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "endpoints.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import authenticate from session
import LoginPage and Welcome from views
import UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore from memory
/** The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. */
endpoint GET "/" as home(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) {
    try {
        session = authenticate(token)
        return HttpResponse(body=Welcome(session), headers=securityHeaders())
    }
    catch SessionError error {
        return HttpResponse(body=LoginPage(), headers=securityHeaders())
    }
}
/** A protected JSON resource accepts only a live, verified application session. */
endpoint GET "/me" as me(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 401 and KeyError and TimeError and HttpError {
    session = authenticate(token)
    return HttpResponse(
        body=UserInfo(sub=session.sub, name=session.name),
        headers=securityHeaders()
    )
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](endpoints-diagrams.md)

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `home` · [source](endpoints.md#source-L12) {#symbol-home}

`home` handles `GET /`. The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

::: spec-paragraph specification-paragraph-1
It can also raise `HttpError`, `KeyError`, and `TimeError`. It tries to set `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`, then return HTTP 200 with [`Welcome`](views.md#symbol-Welcome) with `session` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. If this work raises [`SessionError`](contracts.md#symbol-SessionError), it returns HTTP 200 with [`LoginPage`](views.md#symbol-LoginPage) and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](endpoints.md#source-L13-L17)
:::

::: details Checked interface

```text
home(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> unless HttpError and KeyError and TimeError uses SigningKeys.session, Crypto.publicRsa, Clock.now, ExpiringStore<SessionClaims>.get, Crypto.equal, Crypto.decodeBase64url, Crypto.verifyRsa
```

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

It can also raise `HttpError`, `KeyError`, and `TimeError`.

:::

### `me` · [source](endpoints.md#source-L20) {#symbol-me}

`me` handles `GET /me`. A protected JSON resource accepts only a live, verified application session.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

::: spec-paragraph specification-paragraph-2
The handler responds with HTTP 401 for [`SessionError`](contracts.md#symbol-SessionError). It can also raise `HttpError`, `KeyError`, and `TimeError`. It sets `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`. It returns HTTP 200 with an [`UserInfo`](../provider/contracts.md#symbol-UserInfo) with `session.sub` and `session.name` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](endpoints.md#source-L21-L22)
:::

::: details Checked interface

```text
me(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<UserInfo> unless HttpError and KeyError and SessionError and TimeError uses SigningKeys.session, Crypto.publicRsa, Clock.now, ExpiringStore<SessionClaims>.get, Crypto.equal, Crypto.decodeBase64url, Crypto.verifyRsa
```

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

The handler responds with HTTP 401 for [`SessionError`](contracts.md#symbol-SessionError). It can also raise `HttpError`, `KeyError`, and `TimeError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get)) from `memory`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa)) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`. It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`name` and `sub`) and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`authenticate`](session.md#symbol-authenticate) from `session`. It uses [`LoginPage`](views.md#symbol-LoginPage) and [`Welcome`](views.md#symbol-Welcome) from `views`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`KeyError`](../common/keys.md#symbol-KeyError), and [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)) from `common`. It uses [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`.

::::

:::::

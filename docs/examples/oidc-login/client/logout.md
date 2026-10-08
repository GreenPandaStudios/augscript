---
title: "client/logout.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/logout.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/logout.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjhlYTIwMDdmYmZjZjhmOWFiYzZiMGUzYjZkZjIwNGFhZTA1MjA5ODYyMzQ5MGNhYzhiMjliOTkyNDRlNTcwYSIsImZvcm1hdHRlZFNoYTI1NiI6IjBiMDkxZTU5ZmNmNDMzNjFkMjhiMmJjNWViYzlhMDg4ZTliZjJkMTJmZmFkNDMxMGYyYmY0MzYyMDY3ODliNWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjI1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktOThlMDU1YjBlZmZlIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktM2EyMjMyYTVmNWUwIiwibG9nb3V0LWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWxvZ291dCJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02NjI1ZjNhYWFmOTkiXX0seyJpZCI6InNvdXJjZS1MMTYiLCJmaXJzdCI6MTUsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNjYyNWYzYWFhZjk5Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTAyNzIwOWQyYTg5OSJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxNywibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS0yYWViNTA4NzVlMGMiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1jYTRjOTdmNjY2YTMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MMTEiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktMmFlYjUwODc1ZTBjIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktMWM5NjA1ZTUzNDZkIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMDU4MWU3ZDVjODJlIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTY5MTc5NTBlYThkMiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWMxMmZmNWIzZWFlNCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTRlMmI4MTc3Y2U0MiIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTFiYTU4MWRlMDdmMCJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMGYyMTU3ZGVjMmEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MMTEtTDE0IiwiZmlyc3QiOjEwLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE1LUwxOCIsImZpcnN0IjoxNCwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxOSIsImZpcnN0IjoyNSwibGFzdCI6MjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "logout.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore from memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError:
    config = settings()
    if origin != config.baseUrl:
        throw SessionError()
    session = authenticate(token)
    if not crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes()):
        throw SessionError()
    sessions.take(key=session.jti, now=clock.now())
    headers = withCookie(
        headers=securityHeaders().with(name="location", value="/"),
        name="aug_session",
        value="",
        path="/",
        maxAge=0,
        secure=config.secureCookies
    )
    return HttpResponse(body=<p>Signed out.</p>, status=303, headers=headers)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjhlYTIwMDdmYmZjZjhmOWFiYzZiMGUzYjZkZjIwNGFhZTA1MjA5ODYyMzQ5MGNhYzhiMjliOTkyNDRlNTcwYSIsImZvcm1hdHRlZFNoYTI1NiI6IjNhZjM4YTc4YTg2MjllMDliZWIzOTc1YjE3MDNjYTI2NmM1MzQ0YTU2MzExNWQzZTZmODczOTUyZjNlODE0ZWQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktOThlMDU1YjBlZmZlIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktM2EyMjMyYTVmNWUwIiwibG9nb3V0LWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWxvZ291dCJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS02NjI1ZjNhYWFmOTkiXX0seyJpZCI6InNvdXJjZS1MMTYiLCJmaXJzdCI6MTYsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNjYyNWYzYWFhZjk5Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTAyNzIwOWQyYTg5OSJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxOSwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS0yYWViNTA4NzVlMGMiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1jYTRjOTdmNjY2YTMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MMTEiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktMmFlYjUwODc1ZTBjIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktMWM5NjA1ZTUzNDZkIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMDU4MWU3ZDVjODJlIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTY5MTc5NTBlYThkMiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWMxMmZmNWIzZWFlNCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTRlMmI4MTc3Y2U0MiIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTFiYTU4MWRlMDdmMCJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMGYyMTU3ZGVjMmEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MMTEtTDE0IiwiZmlyc3QiOjEwLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE1LUwxOCIsImZpcnN0IjoxNSwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxOSIsImZpcnN0IjoyNywibGFzdCI6MjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "logout.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore from memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError {
    config = settings()
    if origin != config.baseUrl {
        throw SessionError()
    }
    session = authenticate(token)
    if not crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes()) {
        throw SessionError()
    }
    sessions.take(key=session.jti, now=clock.now())
    headers = withCookie(
        headers=securityHeaders().with(name="location", value="/"),
        name="aug_session",
        value="",
        path="/",
        maxAge=0,
        secure=config.secureCookies
    )
    return HttpResponse(body=<p>Signed out.</p>, status=303, headers=headers)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](logout-diagrams.md)

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `logout` · [source](logout.md#source-L10) {#symbol-logout}

`logout` handles `POST /logout`. POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie.

It takes `input` as [`LogoutForm`](contracts.md#symbol-LogoutForm) from the HTTP form, `token` as `optional string` from the HTTP cookie `aug_session`, and `origin` as `optional string` from the HTTP header. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take), [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

The handler responds with HTTP 403 for [`SessionError`](contracts.md#symbol-SessionError). It can also raise `CryptoError`, `HttpError`, `KeyError`, and `TimeError`.

::: spec-paragraph specification-paragraph-1
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that `origin` equals `config.baseUrl`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`. [source](logout.md#source-L11-L14)
:::

::: spec-paragraph specification-paragraph-2
It checks that [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `input.csrf` and `right` from the UTF-8 bytes of `session.csrf` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It calls [`sessions.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) with `key` from `session.jti` and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `"/"`, `name` `"aug_session"`, `value` `""`, `path` `"/"`, `maxAge` `0`, and `secure` from `config.secureCookies`. [source](logout.md#source-L15-L18)
:::

::: spec-paragraph specification-paragraph-3
It returns HTTP 303 with a paragraph containing `Signed out.` with escaped text and `headers` headers. [source](logout.md#source-L19)
:::

::: details Checked interface

```text
logout(LogoutForm input, optional string token, optional string origin, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> unless CryptoError and HttpError and KeyError and SessionError and TimeError uses Crypto.equal, Clock.now, ExpiringStore<SessionClaims>.take, SigningKeys.session, Crypto.publicRsa, ExpiringStore<SessionClaims>.get, Crypto.decodeBase64url, Crypto.verifyRsa
```

It takes `input` as [`LogoutForm`](contracts.md#symbol-LogoutForm) from the HTTP form, `token` as `optional string` from the HTTP cookie `aug_session`, and `origin` as `optional string` from the HTTP header. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<SessionClaims>.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take), [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session), [`Crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), [`ExpiringStore<SessionClaims>.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa).

The handler responds with HTTP 403 for [`SessionError`](contracts.md#symbol-SessionError). It can also raise `CryptoError`, `HttpError`, `KeyError`, and `TimeError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get) and [`take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take)) from `memory`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa)) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`. It uses [`LogoutForm`](contracts.md#symbol-LogoutForm) (`csrf`), [`SessionClaims`](contracts.md#symbol-SessionClaims) (`csrf` and `jti`), and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`authenticate`](session.md#symbol-authenticate) from `session`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl` and `secureCookies`).

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

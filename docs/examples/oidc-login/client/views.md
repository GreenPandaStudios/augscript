---
title: "client/views.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/views.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/views.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZDg0MGRhYmUwMTUwY2RiZjNjYjJhYjBkZjhjMjM1ZDY0Zjg5MzljNzYyY2FlOTcwOGJjZTQ5NWI5YmYxMjRjOSIsImZvcm1hdHRlZFNoYTI1NiI6IjEzZjEwNjIzZDczNDAwNTcyNmU2MTEzOGRmNjU4NDc5NWE2NmEzNjBmOTU3NzJjZjYxNGE4ZjgxZDFlMDAwYmMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NiwiYmFja2xpbmtzIjpbInZpZXdzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUxvZ2luUGFnZSJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0Ijo3LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsidmlld3MtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtV2VsY29tZSJdfSx7ImlkIjoic291cmNlLUw3LUwxMSIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTQtTDIyIiwiZmlyc3QiOjgsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims from contracts
import Page from common
import logout from logout
LoginPage():
    return <Page title={"Sign in"}><p>This August app is both an OpenID Connect provider and a login client.</p><p><a href={"/login/start"} style={"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"}>Sign in with OpenID Connect</a></p><p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p></Page>
Welcome(SessionClaims session):
    return <Page title={"Welcome, " + session.name}><p>You are signed in as <strong>{session.name}</strong>.</p><p>Subject: <code>{session.sub}</code></p><p><a href={"/me"}>View the protected JSON endpoint</a></p><form method={"post"} action={"/logout"} onSubmit={handle logout(input from form)}><input type={"hidden"} name={"csrf"} value={session.csrf} /><button type={"submit"} style={"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"}>Sign out</button></form></Page>
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZDg0MGRhYmUwMTUwY2RiZjNjYjJhYjBkZjhjMjM1ZDY0Zjg5MzljNzYyY2FlOTcwOGJjZTQ5NWI5YmYxMjRjOSIsImZvcm1hdHRlZFNoYTI1NiI6IjY4OTFiMjA3YzJkNTA5NjE3YzZhZmE3YWJlNGFkZWU4ODQzMDBjZTIyOTZmZjUwOWQwMDExMzlmMWM4NmU3MjgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbInZpZXdzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUxvZ2luUGFnZSJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0Ijo4LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbInZpZXdzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLVdlbGNvbWUiXX0seyJpZCI6InNvdXJjZS1MNy1MMTEiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE0LUwyMiIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims from contracts
import Page from common
import logout from logout
LoginPage() {
    return <Page title={"Sign in"}><p>This August app is both an OpenID Connect provider and a login client.</p><p><a href={"/login/start"} style={"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"}>Sign in with OpenID Connect</a></p><p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p></Page>
}
Welcome(SessionClaims session) {
    return <Page title={"Welcome, " + session.name}><p>You are signed in as <strong>{session.name}</strong>.</p><p>Subject: <code>{session.sub}</code></p><p><a href={"/me"}>View the protected JSON endpoint</a></p><form method={"post"} action={"/logout"} onSubmit={handle logout(input from form)}><input type={"hidden"} name={"csrf"} value={session.csrf} /><button type={"submit"} style={"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"}>Sign out</button></form></Page>
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](views-diagrams.md)

### `LoginPage` · [source](views.md#source-L6) {#symbol-LoginPage}

::: spec-paragraph specification-paragraph-1
It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = `"Sign in"` containing a paragraph containing `This August app is both an OpenID Connect provider and a login client.` with escaped text, a paragraph containing a link with `href` = `"/login/start"`, `style` = `"display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none"` containing `Sign in with OpenID Connect` with escaped text with escaped text, a paragraph containing `The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.` with escaped text with escaped text. [source](views.md#source-L7-L11)
:::

::: details Checked interface

```text
LoginPage() returns Html
```

:::

### `Welcome` · [source](views.md#source-L13) {#symbol-Welcome}

It takes `session` as [`SessionClaims`](contracts.md#symbol-SessionClaims).

::: spec-paragraph specification-paragraph-2
It returns the server component [`Page`](../common/views.md#symbol-Page) with `title` = the text `Welcome, {session.name}` containing a paragraph containing `You are signed in as `, the HTML element `strong` containing `session.name` with escaped text, `.` with escaped text, a paragraph containing `Subject: `, the HTML element `code` containing `session.sub` with escaped text with escaped text, a paragraph containing a link with `href` = `"/me"` containing `View the protected JSON endpoint` with escaped text with escaped text, the HTML element `form` with `method` = `"post"`, `action` = `"/logout"`, `onSubmit` = a form action that sends `POST /logout` to [`logout`](logout.md#symbol-logout) on submission containing the HTML element `input` with `type` = `"hidden"`, `name` = `"csrf"`, `value` = `session.csrf` with escaped text, a button with `type` = `"submit"`, `style` = `"padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit"` containing `Sign out` with escaped text with escaped text with escaped text. [source](views.md#source-L14-L22)
:::

::: details Checked interface

```text
Welcome(SessionClaims session) returns Html unless HttpError
```

It takes `session` as [`SessionClaims`](contracts.md#symbol-SessionClaims). Failures can raise `HttpError`.

:::

### Dependencies

It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`csrf`, `name`, and `sub`) from `contracts`. It uses [`logout`](logout.md#symbol-logout) from `logout`. It uses [`Page`](../common/views.md#symbol-Page) from `common`.

::::

:::::

---
title: "provider/credentials.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/credentials.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/credentials.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMTMwMmQyYzVjNTk0ZWQ0ODM5YzA5NjQ3NjFlOTg3YTVkZDJhM2Q3NmE3ZTgxYjc0Yjg4MmVmYzM4YjdjZGNiNSIsImZvcm1hdHRlZFNoYTI1NiI6IjQ1OTk2NjgxYjdkYmUwNzYwZTE1MmI5NWVlNmI4Y2RkZmIwN2YxNzFiODAwNzBmODNjY2MzZDBiOGU4Y2Y4NDEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXZlcmlmeUNyZWRlbnRpYWxzIl19LHsiaWQiOiJzb3VyY2UtTDUtTDkiLCJmaXJzdCI6NSwibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMC1MMTEiLCJmaXJzdCI6MTQsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "credentials.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from crypto
/** One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. */
verifyCredentials(string username, string password, resolve Crypto crypto):
    if username.length() > 64 or password.length() > 256:
        return false
    actual = crypto.passwordHash(
        password=password.bytes(),
        salt="August demo salt v1".bytes(),
        iterations=600000
    )
    expected = crypto.decodeBase64url(input="s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A")
    userMatches = crypto.equal(left=username.bytes(), right="ada".bytes())
    passwordMatches = crypto.equal(left=actual, right=expected)
    return userMatches and passwordMatches
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMTMwMmQyYzVjNTk0ZWQ0ODM5YzA5NjQ3NjFlOTg3YTVkZDJhM2Q3NmE3ZTgxYjc0Yjg4MmVmYzM4YjdjZGNiNSIsImZvcm1hdHRlZFNoYTI1NiI6IjY1YjZjMjRkZWNhMjVhNjMxMmQzNzE1MDg4N2UwNjkzMzE2ZWQ4ZWQ3ZDhiZWI2YjkyNzQwMDFlOTU0YzhjYzgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXZlcmlmeUNyZWRlbnRpYWxzIl19LHsiaWQiOiJzb3VyY2UtTDUtTDkiLCJmaXJzdCI6NSwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMC1MMTEiLCJmaXJzdCI6MTUsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
// aug-spec: "credentials.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from crypto
/** One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. */
verifyCredentials(string username, string password, resolve Crypto crypto) {
    if username.length() > 64 or password.length() > 256 {
        return false
    }
    actual = crypto.passwordHash(
        password=password.bytes(),
        salt="August demo salt v1".bytes(),
        iterations=600000
    )
    expected = crypto.decodeBase64url(input="s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A")
    userMatches = crypto.equal(left=username.bytes(), right="ada".bytes())
    passwordMatches = crypto.equal(left=actual, right=expected)
    return userMatches and passwordMatches
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `verifyCredentials` · [source](credentials.md#source-L4) {#symbol-verifyCredentials}

One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. It takes `username` and `password` as strings. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection.

::: spec-paragraph specification-paragraph-1
If the byte length of `username` is greater than `64` or the byte length of `password` is greater than `256`, it returns `false`. It sets `actual` to [`crypto.passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash) with `password` from the UTF-8 bytes of `password`, `salt` from the UTF-8 bytes of `"August demo salt v1"`, and `iterations` `600000`. It sets `expected` to [`crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url) with `input` `"s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A"`. It sets `userMatches` to [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `username` and `right` from the UTF-8 bytes of `"ada"`. [source](credentials.md#source-L5-L9)
:::

::: spec-paragraph specification-paragraph-2
It sets `passwordMatches` to [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from `actual` and `right` from `expected`. It returns `userMatches` and `passwordMatches`. [source](credentials.md#source-L10-L11)
:::

::: details Checked interface

```text
verifyCredentials(string username, string password, resolve Crypto crypto) returns bool unless CryptoError uses Crypto.passwordHash, Crypto.decodeBase64url, Crypto.equal
```

It takes `username` and `password` as strings. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection. Failures can raise `CryptoError`.

:::

### Dependencies

It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), and [`passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash)) from `crypto`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

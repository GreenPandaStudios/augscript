---
title: "provider/discovery.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/discovery.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/discovery.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNWU5NDkwNDE1ZDM5NmJlMzEwMDQ1OTE4N2M5ZGFjYzkxNzViZjAxYTlmYzBmNTQ3ODljNjQ4YWQ5MDg1ZDU3MiIsImZvcm1hdHRlZFNoYTI1NiI6Ijk5ZThlNjliOTJjYmQ3MzBkM2NlMTdlOTk0YWE4NDczZGNhMTY1NWUwMmEwYTZkZDc2YmM1MDk0ZGRiZTg5YzciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImRpc2NvdmVyeS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1EaXNjb3ZlcnkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbImRpc2NvdmVyeS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1kaXNjb3ZlcnkiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MjQsImxhc3QiOjI2LCJiYWNrbGlua3MiOlsiZGlzY292ZXJ5LWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLWp3a3MiXX0seyJpZCI6InNvdXJjZS1MOC1MOSIsImZpcnN0Ijo3LCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEzLUwxNCIsImZpcnN0IjoyNSwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "discovery.aug.md" explains this file. Read it before changes; refresh with aug spec.
import settings and SigningKeys and KeyError from common
import Crypto and RsaJwks and rsaJwk from crypto
/** Discovery advertises exactly this provider's supported authorization-code profile. */
record Discovery(string issuer, string authorization_endpoint, string token_endpoint, string userinfo_endpoint, string jwks_uri, List<string> response_types_supported, List<string> grant_types_supported, List<string> subject_types_supported, List<string> id_token_signing_alg_values_supported, List<string> token_endpoint_auth_methods_supported, List<string> scopes_supported, List<string> claims_supported, List<string> code_challenge_methods_supported)
endpoint GET "/provider/.well-known/openid-configuration" as discovery():
    config = settings()
    return Discovery(
        issuer=config.issuer,
        authorization_endpoint=config.issuer + "/authorize",
        token_endpoint=config.issuer + "/token",
        userinfo_endpoint=config.issuer + "/userinfo",
        jwks_uri=config.issuer + "/jwks",
        response_types_supported=["code"],
        grant_types_supported=["authorization_code"],
        subject_types_supported=["public"],
        id_token_signing_alg_values_supported=["RS256"],
        token_endpoint_auth_methods_supported=["none"],
        scopes_supported=["openid", "profile"],
        claims_supported=["iss", "sub", "aud", "exp", "iat", "nonce", "name"],
        code_challenge_methods_supported=["S256"]
    )
/** Only the provider's public signing key is published. Session keys never enter this JWKS. */
endpoint GET "/provider/jwks" as jwks(resolve Crypto crypto, resolve SigningKeys keys):
    publicKey = crypto.publicRsa(key=keys.provider())
    return RsaJwks(keys=[rsaJwk(publicKey=publicKey, kid="provider-1")])
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNWU5NDkwNDE1ZDM5NmJlMzEwMDQ1OTE4N2M5ZGFjYzkxNzViZjAxYTlmYzBmNTQ3ODljNjQ4YWQ5MDg1ZDU3MiIsImZvcm1hdHRlZFNoYTI1NiI6IjFkNTc5Njc5OTc0MjFmNGNlNjRkNDFlMWRjZjE2MzNiZDlkNTU5N2U4MzU5NDA3Y2E3YjliZGJkNzMyYWUwZGQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImRpc2NvdmVyeS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1EaXNjb3ZlcnkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbImRpc2NvdmVyeS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1kaXNjb3ZlcnkiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MjUsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiZGlzY292ZXJ5LWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLWp3a3MiXX0seyJpZCI6InNvdXJjZS1MOC1MOSIsImZpcnN0Ijo3LCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEzLUwxNCIsImZpcnN0IjoyNiwibGFzdCI6MjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "discovery.aug.md" explains this file. Read it before changes; refresh with aug spec.
import settings and SigningKeys and KeyError from common
import Crypto and RsaJwks and rsaJwk from crypto
/** Discovery advertises exactly this provider's supported authorization-code profile. */
record Discovery(string issuer, string authorization_endpoint, string token_endpoint, string userinfo_endpoint, string jwks_uri, List<string> response_types_supported, List<string> grant_types_supported, List<string> subject_types_supported, List<string> id_token_signing_alg_values_supported, List<string> token_endpoint_auth_methods_supported, List<string> scopes_supported, List<string> claims_supported, List<string> code_challenge_methods_supported)
endpoint GET "/provider/.well-known/openid-configuration" as discovery() {
    config = settings()
    return Discovery(
        issuer=config.issuer,
        authorization_endpoint=config.issuer + "/authorize",
        token_endpoint=config.issuer + "/token",
        userinfo_endpoint=config.issuer + "/userinfo",
        jwks_uri=config.issuer + "/jwks",
        response_types_supported=["code"],
        grant_types_supported=["authorization_code"],
        subject_types_supported=["public"],
        id_token_signing_alg_values_supported=["RS256"],
        token_endpoint_auth_methods_supported=["none"],
        scopes_supported=["openid", "profile"],
        claims_supported=["iss", "sub", "aud", "exp", "iat", "nonce", "name"],
        code_challenge_methods_supported=["S256"]
    )
}
/** Only the provider's public signing key is published. Session keys never enter this JWKS. */
endpoint GET "/provider/jwks" as jwks(resolve Crypto crypto, resolve SigningKeys keys) {
    publicKey = crypto.publicRsa(key=keys.provider())
    return RsaJwks(keys=[rsaJwk(publicKey=publicKey, kid="provider-1")])
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](discovery-diagrams.md)

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `Discovery` · immutable record · [source](discovery.md#source-L6) {#symbol-Discovery}

Discovery advertises exactly this provider's supported authorization-code profile. It takes `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, and `jwks_uri` as strings, kept read-only and `response_types_supported`, `grant_types_supported`, `subject_types_supported`, `id_token_signing_alg_values_supported`, `token_endpoint_auth_methods_supported`, `scopes_supported`, `claims_supported`, and `code_challenge_methods_supported` as `List<string>`, kept read-only.

### `discovery` · [source](discovery.md#source-L7) {#symbol-discovery}

::: spec-paragraph specification-paragraph-1
`discovery` handles `GET /provider/.well-known/openid-configuration`. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It returns a [`Discovery`](discovery.md#symbol-Discovery) with `config.issuer`, `authorization_endpoint` from the text `{config.issuer}/authorize`, `token_endpoint` from the text `{config.issuer}/token`, `userinfo_endpoint` from the text `{config.issuer}/userinfo`, `jwks_uri` from the text `{config.issuer}/jwks`, `response_types_supported` from a list containing `"code"`, `grant_types_supported` from a list containing `"authorization_code"`, `subject_types_supported` from a list containing `"public"`, `id_token_signing_alg_values_supported` from a list containing `"RS256"`, `token_endpoint_auth_methods_supported` from a list containing `"none"`, `scopes_supported` from a list containing `"openid"`, `"profile"`, `claims_supported` from a list containing `"iss"`, `"sub"`, `"aud"`, `"exp"`, `"iat"`, `"nonce"`, `"name"`, and `code_challenge_methods_supported` from a list containing `"S256"`. [source](discovery.md#source-L8-L9)
:::

::: details Checked interface

```text
discovery() returns Discovery
```

:::

### `jwks` · [source](discovery.md#source-L12) {#symbol-jwks}

`jwks` handles `GET /provider/jwks`. Only the provider's public signing key is published. Session keys never enter this JWKS. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) from dependency injection.

::: spec-paragraph specification-paragraph-2
It sets `publicKey` to [`crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa) with `key` from [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider). It returns a [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks) with `keys` from a list containing [`rsaJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-rsaJwk) with `publicKey` and `kid` `"provider-1"` using injected `crypto`. [source](discovery.md#source-L13-L14)
:::

::: details Checked interface

```text
jwks(resolve Crypto crypto, resolve SigningKeys keys) returns RsaJwks unless CryptoError and KeyError uses SigningKeys.provider, Crypto.publicRsa, Crypto.exportRsa
```

It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) from dependency injection. It can also raise `CryptoError` and `KeyError`.

:::

### Dependencies

It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`exportRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.exportRsa) and [`publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa)), [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks), and [`rsaJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-rsaJwk) from `crypto`. It uses [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`provider`](../common/keys.md#symbol-SigningKeys.provider)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`issuer`).

::::

:::::

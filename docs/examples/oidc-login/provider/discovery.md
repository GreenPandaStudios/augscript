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

```aug [Indentation]
import settings and SigningKeys and KeyError from common
import Crypto and RsaJwks and rsaJwk from august.crypto
/** Discovery advertises exactly this provider's supported authorization-code profile. */
record Discovery(string issuer, string authorization_endpoint, string token_endpoint, string userinfo_endpoint, string jwks_uri, List<string> response_types_supported, List<string> grant_types_supported, List<string> subject_types_supported, List<string> id_token_signing_alg_values_supported, List<string> token_endpoint_auth_methods_supported, List<string> scopes_supported, List<string> claims_supported, List<string> code_challenge_methods_supported)
endpoint GET "/provider/.well-known/openid-configuration" as discovery() returns Discovery:
    config = settings()
    return Discovery(issuer=config.issuer, authorization_endpoint=config.issuer + "/authorize", token_endpoint=config.issuer + "/token", userinfo_endpoint=config.issuer + "/userinfo", jwks_uri=config.issuer + "/jwks", response_types_supported=["code"], grant_types_supported=["authorization_code"], subject_types_supported=["public"], id_token_signing_alg_values_supported=["RS256"], token_endpoint_auth_methods_supported=["none"], scopes_supported=["openid", "profile"], claims_supported=["iss", "sub", "aud", "exp", "iat", "nonce", "name"], code_challenge_methods_supported=["S256"])
/** Only the provider's public signing key is published. Session keys never enter this JWKS. */
endpoint GET "/provider/jwks" as jwks(resolve Crypto crypto, resolve SigningKeys keys) returns RsaJwks uses keys.provider and crypto.publicRsa and crypto.exportRsa unless KeyError and CryptoError:
    publicKey = crypto.publicRsa(key=keys.provider())
    return RsaJwks(keys=[rsaJwk(publicKey=publicKey, kid="provider-1")])
```

```aug [Braces]
import settings and SigningKeys and KeyError from common
import Crypto and RsaJwks and rsaJwk from august.crypto
/** Discovery advertises exactly this provider's supported authorization-code profile. */
record Discovery(string issuer, string authorization_endpoint, string token_endpoint, string userinfo_endpoint, string jwks_uri, List<string> response_types_supported, List<string> grant_types_supported, List<string> subject_types_supported, List<string> id_token_signing_alg_values_supported, List<string> token_endpoint_auth_methods_supported, List<string> scopes_supported, List<string> claims_supported, List<string> code_challenge_methods_supported)
endpoint GET "/provider/.well-known/openid-configuration" as discovery() returns Discovery {
    config = settings()
    return Discovery(issuer=config.issuer, authorization_endpoint=config.issuer + "/authorize", token_endpoint=config.issuer + "/token", userinfo_endpoint=config.issuer + "/userinfo", jwks_uri=config.issuer + "/jwks", response_types_supported=["code"], grant_types_supported=["authorization_code"], subject_types_supported=["public"], id_token_signing_alg_values_supported=["RS256"], token_endpoint_auth_methods_supported=["none"], scopes_supported=["openid", "profile"], claims_supported=["iss", "sub", "aud", "exp", "iat", "nonce", "name"], code_challenge_methods_supported=["S256"])
}
/** Only the provider's public signing key is published. Session keys never enter this JWKS. */
endpoint GET "/provider/jwks" as jwks(resolve Crypto crypto, resolve SigningKeys keys) returns RsaJwks uses keys.provider and crypto.publicRsa and crypto.exportRsa unless KeyError and CryptoError {
    publicKey = crypto.publicRsa(key=keys.provider())
    return RsaJwks(keys=[rsaJwk(publicKey=publicKey, kid="provider-1")])
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Discovery"></a>
### `Discovery` · immutable record · [source](discovery.md#code)

Discovery advertises exactly this provider's supported authorization-code profile.

**Inputs:** Take `issuer` (`string`); store read-only. Take `authorization_endpoint` (`string`); store read-only. Take `token_endpoint` (`string`); store read-only. Take `userinfo_endpoint` (`string`); store read-only. Take `jwks_uri` (`string`); store read-only. Take `response_types_supported` (`List<string>`); store read-only. Take `grant_types_supported` (`List<string>`); store read-only. Take `subject_types_supported` (`List<string>`); store read-only. Take `id_token_signing_alg_values_supported` (`List<string>`); store read-only. Take `token_endpoint_auth_methods_supported` (`List<string>`); store read-only. Take `scopes_supported` (`List<string>`); store read-only. Take `claims_supported` (`List<string>`); store read-only. Take `code_challenge_methods_supported` (`List<string>`); store read-only.

<a id="symbol-discovery"></a>
### `discovery` · [source](discovery.md#code)

Returns [`Discovery`](discovery.md#symbol-Discovery).

HTTP route: `GET` `/provider/.well-known/openid-configuration`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Return a new [`Discovery`](discovery.md#symbol-Discovery) with `issuer` as `issuer` of `config`, `authorization_endpoint` as `issuer` of `config` plus `"/authorize"`, `token_endpoint` as `issuer` of `config` plus `"/token"`, `userinfo_endpoint` as `issuer` of `config` plus `"/userinfo"`, `jwks_uri` as `issuer` of `config` plus `"/jwks"`, `response_types_supported` as a list containing `"code"`, `grant_types_supported` as a list containing `"authorization_code"`, `subject_types_supported` as a list containing `"public"`, `id_token_signing_alg_values_supported` as a list containing `"RS256"`, `token_endpoint_auth_methods_supported` as a list containing `"none"`, `scopes_supported` as a list containing `"openid"`, `"profile"`, `claims_supported` as a list containing `"iss"`, `"sub"`, `"aud"`, `"exp"`, `"iat"`, `"nonce"`, `"name"`, `code_challenge_methods_supported` as a list containing `"S256"`.

<a id="symbol-jwks"></a>
### `jwks` · [source](discovery.md#code)

Only the provider's public signing key is published. Session keys never enter this JWKS.

**Inputs:** Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`.

Returns [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). Uses [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). Can fail with `KeyError`, `CryptoError`.

HTTP route: `GET` `/provider/jwks`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

- Set `publicKey` to the result of [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` as the result of [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`.
- Return a new [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` as a list containing the result of [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey`, `kid` as `"provider-1"` using `crypto`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa) (`publicKey`: `RsaPublicKey`) → `Tuple<Bytes,Bytes>`; can fail with `CryptoError`; [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk).
- [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`: construct with `keys`: `List<RsaJwk>`.
- [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey`: `RsaPublicKey`, `kid`: `string`) → [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk); can fail with `CryptoError` from `august.crypto`.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`provider`](../common/keys.md#symbol-SigningKeys.provider) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`Settings`](../common/settings.md#symbol-Settings): read `issuer` (`string`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.

::::

:::::

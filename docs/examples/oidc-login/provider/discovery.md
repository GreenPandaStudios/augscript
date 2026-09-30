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
// aug-spec: "discovery.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "discovery.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Discovery advertises exactly this provider's supported authorization-code profile. The caller supplies `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, and `jwks_uri` as `string`, stored read-only and `response_types_supported`, `grant_types_supported`, `subject_types_supported`, `id_token_signing_alg_values_supported`, `token_endpoint_auth_methods_supported`, `scopes_supported`, `claims_supported`, and `code_challenge_methods_supported` as `List<string>`, stored read-only.

<a id="symbol-discovery"></a>
### `discovery` · [source](discovery.md#code)

The result is [`Discovery`](discovery.md#symbol-Discovery). This handles `GET` requests at `/provider/.well-known/openid-configuration`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings).

It returns a new [`Discovery`](discovery.md#symbol-Discovery) (`issuer` set to `config.issuer`, `authorization_endpoint` set to `config.issuer` plus `"/authorize"`, `token_endpoint` set to `config.issuer` plus `"/token"`, `userinfo_endpoint` set to `config.issuer` plus `"/userinfo"`, `jwks_uri` set to `config.issuer` plus `"/jwks"`, `response_types_supported` set to a list containing `"code"`, `grant_types_supported` set to a list containing `"authorization_code"`, `subject_types_supported` set to a list containing `"public"`, `id_token_signing_alg_values_supported` set to a list containing `"RS256"`, `token_endpoint_auth_methods_supported` set to a list containing `"none"`, `scopes_supported` set to a list containing `"openid"`, `"profile"`, `claims_supported` set to a list containing `"iss"`, `"sub"`, `"aud"`, `"exp"`, `"iat"`, `"nonce"`, `"name"`, and `code_challenge_methods_supported` set to a list containing `"S256"`).

<a id="symbol-jwks"></a>
### `jwks` · [source](discovery.md#code)

Only the provider's public signing key is published. Session keys never enter this JWKS. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) and `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys). The result is [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks). It can use [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `KeyError` and `CryptoError`. This handles `GET` requests at `/provider/jwks`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

It sets `publicKey` to the value from [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` (`key` set to the value from [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`). It returns a new [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) (`keys` set to a list containing the value from [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey` and `kid` set to `"provider-1"`) using `crypto`).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa) takes `publicKey` as `RsaPublicKey`. It returns `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. The file uses [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). The file uses [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) from `august.crypto`. Construction takes `keys` as `List<RsaJwk>`. [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) from `august.crypto` takes `publicKey` as `RsaPublicKey` and `kid` as `string`. It returns [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`.

The file uses [`KeyError`](../common/keys.md#symbol-KeyError) from `common`. The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`. [`provider`](../common/keys.md#symbol-SigningKeys.provider) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider). It can fail with `KeyError`. The file uses [`Settings`](../common/settings.md#symbol-Settings). `issuer` is a read-only field of type `string`. [`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings).

::::

:::::

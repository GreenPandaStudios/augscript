---
title: "provider/discovery.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/discovery.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Discovery`](discovery.md#symbol-Discovery) is an immutable record.
- [`discovery`](discovery.md#symbol-discovery) handles `GET` `/provider/.well-known/openid-configuration` returning `Discovery`.
- [`jwks`](discovery.md#symbol-jwks) handles `GET` `/provider/jwks` returning `RsaJwks`.

### `Discovery` {#symbol-Discovery}

[source](discovery.md#code)

Immutable record.

**Author documentation**

Discovery advertises exactly this provider's supported authorization-code profile.

**Inputs**

- `issuer` (`string`) — required labeled input — stored as `issuer` and read-only after initialization.
- `authorization_endpoint` (`string`) — required labeled input — stored as `authorization_endpoint` and read-only after initialization.
- `token_endpoint` (`string`) — required labeled input — stored as `token_endpoint` and read-only after initialization.
- `userinfo_endpoint` (`string`) — required labeled input — stored as `userinfo_endpoint` and read-only after initialization.
- `jwks_uri` (`string`) — required labeled input — stored as `jwks_uri` and read-only after initialization.
- `response_types_supported` (`List<string>`) — required labeled input — stored as `response_types_supported` and read-only after initialization.
- `grant_types_supported` (`List<string>`) — required labeled input — stored as `grant_types_supported` and read-only after initialization.
- `subject_types_supported` (`List<string>`) — required labeled input — stored as `subject_types_supported` and read-only after initialization.
- `id_token_signing_alg_values_supported` (`List<string>`) — required labeled input — stored as `id_token_signing_alg_values_supported` and read-only after initialization.
- `token_endpoint_auth_methods_supported` (`List<string>`) — required labeled input — stored as `token_endpoint_auth_methods_supported` and read-only after initialization.
- `scopes_supported` (`List<string>`) — required labeled input — stored as `scopes_supported` and read-only after initialization.
- `claims_supported` (`List<string>`) — required labeled input — stored as `claims_supported` and read-only after initialization.
- `code_challenge_methods_supported` (`List<string>`) — required labeled input — stored as `code_challenge_methods_supported` and read-only after initialization.

### `discovery` {#symbol-discovery}

[source](discovery.md#code)

Returns: [`Discovery`](discovery.md#symbol-Discovery).

HTTP route: `GET` `/provider/.well-known/openid-configuration`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Return call [`Discovery`](discovery.md#symbol-Discovery) with `issuer` = `issuer` of `config`; `authorization_endpoint` = (`issuer` of `config` plus `"/authorize"`); `token_endpoint` = (`issuer` of `config` plus `"/token"`); `userinfo_endpoint` = (`issuer` of `config` plus `"/userinfo"`); `jwks_uri` = (`issuer` of `config` plus `"/jwks"`); `response_types_supported` = a list containing `"code"`; `grant_types_supported` = a list containing `"authorization_code"`; `subject_types_supported` = a list containing `"public"`; `id_token_signing_alg_values_supported` = a list containing `"RS256"`; `token_endpoint_auth_methods_supported` = a list containing `"none"`; `scopes_supported` = a list containing `"openid"`, `"profile"`; `claims_supported` = a list containing `"iss"`, `"sub"`, `"aud"`, `"exp"`, `"iat"`, `"nonce"`, `"name"`; `code_challenge_methods_supported` = a list containing `"S256"`.

### `jwks` {#symbol-jwks}

[source](discovery.md#code)

**Inputs**

- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.

Returns: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

Capabilities: [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Can fail with `KeyError`, `CryptoError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/provider/jwks`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

**What it does**

- Set `publicKey` to call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` = call [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`.
- Return call [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` = a list containing call [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey` = `publicKey`; `kid` = `"provider-1"`; inject `crypto` from `crypto`.

**Author documentation**

Only the provider's public signing key is published. Session keys never enter this JWKS.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa) (`publicKey`: `RsaPublicKey`) → `Tuple<Bytes,Bytes>`; can fail with `CryptoError`.
- [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`.

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Record from `august.crypto`.

- Construct with `keys`: `List<RsaJwk>` → [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

#### [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk)

Function from `august.crypto`.

- [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) (`publicKey`: `RsaPublicKey`, `kid`: `string`) → [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk); inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa); can fail with `CryptoError`.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Capability interface from `common`.

- [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `issuer` (`string`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

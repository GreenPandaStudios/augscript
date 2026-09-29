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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Available from `august.crypto`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks)

Available from `august.crypto`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `keys`: `List<RsaJwk>`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

#### [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk)

Available from `august.crypto`.

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`RsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwk).

Capabilities: [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Available from `common`.

Interface. Follow the linked specification for its full explanation.

**[`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider)**

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider).

Possible failures: `KeyError`. The caller must catch or propagate them.

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `issuer`: `string`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

### `Discovery` {#symbol-Discovery}

[source](discovery.md#code)

Immutable record.

**Author documentation**

Discovery advertises exactly this provider's supported authorization-code profile.

**Inputs and dependencies**

- `issuer`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `issuer`. The field is read-only after initialization.
- `authorization_endpoint`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `authorization_endpoint`. The field is read-only after initialization.
- `token_endpoint`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `token_endpoint`. The field is read-only after initialization.
- `userinfo_endpoint`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `userinfo_endpoint`. The field is read-only after initialization.
- `jwks_uri`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `jwks_uri`. The field is read-only after initialization.
- `response_types_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `response_types_supported`. The field is read-only after initialization.
- `grant_types_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `grant_types_supported`. The field is read-only after initialization.
- `subject_types_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `subject_types_supported`. The field is read-only after initialization.
- `id_token_signing_alg_values_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `id_token_signing_alg_values_supported`. The field is read-only after initialization.
- `token_endpoint_auth_methods_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `token_endpoint_auth_methods_supported`. The field is read-only after initialization.
- `scopes_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `scopes_supported`. The field is read-only after initialization.
- `claims_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `claims_supported`. The field is read-only after initialization.
- `code_challenge_methods_supported`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `code_challenge_methods_supported`. The field is read-only after initialization.

### `discovery` {#symbol-discovery}

[source](discovery.md#code)

Result: [`Discovery`](discovery.md#symbol-Discovery).

HTTP route: `GET` `/provider/.well-known/openid-configuration`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Return the result of call [`Discovery`](discovery.md#symbol-Discovery) with `issuer` set to `issuer` of `config`; `authorization_endpoint` set to (`issuer` of `config` plus `"/authorize"`); `token_endpoint` set to (`issuer` of `config` plus `"/token"`); `userinfo_endpoint` set to (`issuer` of `config` plus `"/userinfo"`); `jwks_uri` set to (`issuer` of `config` plus `"/jwks"`); `response_types_supported` set to a list containing `"code"`; `grant_types_supported` set to a list containing `"authorization_code"`; `subject_types_supported` set to a list containing `"public"`; `id_token_signing_alg_values_supported` set to a list containing `"RS256"`; `token_endpoint_auth_methods_supported` set to a list containing `"none"`; `scopes_supported` set to a list containing `"openid"`, `"profile"`; `claims_supported` set to a list containing `"iss"`, `"sub"`, `"aud"`, `"exp"`, `"iat"`, `"nonce"`, `"name"`; `code_challenge_methods_supported` set to a list containing `"S256"` and finish this operation.

### `jwks` {#symbol-jwks}

[source](discovery.md#code)

**Inputs and dependencies**

- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks).

Capabilities: [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.exportRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.exportRsa).

Possible failures: `KeyError`, `CryptoError`. The caller must catch or propagate them.

HTTP route: `GET` `/provider/jwks`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

**Author documentation**

Only the provider's public signing key is published. Session keys never enter this JWKS.

**Behavior when execution reaches this operation**

- Set `publicKey` to the result of call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` set to the result of call [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`.
- Return the result of call [`RsaJwks`](../dependencies/august/0.19.0/crypto/jose.md#symbol-RsaJwks) with `keys` set to a list containing the result of call [`rsaJwk`](../dependencies/august/0.19.0/crypto/jose.md#symbol-rsaJwk) with `publicKey` set to `publicKey`; `kid` set to `"provider-1"`; supply dependencies `crypto` from `crypto` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

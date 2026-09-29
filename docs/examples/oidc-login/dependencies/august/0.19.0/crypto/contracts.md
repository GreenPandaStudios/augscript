---
title: "august/0.19.0/crypto/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/crypto/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/crypto/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
/** Explicit permission for native cryptographic operations. Keys and bytes are immutable. */
capability Crypto:
    /** Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. */
    random(int size) returns Bytes uses Crypto.random unless CryptoError
    /** Hash the complete input using SHA-256. */
    sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
    /** Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. */
    generateRsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
    /** Export the corresponding public key as an opaque immutable value. */
    publicRsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
    /** Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). */
    signRsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
    /** Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. */
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
    /** Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. */
    decodeBase64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
    /** Compare bytes without early exit on their contents. Length remains observable. */
    equal(Bytes left, Bytes right) returns bool uses Crypto.equal
    /** Export unsigned big-endian modulus and exponent for an RSA JWK. */
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> uses Crypto.exportRsa unless CryptoError
    /** Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. */
    importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
    /** PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. */
    passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
extern C value _aug_crypto_random(int size) returns Bytes uses Crypto.random unless CryptoError
extern C value _aug_crypto_sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
extern C value _aug_crypto_generate_rsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
extern C value _aug_crypto_public_rsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
extern C value _aug_crypto_sign_rsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
extern C value _aug_crypto_verify_rsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
extern C value _aug_crypto_decode_base64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
extern C value _aug_crypto_equal(Bytes left, Bytes right) returns bool uses Crypto.equal
extern C value _aug_crypto_export_rsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> uses Crypto.exportRsa unless CryptoError
extern C value _aug_crypto_import_rsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
extern C value _aug_crypto_password_hash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
/** GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. */
GnuTlsCrypto() implements Crypto:
    random(int size) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_random(size)
    sha256(Bytes input) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_sha256(input)
    generateRsa() returns RsaPrivateKey unless CryptoError:
        unsafe:
            return _aug_crypto_generate_rsa()
    publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError:
        unsafe:
            return _aug_crypto_public_rsa(key)
    signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_sign_rsa(key, input)
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError:
        unsafe:
            return _aug_crypto_verify_rsa(publicKey, input, signature)
    decodeBase64url(string input) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_decode_base64url(input)
    equal(Bytes left, Bytes right) returns bool:
        unsafe:
            return _aug_crypto_equal(left, right)
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> unless CryptoError:
        unsafe:
            return _aug_crypto_export_rsa(publicKey)
    importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError:
        unsafe:
            return _aug_crypto_import_rsa(modulus, exponent)
    passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_password_hash(password, salt, iterations)
```

```aug [Braces]
/** Explicit permission for native cryptographic operations. Keys and bytes are immutable. */
capability Crypto {
    /** Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. */
    random(int size) returns Bytes uses Crypto.random unless CryptoError
    /** Hash the complete input using SHA-256. */
    sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
    /** Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. */
    generateRsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
    /** Export the corresponding public key as an opaque immutable value. */
    publicRsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
    /** Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). */
    signRsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
    /** Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. */
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
    /** Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. */
    decodeBase64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
    /** Compare bytes without early exit on their contents. Length remains observable. */
    equal(Bytes left, Bytes right) returns bool uses Crypto.equal
    /** Export unsigned big-endian modulus and exponent for an RSA JWK. */
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> uses Crypto.exportRsa unless CryptoError
    /** Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. */
    importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
    /** PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. */
    passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
}
extern C value _aug_crypto_random(int size) returns Bytes uses Crypto.random unless CryptoError
extern C value _aug_crypto_sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
extern C value _aug_crypto_generate_rsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
extern C value _aug_crypto_public_rsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
extern C value _aug_crypto_sign_rsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
extern C value _aug_crypto_verify_rsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
extern C value _aug_crypto_decode_base64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
extern C value _aug_crypto_equal(Bytes left, Bytes right) returns bool uses Crypto.equal
extern C value _aug_crypto_export_rsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> uses Crypto.exportRsa unless CryptoError
extern C value _aug_crypto_import_rsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
extern C value _aug_crypto_password_hash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
/** GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. */
GnuTlsCrypto() implements Crypto {
    random(int size) returns Bytes unless CryptoError {
        unsafe {
            return _aug_crypto_random(size)
        }
    }
    sha256(Bytes input) returns Bytes unless CryptoError {
        unsafe {
            return _aug_crypto_sha256(input)
        }
    }
    generateRsa() returns RsaPrivateKey unless CryptoError {
        unsafe {
            return _aug_crypto_generate_rsa()
        }
    }
    publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError {
        unsafe {
            return _aug_crypto_public_rsa(key)
        }
    }
    signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError {
        unsafe {
            return _aug_crypto_sign_rsa(key, input)
        }
    }
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError {
        unsafe {
            return _aug_crypto_verify_rsa(publicKey, input, signature)
        }
    }
    decodeBase64url(string input) returns Bytes unless CryptoError {
        unsafe {
            return _aug_crypto_decode_base64url(input)
        }
    }
    equal(Bytes left, Bytes right) returns bool {
        unsafe {
            return _aug_crypto_equal(left, right)
        }
    }
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes,Bytes> unless CryptoError {
        unsafe {
            return _aug_crypto_export_rsa(publicKey)
        }
    }
    importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError {
        unsafe {
            return _aug_crypto_import_rsa(modulus, exponent)
        }
    }
    passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError {
        unsafe {
            return _aug_crypto_password_hash(password, salt, iterations)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Crypto`](contracts.md#symbol-Crypto) is a capability interface.
- [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) is a function returning `Bytes`.
- [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) is a function returning `Bytes`.
- [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa) is a function returning `RsaPrivateKey`.
- [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) is a function returning `RsaPublicKey`.
- [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) is a function returning `Bytes`.
- [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) is a function returning `bool`.
- [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) is a function returning `Bytes`.
- [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) is a function returning `bool`.
- [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) is a function returning `Tuple<Bytes,Bytes>`.
- [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) is a function returning `RsaPublicKey`.
- [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) is a function returning `Bytes`.
- [`GnuTlsCrypto`](contracts.md#symbol-GnuTlsCrypto) is a class implementing `Crypto`.

### `Crypto` {#symbol-Crypto}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

#### `Crypto.random` {#symbol-Crypto.random}

[source](contracts.md#code)

**Inputs**

- `size` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

#### `Crypto.sha256` {#symbol-Crypto.sha256}

[source](contracts.md#code)

**Inputs**

- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Hash the complete input using SHA-256.

#### `Crypto.generateRsa` {#symbol-Crypto.generateRsa}

[source](contracts.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

#### `Crypto.publicRsa` {#symbol-Crypto.publicRsa}

[source](contracts.md#code)

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Export the corresponding public key as an opaque immutable value.

#### `Crypto.signRsa` {#symbol-Crypto.signRsa}

[source](contracts.md#code)

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

#### `Crypto.verifyRsa` {#symbol-Crypto.verifyRsa}

[source](contracts.md#code)

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.
- `signature` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

#### `Crypto.decodeBase64url` {#symbol-Crypto.decodeBase64url}

[source](contracts.md#code)

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

#### `Crypto.equal` {#symbol-Crypto.equal}

[source](contracts.md#code)

**Inputs**

- `left` (`Bytes`) — required labeled input.
- `right` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Compare bytes without early exit on their contents. Length remains observable.

#### `Crypto.exportRsa` {#symbol-Crypto.exportRsa}

[source](contracts.md#code)

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.

Returns: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Export unsigned big-endian modulus and exponent for an RSA JWK.

#### `Crypto.importRsa` {#symbol-Crypto.importRsa}

[source](contracts.md#code)

**Inputs**

- `modulus` (`Bytes`) — required labeled input.
- `exponent` (`Bytes`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

#### `Crypto.passwordHash` {#symbol-Crypto.passwordHash}

[source](contracts.md#code)

**Inputs**

- `password` (`Bytes`) — required labeled input.
- `salt` (`Bytes`) — required labeled input.
- `iterations` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

### `GnuTlsCrypto` {#symbol-GnuTlsCrypto}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Crypto`](contracts.md#symbol-Crypto).

**Author documentation**

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation.

#### `GnuTlsCrypto.random` {#symbol-GnuTlsCrypto.random}

[source](contracts.md#code)

**Inputs**

- `size` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) with `size` = `size`.

**Author documentation**

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

#### `GnuTlsCrypto.sha256` {#symbol-GnuTlsCrypto.sha256}

[source](contracts.md#code)

**Inputs**

- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) with `input` = `input`.

**Author documentation**

Hash the complete input using SHA-256.

#### `GnuTlsCrypto.generateRsa` {#symbol-GnuTlsCrypto.generateRsa}

[source](contracts.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa).

**Author documentation**

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

#### `GnuTlsCrypto.publicRsa` {#symbol-GnuTlsCrypto.publicRsa}

[source](contracts.md#code)

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) with `key` = `key`.

**Author documentation**

Export the corresponding public key as an opaque immutable value.

#### `GnuTlsCrypto.signRsa` {#symbol-GnuTlsCrypto.signRsa}

[source](contracts.md#code)

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) with `key` = `key`; `input` = `input`.

**Author documentation**

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

#### `GnuTlsCrypto.verifyRsa` {#symbol-GnuTlsCrypto.verifyRsa}

[source](contracts.md#code)

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.
- `signature` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) with `publicKey` = `publicKey`; `input` = `input`; `signature` = `signature`.

**Author documentation**

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

#### `GnuTlsCrypto.decodeBase64url` {#symbol-GnuTlsCrypto.decodeBase64url}

[source](contracts.md#code)

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) with `input` = `input`.

**Author documentation**

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

#### `GnuTlsCrypto.equal` {#symbol-GnuTlsCrypto.equal}

[source](contracts.md#code)

**Inputs**

- `left` (`Bytes`) — required labeled input.
- `right` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) with `left` = `left`; `right` = `right`.

**Author documentation**

Compare bytes without early exit on their contents. Length remains observable.

#### `GnuTlsCrypto.exportRsa` {#symbol-GnuTlsCrypto.exportRsa}

[source](contracts.md#code)

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.

Returns: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) with `publicKey` = `publicKey`.

**Author documentation**

Export unsigned big-endian modulus and exponent for an RSA JWK.

#### `GnuTlsCrypto.importRsa` {#symbol-GnuTlsCrypto.importRsa}

[source](contracts.md#code)

**Inputs**

- `modulus` (`Bytes`) — required labeled input.
- `exponent` (`Bytes`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) with `modulus` = `modulus`; `exponent` = `exponent`.

**Author documentation**

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

#### `GnuTlsCrypto.passwordHash` {#symbol-GnuTlsCrypto.passwordHash}

[source](contracts.md#code)

**Inputs**

- `password` (`Bytes`) — required labeled input.
- `salt` (`Bytes`) — required labeled input.
- `iterations` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) with `password` = `password`; `salt` = `salt`; `iterations` = `iterations`.

**Author documentation**

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

### `_aug_crypto_random` {#symbol-_aug_crypto_random}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `size` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_sha256` {#symbol-_aug_crypto_sha256}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_generate_rsa` {#symbol-_aug_crypto_generate_rsa}

[source](contracts.md#code)

Private to its defining scope.

Returns: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_public_rsa` {#symbol-_aug_crypto_public_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_sign_rsa` {#symbol-_aug_crypto_sign_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `key` (`RsaPrivateKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_verify_rsa` {#symbol-_aug_crypto_verify_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.
- `input` (`Bytes`) — required labeled input.
- `signature` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_decode_base64url` {#symbol-_aug_crypto_decode_base64url}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_equal` {#symbol-_aug_crypto_equal}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `left` (`Bytes`) — required labeled input.
- `right` (`Bytes`) — required labeled input.

Returns: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_export_rsa` {#symbol-_aug_crypto_export_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `publicKey` (`RsaPublicKey`) — required labeled input.

Returns: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_import_rsa` {#symbol-_aug_crypto_import_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `modulus` (`Bytes`) — required labeled input.
- `exponent` (`Bytes`) — required labeled input.

Returns: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_crypto_password_hash` {#symbol-_aug_crypto_password_hash}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `password` (`Bytes`) — required labeled input.
- `salt` (`Bytes`) — required labeled input.
- `iterations` (`int`) — required labeled input.

Returns: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Can fail with `CryptoError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

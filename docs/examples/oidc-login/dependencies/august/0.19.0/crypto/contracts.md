---
title: "august/0.19.0/crypto/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/crypto/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/crypto/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Crypto` {#symbol-Crypto}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

#### `Crypto.random` {#symbol-Crypto.random}

[source](contracts.md#code)

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.sha256` {#symbol-Crypto.sha256}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Hash the complete input using SHA-256.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.generateRsa` {#symbol-Crypto.generateRsa}

[source](contracts.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.publicRsa` {#symbol-Crypto.publicRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Export the corresponding public key as an opaque immutable value.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.signRsa` {#symbol-Crypto.signRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.verifyRsa` {#symbol-Crypto.verifyRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.decodeBase64url` {#symbol-Crypto.decodeBase64url}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.equal` {#symbol-Crypto.equal}

[source](contracts.md#code)

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

**Author documentation**

Compare bytes without early exit on their contents. Length remains observable.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.exportRsa` {#symbol-Crypto.exportRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Export unsigned big-endian modulus and exponent for an RSA JWK.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.importRsa` {#symbol-Crypto.importRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

Interface contract. A selected implementation supplies the behavior.

#### `Crypto.passwordHash` {#symbol-Crypto.passwordHash}

[source](contracts.md#code)

**Inputs and dependencies**

- `password`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `salt`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `iterations`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

Interface contract. A selected implementation supplies the behavior.

### `GnuTlsCrypto` {#symbol-GnuTlsCrypto}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Crypto`](contracts.md#symbol-Crypto).

**Author documentation**

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation.

#### `GnuTlsCrypto.random` {#symbol-GnuTlsCrypto.random}

[source](contracts.md#code)

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) with `size` set to `size` and finish this operation.

#### `GnuTlsCrypto.sha256` {#symbol-GnuTlsCrypto.sha256}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Hash the complete input using SHA-256.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) with `input` set to `input` and finish this operation.

#### `GnuTlsCrypto.generateRsa` {#symbol-GnuTlsCrypto.generateRsa}

[source](contracts.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa) and finish this operation.

#### `GnuTlsCrypto.publicRsa` {#symbol-GnuTlsCrypto.publicRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Export the corresponding public key as an opaque immutable value.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) with `key` set to `key` and finish this operation.

#### `GnuTlsCrypto.signRsa` {#symbol-GnuTlsCrypto.signRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) with `key` set to `key`; `input` set to `input` and finish this operation.

#### `GnuTlsCrypto.verifyRsa` {#symbol-GnuTlsCrypto.verifyRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) with `publicKey` set to `publicKey`; `input` set to `input`; `signature` set to `signature` and finish this operation.

#### `GnuTlsCrypto.decodeBase64url` {#symbol-GnuTlsCrypto.decodeBase64url}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) with `input` set to `input` and finish this operation.

#### `GnuTlsCrypto.equal` {#symbol-GnuTlsCrypto.equal}

[source](contracts.md#code)

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

**Author documentation**

Compare bytes without early exit on their contents. Length remains observable.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) with `left` set to `left`; `right` set to `right` and finish this operation.

#### `GnuTlsCrypto.exportRsa` {#symbol-GnuTlsCrypto.exportRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Export unsigned big-endian modulus and exponent for an RSA JWK.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) with `publicKey` set to `publicKey` and finish this operation.

#### `GnuTlsCrypto.importRsa` {#symbol-GnuTlsCrypto.importRsa}

[source](contracts.md#code)

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) with `modulus` set to `modulus`; `exponent` set to `exponent` and finish this operation.

#### `GnuTlsCrypto.passwordHash` {#symbol-GnuTlsCrypto.passwordHash}

[source](contracts.md#code)

**Inputs and dependencies**

- `password`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `salt`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `iterations`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**Author documentation**

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) with `password` set to `password`; `salt` set to `salt`; `iterations` set to `iterations` and finish this operation.

### `_aug_crypto_random` {#symbol-_aug_crypto_random}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_sha256` {#symbol-_aug_crypto_sha256}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_generate_rsa` {#symbol-_aug_crypto_generate_rsa}

[source](contracts.md#code)

Private to its defining scope.

Result: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_public_rsa` {#symbol-_aug_crypto_public_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_sign_rsa` {#symbol-_aug_crypto_sign_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_verify_rsa` {#symbol-_aug_crypto_verify_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_decode_base64url` {#symbol-_aug_crypto_decode_base64url}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_equal` {#symbol-_aug_crypto_equal}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_export_rsa` {#symbol-_aug_crypto_export_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Tuple<Bytes,Bytes>`.

Capabilities: [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_import_rsa` {#symbol-_aug_crypto_import_rsa}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `modulus`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `exponent`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_crypto_password_hash` {#symbol-_aug_crypto_password_hash}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `password`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `salt`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `iterations`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash).

Possible failures: `CryptoError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

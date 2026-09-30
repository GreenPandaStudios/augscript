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
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

<a id="symbol-Crypto"></a>
### `Crypto` · capability interface · [source](contracts.md#code)

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

<a id="symbol-Crypto.random"></a>
#### `Crypto.random` · [source](contracts.md#code)

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. The caller supplies `size` as `int`. The result is `Bytes`. It can use [`Crypto.random`](contracts.md#symbol-Crypto.random). It can fail with `CryptoError`.

<a id="symbol-Crypto.sha256"></a>
#### `Crypto.sha256` · [source](contracts.md#code)

Hash the complete input using SHA-256. The caller supplies `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`.

<a id="symbol-Crypto.generateRsa"></a>
#### `Crypto.generateRsa` · [source](contracts.md#code)

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. The result is `RsaPrivateKey`. It can use [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.publicRsa"></a>
#### `Crypto.publicRsa` · [source](contracts.md#code)

Export the corresponding public key as an opaque immutable value. The caller supplies `key` as `RsaPrivateKey`. The result is `RsaPublicKey`. It can use [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.signRsa"></a>
#### `Crypto.signRsa` · [source](contracts.md#code)

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). The caller supplies `key` as `RsaPrivateKey` and `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.verifyRsa"></a>
#### `Crypto.verifyRsa` · [source](contracts.md#code)

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. The caller supplies `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. The result is `bool`. It can use [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.decodeBase64url"></a>
#### `Crypto.decodeBase64url` · [source](contracts.md#code)

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. The caller supplies `input` as `string`. The result is `Bytes`. It can use [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`.

<a id="symbol-Crypto.equal"></a>
#### `Crypto.equal` · [source](contracts.md#code)

Compare bytes without early exit on their contents. Length remains observable. The caller supplies `left` and `right` as `Bytes`. The result is `bool`. It can use [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

<a id="symbol-Crypto.exportRsa"></a>
#### `Crypto.exportRsa` · [source](contracts.md#code)

Export unsigned big-endian modulus and exponent for an RSA JWK. The caller supplies `publicKey` as `RsaPublicKey`. The result is `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.importRsa"></a>
#### `Crypto.importRsa` · [source](contracts.md#code)

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. The caller supplies `modulus` and `exponent` as `Bytes`. The result is `RsaPublicKey`. It can use [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`.

<a id="symbol-Crypto.passwordHash"></a>
#### `Crypto.passwordHash` · [source](contracts.md#code)

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. The caller supplies `password` and `salt` as `Bytes` and `iterations` as `int`. The result is `Bytes`. It can use [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). It can fail with `CryptoError`.

<a id="symbol-GnuTlsCrypto"></a>
### `GnuTlsCrypto` · class · [source](contracts.md#code)

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. Implements [`Crypto`](contracts.md#symbol-Crypto).

<a id="symbol-GnuTlsCrypto.random"></a>
#### `GnuTlsCrypto.random` · [source](contracts.md#code)

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. The caller supplies `size` as `int`. The result is `Bytes`. It can use [`Crypto.random`](contracts.md#symbol-Crypto.random). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) (`size`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.sha256"></a>
#### `GnuTlsCrypto.sha256` · [source](contracts.md#code)

Hash the complete input using SHA-256. The caller supplies `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) (`input`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.generateRsa"></a>
#### `GnuTlsCrypto.generateRsa` · [source](contracts.md#code)

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. The result is `RsaPrivateKey`. It can use [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.publicRsa"></a>
#### `GnuTlsCrypto.publicRsa` · [source](contracts.md#code)

Export the corresponding public key as an opaque immutable value. The caller supplies `key` as `RsaPrivateKey`. The result is `RsaPublicKey`. It can use [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) (`key`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.signRsa"></a>
#### `GnuTlsCrypto.signRsa` · [source](contracts.md#code)

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). The caller supplies `key` as `RsaPrivateKey` and `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) (`key` and `input`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.verifyRsa"></a>
#### `GnuTlsCrypto.verifyRsa` · [source](contracts.md#code)

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. The caller supplies `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. The result is `bool`. It can use [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) (`publicKey`, `input`, and `signature`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.decodeBase64url"></a>
#### `GnuTlsCrypto.decodeBase64url` · [source](contracts.md#code)

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. The caller supplies `input` as `string`. The result is `Bytes`. It can use [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) (`input`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.equal"></a>
#### `GnuTlsCrypto.equal` · [source](contracts.md#code)

Compare bytes without early exit on their contents. Length remains observable. The caller supplies `left` and `right` as `Bytes`. The result is `bool`. It can use [`Crypto.equal`](contracts.md#symbol-Crypto.equal). Within an unsafe block, it returns the value from [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) (`left` and `right`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.exportRsa"></a>
#### `GnuTlsCrypto.exportRsa` · [source](contracts.md#code)

Export unsigned big-endian modulus and exponent for an RSA JWK. The caller supplies `publicKey` as `RsaPublicKey`. The result is `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) (`publicKey`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.importRsa"></a>
#### `GnuTlsCrypto.importRsa` · [source](contracts.md#code)

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. The caller supplies `modulus` and `exponent` as `Bytes`. The result is `RsaPublicKey`. It can use [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) (`modulus` and `exponent`).

Native operations must satisfy their declared C contracts.

<a id="symbol-GnuTlsCrypto.passwordHash"></a>
#### `GnuTlsCrypto.passwordHash` · [source](contracts.md#code)

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. The caller supplies `password` and `salt` as `Bytes` and `iterations` as `int`. The result is `Bytes`. It can use [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). It can fail with `CryptoError`. Within an unsafe block, it returns the value from [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) (`password`, `salt`, and `iterations`).

Native operations must satisfy their declared C contracts.

<a id="symbol-_aug_crypto_random"></a>
### `_aug_crypto_random` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `size` as `int`. The result is `Bytes`. It can use [`Crypto.random`](contracts.md#symbol-Crypto.random). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_sha256"></a>
### `_aug_crypto_sha256` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_generate_rsa"></a>
### `_aug_crypto_generate_rsa` · [source](contracts.md#code)

Private to its defining scope. The result is `RsaPrivateKey`. It can use [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_public_rsa"></a>
### `_aug_crypto_public_rsa` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `key` as `RsaPrivateKey`. The result is `RsaPublicKey`. It can use [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_sign_rsa"></a>
### `_aug_crypto_sign_rsa` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `key` as `RsaPrivateKey` and `input` as `Bytes`. The result is `Bytes`. It can use [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_verify_rsa"></a>
### `_aug_crypto_verify_rsa` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. The result is `bool`. It can use [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_decode_base64url"></a>
### `_aug_crypto_decode_base64url` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `input` as `string`. The result is `Bytes`. It can use [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_equal"></a>
### `_aug_crypto_equal` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `left` and `right` as `Bytes`. The result is `bool`. It can use [`Crypto.equal`](contracts.md#symbol-Crypto.equal). Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_export_rsa"></a>
### `_aug_crypto_export_rsa` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `publicKey` as `RsaPublicKey`. The result is `Tuple<Bytes,Bytes>`. It can use [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_import_rsa"></a>
### `_aug_crypto_import_rsa` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `modulus` and `exponent` as `Bytes`. The result is `RsaPublicKey`. It can use [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_password_hash"></a>
### `_aug_crypto_password_hash` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `password` and `salt` as `Bytes` and `iterations` as `int`. The result is `Bytes`. It can use [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). It can fail with `CryptoError`. Native C implementation; only its declared contract is visible here.

::::

:::::

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
    random(int size):
        unsafe:
            return _aug_crypto_random(size)
    sha256(Bytes input):
        unsafe:
            return _aug_crypto_sha256(input)
    generateRsa():
        unsafe:
            return _aug_crypto_generate_rsa()
    publicRsa(RsaPrivateKey key):
        unsafe:
            return _aug_crypto_public_rsa(key)
    signRsa(RsaPrivateKey key, Bytes input):
        unsafe:
            return _aug_crypto_sign_rsa(key, input)
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature):
        unsafe:
            return _aug_crypto_verify_rsa(publicKey, input, signature)
    decodeBase64url(string input):
        unsafe:
            return _aug_crypto_decode_base64url(input)
    equal(Bytes left, Bytes right):
        unsafe:
            return _aug_crypto_equal(left, right)
    exportRsa(RsaPublicKey publicKey):
        unsafe:
            return _aug_crypto_export_rsa(publicKey)
    importRsa(Bytes modulus, Bytes exponent):
        unsafe:
            return _aug_crypto_import_rsa(modulus, exponent)
    passwordHash(Bytes password, Bytes salt, int iterations):
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
    random(int size) {
        unsafe {
            return _aug_crypto_random(size)
        }
    }
    sha256(Bytes input) {
        unsafe {
            return _aug_crypto_sha256(input)
        }
    }
    generateRsa() {
        unsafe {
            return _aug_crypto_generate_rsa()
        }
    }
    publicRsa(RsaPrivateKey key) {
        unsafe {
            return _aug_crypto_public_rsa(key)
        }
    }
    signRsa(RsaPrivateKey key, Bytes input) {
        unsafe {
            return _aug_crypto_sign_rsa(key, input)
        }
    }
    verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) {
        unsafe {
            return _aug_crypto_verify_rsa(publicKey, input, signature)
        }
    }
    decodeBase64url(string input) {
        unsafe {
            return _aug_crypto_decode_base64url(input)
        }
    }
    equal(Bytes left, Bytes right) {
        unsafe {
            return _aug_crypto_equal(left, right)
        }
    }
    exportRsa(RsaPublicKey publicKey) {
        unsafe {
            return _aug_crypto_export_rsa(publicKey)
        }
    }
    importRsa(Bytes modulus, Bytes exponent) {
        unsafe {
            return _aug_crypto_import_rsa(modulus, exponent)
        }
    }
    passwordHash(Bytes password, Bytes salt, int iterations) {
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

### `Crypto` · capability interface · [source](contracts.md#code) {#symbol-Crypto}

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

#### `Crypto.random` · [source](contracts.md#code) {#symbol-Crypto.random}

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. It takes `size` as an integer.

It returns `Bytes`. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`.

#### `Crypto.sha256` · [source](contracts.md#code) {#symbol-Crypto.sha256}

Hash the complete input using SHA-256. It takes `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`.

#### `Crypto.generateRsa` · [source](contracts.md#code) {#symbol-Crypto.generateRsa}

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

It returns `RsaPrivateKey`. It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

#### `Crypto.publicRsa` · [source](contracts.md#code) {#symbol-Crypto.publicRsa}

Export the corresponding public key as an opaque immutable value. It takes `key` as `RsaPrivateKey`.

It returns `RsaPublicKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`.

#### `Crypto.signRsa` · [source](contracts.md#code) {#symbol-Crypto.signRsa}

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). It takes `key` as `RsaPrivateKey` and `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`.

#### `Crypto.verifyRsa` · [source](contracts.md#code) {#symbol-Crypto.verifyRsa}

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`.

It returns `bool`. It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`.

#### `Crypto.decodeBase64url` · [source](contracts.md#code) {#symbol-Crypto.decodeBase64url}

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. It takes `input` as a string.

It returns `Bytes`. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`.

#### `Crypto.equal` · [source](contracts.md#code) {#symbol-Crypto.equal}

Compare bytes without early exit on their contents. Length remains observable. It takes `left` and `right` as `Bytes`.

It returns `bool`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

#### `Crypto.exportRsa` · [source](contracts.md#code) {#symbol-Crypto.exportRsa}

Export unsigned big-endian modulus and exponent for an RSA JWK. It takes `publicKey` as `RsaPublicKey`.

It returns `Tuple<Bytes,Bytes>`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`.

#### `Crypto.importRsa` · [source](contracts.md#code) {#symbol-Crypto.importRsa}

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. It takes `modulus` and `exponent` as `Bytes`.

It returns `RsaPublicKey`. It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`.

#### `Crypto.passwordHash` · [source](contracts.md#code) {#symbol-Crypto.passwordHash}

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. It takes `password` and `salt` as `Bytes` and `iterations` as an integer.

It returns `Bytes`. It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`.

### `GnuTlsCrypto` · class · [source](contracts.md#code) {#symbol-GnuTlsCrypto}

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. It implements [`Crypto`](contracts.md#symbol-Crypto).

#### `GnuTlsCrypto.random` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.random}

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. It takes `size` as an integer. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) with `size`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.sha256` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.sha256}

Hash the complete input using SHA-256. It takes `input` as `Bytes`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) with `input`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.generateRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.generateRsa}

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa). Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.publicRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.publicRsa}

Export the corresponding public key as an opaque immutable value. It takes `key` as `RsaPrivateKey`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) with `key`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.signRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.signRsa}

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). It takes `key` as `RsaPrivateKey` and `input` as `Bytes`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) with `key` and `input`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.verifyRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.verifyRsa}

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) with `publicKey`, `input`, and `signature`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.decodeBase64url` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.decodeBase64url}

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. It takes `input` as a string. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) with `input`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.equal` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.equal}

Compare bytes without early exit on their contents. Length remains observable. It takes `left` and `right` as `Bytes`.

Within an unsafe block, it returns [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) with `left` and `right`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.exportRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.exportRsa}

Export unsigned big-endian modulus and exponent for an RSA JWK. It takes `publicKey` as `RsaPublicKey`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) with `publicKey`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.importRsa` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.importRsa}

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. It takes `modulus` and `exponent` as `Bytes`. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) with `modulus` and `exponent`. Native operations must satisfy their declared C contracts.

#### `GnuTlsCrypto.passwordHash` · [source](contracts.md#code) {#symbol-GnuTlsCrypto.passwordHash}

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. It takes `password` and `salt` as `Bytes` and `iterations` as an integer. Failures can raise `CryptoError`.

Within an unsafe block, it returns [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) with `password`, `salt`, and `iterations`. Native operations must satisfy their declared C contracts.

### `_aug_crypto_random` · [source](contracts.md#code) {#symbol-_aug_crypto_random}

It is private to its defining scope. It takes `size` as an integer.

It returns `Bytes`. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_sha256` · [source](contracts.md#code) {#symbol-_aug_crypto_sha256}

It is private to its defining scope. It takes `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_generate_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_generate_rsa}

It is private to its defining scope. It returns `RsaPrivateKey`. It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

Native C implementation; only its declared contract is visible here.

### `_aug_crypto_public_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_public_rsa}

It is private to its defining scope. It takes `key` as `RsaPrivateKey`.

It returns `RsaPublicKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_sign_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_sign_rsa}

It is private to its defining scope. It takes `key` as `RsaPrivateKey` and `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_verify_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_verify_rsa}

It is private to its defining scope. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`.

It returns `bool`. It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_decode_base64url` · [source](contracts.md#code) {#symbol-_aug_crypto_decode_base64url}

It is private to its defining scope. It takes `input` as a string.

It returns `Bytes`. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_equal` · [source](contracts.md#code) {#symbol-_aug_crypto_equal}

It is private to its defining scope. It takes `left` and `right` as `Bytes`. It returns `bool`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Native C implementation; only its declared contract is visible here.

### `_aug_crypto_export_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_export_rsa}

It is private to its defining scope. It takes `publicKey` as `RsaPublicKey`.

It returns `Tuple<Bytes,Bytes>`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_import_rsa` · [source](contracts.md#code) {#symbol-_aug_crypto_import_rsa}

It is private to its defining scope. It takes `modulus` and `exponent` as `Bytes`.

It returns `RsaPublicKey`. It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_password_hash` · [source](contracts.md#code) {#symbol-_aug_crypto_password_hash}

It is private to its defining scope. It takes `password` and `salt` as `Bytes` and `iterations` as an integer.

It returns `Bytes`. It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

::::

:::::

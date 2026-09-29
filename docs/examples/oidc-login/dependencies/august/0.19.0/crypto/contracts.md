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

<a id="symbol-Crypto"></a>
### `Crypto` · capability interface · [source](contracts.md#code)

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

<a id="symbol-Crypto.random"></a>
#### `Crypto.random` · [source](contracts.md#code)

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

**Inputs:** Take `size` (`int`).

Returns `Bytes`. Uses [`Crypto.random`](contracts.md#symbol-Crypto.random). Can fail with `CryptoError`.

<a id="symbol-Crypto.sha256"></a>
#### `Crypto.sha256` · [source](contracts.md#code)

Hash the complete input using SHA-256.

**Inputs:** Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Can fail with `CryptoError`.

<a id="symbol-Crypto.generateRsa"></a>
#### `Crypto.generateRsa` · [source](contracts.md#code)

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Returns `RsaPrivateKey`. Uses [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.publicRsa"></a>
#### `Crypto.publicRsa` · [source](contracts.md#code)

Export the corresponding public key as an opaque immutable value.

**Inputs:** Take `key` (`RsaPrivateKey`).

Returns `RsaPublicKey`. Uses [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.signRsa"></a>
#### `Crypto.signRsa` · [source](contracts.md#code)

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

**Inputs:** Take `key` (`RsaPrivateKey`). Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.verifyRsa"></a>
#### `Crypto.verifyRsa` · [source](contracts.md#code)

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

**Inputs:** Take `publicKey` (`RsaPublicKey`). Take `input` (`Bytes`). Take `signature` (`Bytes`).

Returns `bool`. Uses [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.decodeBase64url"></a>
#### `Crypto.decodeBase64url` · [source](contracts.md#code)

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

**Inputs:** Take `input` (`string`).

Returns `Bytes`. Uses [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Can fail with `CryptoError`.

<a id="symbol-Crypto.equal"></a>
#### `Crypto.equal` · [source](contracts.md#code)

Compare bytes without early exit on their contents. Length remains observable.

**Inputs:** Take `left` (`Bytes`). Take `right` (`Bytes`).

Returns `bool`. Uses [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

<a id="symbol-Crypto.exportRsa"></a>
#### `Crypto.exportRsa` · [source](contracts.md#code)

Export unsigned big-endian modulus and exponent for an RSA JWK.

**Inputs:** Take `publicKey` (`RsaPublicKey`).

Returns `Tuple<Bytes,Bytes>`. Uses [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.importRsa"></a>
#### `Crypto.importRsa` · [source](contracts.md#code)

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

**Inputs:** Take `modulus` (`Bytes`). Take `exponent` (`Bytes`).

Returns `RsaPublicKey`. Uses [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Can fail with `CryptoError`.

<a id="symbol-Crypto.passwordHash"></a>
#### `Crypto.passwordHash` · [source](contracts.md#code)

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

**Inputs:** Take `password` (`Bytes`). Take `salt` (`Bytes`). Take `iterations` (`int`).

Returns `Bytes`. Uses [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Can fail with `CryptoError`.

<a id="symbol-GnuTlsCrypto"></a>
### `GnuTlsCrypto` · class · [source](contracts.md#code)

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. Implements [`Crypto`](contracts.md#symbol-Crypto).

<a id="symbol-GnuTlsCrypto.random"></a>
#### `GnuTlsCrypto.random` · [source](contracts.md#code)

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

**Inputs:** Take `size` (`int`).

Returns `Bytes`. Uses [`Crypto.random`](contracts.md#symbol-Crypto.random). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) with `size`.

<a id="symbol-GnuTlsCrypto.sha256"></a>
#### `GnuTlsCrypto.sha256` · [source](contracts.md#code)

Hash the complete input using SHA-256.

**Inputs:** Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) with `input`.

<a id="symbol-GnuTlsCrypto.generateRsa"></a>
#### `GnuTlsCrypto.generateRsa` · [source](contracts.md#code)

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Returns `RsaPrivateKey`. Uses [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa).

<a id="symbol-GnuTlsCrypto.publicRsa"></a>
#### `GnuTlsCrypto.publicRsa` · [source](contracts.md#code)

Export the corresponding public key as an opaque immutable value.

**Inputs:** Take `key` (`RsaPrivateKey`).

Returns `RsaPublicKey`. Uses [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) with `key`.

<a id="symbol-GnuTlsCrypto.signRsa"></a>
#### `GnuTlsCrypto.signRsa` · [source](contracts.md#code)

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

**Inputs:** Take `key` (`RsaPrivateKey`). Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) with `key`, `input`.

<a id="symbol-GnuTlsCrypto.verifyRsa"></a>
#### `GnuTlsCrypto.verifyRsa` · [source](contracts.md#code)

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

**Inputs:** Take `publicKey` (`RsaPublicKey`). Take `input` (`Bytes`). Take `signature` (`Bytes`).

Returns `bool`. Uses [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) with `publicKey`, `input`, `signature`.

<a id="symbol-GnuTlsCrypto.decodeBase64url"></a>
#### `GnuTlsCrypto.decodeBase64url` · [source](contracts.md#code)

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

**Inputs:** Take `input` (`string`).

Returns `Bytes`. Uses [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) with `input`.

<a id="symbol-GnuTlsCrypto.equal"></a>
#### `GnuTlsCrypto.equal` · [source](contracts.md#code)

Compare bytes without early exit on their contents. Length remains observable.

**Inputs:** Take `left` (`Bytes`). Take `right` (`Bytes`).

Returns `bool`. Uses [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) with `left`, `right`.

<a id="symbol-GnuTlsCrypto.exportRsa"></a>
#### `GnuTlsCrypto.exportRsa` · [source](contracts.md#code)

Export unsigned big-endian modulus and exponent for an RSA JWK.

**Inputs:** Take `publicKey` (`RsaPublicKey`).

Returns `Tuple<Bytes,Bytes>`. Uses [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) with `publicKey`.

<a id="symbol-GnuTlsCrypto.importRsa"></a>
#### `GnuTlsCrypto.importRsa` · [source](contracts.md#code)

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

**Inputs:** Take `modulus` (`Bytes`). Take `exponent` (`Bytes`).

Returns `RsaPublicKey`. Uses [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) with `modulus`, `exponent`.

<a id="symbol-GnuTlsCrypto.passwordHash"></a>
#### `GnuTlsCrypto.passwordHash` · [source](contracts.md#code)

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

**Inputs:** Take `password` (`Bytes`). Take `salt` (`Bytes`). Take `iterations` (`int`).

Returns `Bytes`. Uses [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Can fail with `CryptoError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) with `password`, `salt`, `iterations`.

<a id="symbol-_aug_crypto_random"></a>
### `_aug_crypto_random` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `size` (`int`).

Returns `Bytes`. Uses [`Crypto.random`](contracts.md#symbol-Crypto.random). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_sha256"></a>
### `_aug_crypto_sha256` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_generate_rsa"></a>
### `_aug_crypto_generate_rsa` · [source](contracts.md#code)

Private to its defining scope.

Returns `RsaPrivateKey`. Uses [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_public_rsa"></a>
### `_aug_crypto_public_rsa` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `key` (`RsaPrivateKey`).

Returns `RsaPublicKey`. Uses [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_sign_rsa"></a>
### `_aug_crypto_sign_rsa` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `key` (`RsaPrivateKey`). Take `input` (`Bytes`).

Returns `Bytes`. Uses [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_verify_rsa"></a>
### `_aug_crypto_verify_rsa` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `publicKey` (`RsaPublicKey`). Take `input` (`Bytes`). Take `signature` (`Bytes`).

Returns `bool`. Uses [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_decode_base64url"></a>
### `_aug_crypto_decode_base64url` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `input` (`string`).

Returns `Bytes`. Uses [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_equal"></a>
### `_aug_crypto_equal` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `left` (`Bytes`). Take `right` (`Bytes`).

Returns `bool`. Uses [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_export_rsa"></a>
### `_aug_crypto_export_rsa` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `publicKey` (`RsaPublicKey`).

Returns `Tuple<Bytes,Bytes>`. Uses [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_import_rsa"></a>
### `_aug_crypto_import_rsa` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `modulus` (`Bytes`). Take `exponent` (`Bytes`).

Returns `RsaPublicKey`. Uses [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_crypto_password_hash"></a>
### `_aug_crypto_password_hash` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `password` (`Bytes`). Take `salt` (`Bytes`). Take `iterations` (`int`).

Returns `Bytes`. Uses [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Can fail with `CryptoError`.

Native C implementation; only its declared contract is visible here.

::::

:::::

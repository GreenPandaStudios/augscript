---
generated: true
source: src/stdlib/crypto
editLink: false
---

# august.crypto

Public declarations exported by this module. Import names explicitly from `august.crypto`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [Crypto](#api-Crypto)
- [GnuTlsCrypto](#api-GnuTlsCrypto)
- [JwtError](#api-JwtError)
- [RsaJwk](#api-RsaJwk)
- [RsaJwks](#api-RsaJwks)
- [rsaJwk](#api-rsaJwk)
- [importJwk](#api-importJwk)
- [signJwt](#api-signJwt)
- [verifyJwt](#api-verifyJwt)

## Crypto {#api-Crypto}

```text
capability Crypto
```

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L3)

### Crypto.random

```text
random(int size) returns Bytes uses Crypto.random unless CryptoError
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L5)

### Crypto.sha256

```text
sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
```

Hash the complete input using SHA-256.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L7)

### Crypto.generateRsa

```text
generateRsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L9)

### Crypto.publicRsa

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
```

Export the corresponding public key as an opaque immutable value.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L11)

### Crypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L13)

### Crypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L15)

### Crypto.decodeBase64url

```text
decodeBase64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L17)

### Crypto.equal

```text
equal(Bytes left, Bytes right) returns bool uses Crypto.equal
```

Compare bytes without early exit on their contents. Length remains observable.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L19)

### Crypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> uses Crypto.exportRsa unless CryptoError
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L21)

### Crypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L23)

### Crypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L25)

## GnuTlsCrypto {#api-GnuTlsCrypto}

```text
GnuTlsCrypto() implements Crypto
```

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L40)

### GnuTlsCrypto.random

```text
random(int size)
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

The compiler infers a `Bytes` result, use of `Crypto.random`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L41)

### GnuTlsCrypto.sha256

```text
sha256(Bytes input)
```

Hash the complete input using SHA-256.

The compiler infers a `Bytes` result, use of `Crypto.sha256`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L44)

### GnuTlsCrypto.generateRsa

```text
generateRsa()
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

The compiler infers a `RsaPrivateKey` result, use of `Crypto.generateRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L47)

### GnuTlsCrypto.publicRsa

```text
publicRsa(RsaPrivateKey key)
```

Export the corresponding public key as an opaque immutable value.

The compiler infers a `RsaPublicKey` result, use of `Crypto.publicRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L50)

### GnuTlsCrypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input)
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

The compiler infers a `Bytes` result, use of `Crypto.signRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L53)

### GnuTlsCrypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature)
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

The compiler infers a `bool` result, use of `Crypto.verifyRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L56)

### GnuTlsCrypto.decodeBase64url

```text
decodeBase64url(string input)
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

The compiler infers a `Bytes` result, use of `Crypto.decodeBase64url`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L59)

### GnuTlsCrypto.equal

```text
equal(Bytes left, Bytes right)
```

Compare bytes without early exit on their contents. Length remains observable.

The compiler infers a `bool` result, use of `Crypto.equal`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L62)

### GnuTlsCrypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey)
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

The compiler infers a `Tuple<Bytes, Bytes>` result, use of `Crypto.exportRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L65)

### GnuTlsCrypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent)
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

The compiler infers a `RsaPublicKey` result, use of `Crypto.importRsa`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L68)

### GnuTlsCrypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations)
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

The compiler infers a `Bytes` result, use of `Crypto.passwordHash`, `CryptoError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L71)

## JwtError {#api-JwtError}

```text
JwtError() implements Error
```

A failed JOSE validation reveals no unverified claims.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L6)

## RsaJwk {#api-RsaJwk}

```text
record RsaJwk(string kty, string kid, string alg, string use, string n, string e)
```

Public signing-key metadata in RFC 7517 / RFC 7518 form.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L11)

## RsaJwks {#api-RsaJwks}

```text
record RsaJwks(List<RsaJwk> keys)
```

The signature defines this public contract.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L12)

## rsaJwk {#api-rsaJwk}

```text
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto)
```

Export public parameters. Private key material never enters the JSON document.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L15)

## importJwk {#api-importJwk}

```text
importJwk(RsaJwk jwk, resolve Crypto crypto)
```

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L20)

## signJwt {#api-signJwt}

```text
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto)
```

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L31)

## verifyJwt {#api-verifyJwt}

```text
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto)
```

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L44)

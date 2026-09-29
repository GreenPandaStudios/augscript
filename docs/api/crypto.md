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

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L2)

### Crypto.random

```text
random(int size) returns Bytes uses Crypto.random unless CryptoError
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L4)

### Crypto.sha256

```text
sha256(Bytes input) returns Bytes uses Crypto.sha256 unless CryptoError
```

Hash the complete input using SHA-256.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L6)

### Crypto.generateRsa

```text
generateRsa() returns RsaPrivateKey uses Crypto.generateRsa unless CryptoError
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L8)

### Crypto.publicRsa

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey uses Crypto.publicRsa unless CryptoError
```

Export the corresponding public key as an opaque immutable value.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L10)

### Crypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes uses Crypto.signRsa unless CryptoError
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L12)

### Crypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool uses Crypto.verifyRsa unless CryptoError
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L14)

### Crypto.decodeBase64url

```text
decodeBase64url(string input) returns Bytes uses Crypto.decodeBase64url unless CryptoError
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L16)

### Crypto.equal

```text
equal(Bytes left, Bytes right) returns bool uses Crypto.equal
```

Compare bytes without early exit on their contents. Length remains observable.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L18)

### Crypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> uses Crypto.exportRsa unless CryptoError
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L20)

### Crypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey uses Crypto.importRsa unless CryptoError
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L22)

### Crypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes uses Crypto.passwordHash unless CryptoError
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L24)

## GnuTlsCrypto {#api-GnuTlsCrypto}

```text
GnuTlsCrypto() implements Crypto
```

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L39)

### GnuTlsCrypto.random

```text
random(int size) returns Bytes unless CryptoError
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

Inferred capabilities: `Crypto.random`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L40)

### GnuTlsCrypto.sha256

```text
sha256(Bytes input) returns Bytes unless CryptoError
```

Hash the complete input using SHA-256.

Inferred capabilities: `Crypto.sha256`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L43)

### GnuTlsCrypto.generateRsa

```text
generateRsa() returns RsaPrivateKey unless CryptoError
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Inferred capabilities: `Crypto.generateRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L46)

### GnuTlsCrypto.publicRsa

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError
```

Export the corresponding public key as an opaque immutable value.

Inferred capabilities: `Crypto.publicRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L49)

### GnuTlsCrypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

Inferred capabilities: `Crypto.signRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L52)

### GnuTlsCrypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

Inferred capabilities: `Crypto.verifyRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L55)

### GnuTlsCrypto.decodeBase64url

```text
decodeBase64url(string input) returns Bytes unless CryptoError
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

Inferred capabilities: `Crypto.decodeBase64url`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L58)

### GnuTlsCrypto.equal

```text
equal(Bytes left, Bytes right) returns bool
```

Compare bytes without early exit on their contents. Length remains observable.

Inferred capabilities: `Crypto.equal`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L61)

### GnuTlsCrypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> unless CryptoError
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

Inferred capabilities: `Crypto.exportRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L64)

### GnuTlsCrypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

Inferred capabilities: `Crypto.importRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L67)

### GnuTlsCrypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

Inferred capabilities: `Crypto.passwordHash`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L70)

## JwtError {#api-JwtError}

```text
JwtError() implements Error
```

A failed JOSE validation reveals no unverified claims.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L5)

## RsaJwk {#api-RsaJwk}

```text
record RsaJwk(string kty, string kid, string alg, string use, string n, string e)
```

Public signing-key metadata in RFC 7517 / RFC 7518 form.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L10)

## RsaJwks {#api-RsaJwks}

```text
record RsaJwks(List<RsaJwk> keys)
```

The signature defines this public contract.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L11)

## rsaJwk {#api-rsaJwk}

```text
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) returns RsaJwk uses crypto.exportRsa unless CryptoError
```

Export public parameters. Private key material never enters the JSON document.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L14)

## importJwk {#api-importJwk}

```text
importJwk(RsaJwk jwk, resolve Crypto crypto) returns RsaPublicKey uses crypto.decodeBase64url and crypto.importRsa unless JwtError
```

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L19)

## signJwt {#api-signJwt}

```text
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto) returns string uses crypto.signRsa unless JwtError
```

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L30)

## verifyJwt {#api-verifyJwt}

```text
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto) returns Json uses crypto.decodeBase64url and crypto.verifyRsa unless JwtError
```

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L43)

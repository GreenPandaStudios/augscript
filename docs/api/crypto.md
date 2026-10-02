---
generated: true
source: src/stdlib/crypto
editLink: false
---

# august.crypto

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/crypto --as crypto`, then import its public names from `crypto`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## Crypto {#api-Crypto}

```text
capability Crypto
```

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L3)

### Crypto.random

```text
random(int size) returns Bytes unless CryptoError
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

Uses `Crypto.random`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L5)

### Crypto.sha256

```text
sha256(Bytes input) returns Bytes unless CryptoError
```

Hash the complete input using SHA-256.

Uses `Crypto.sha256`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L7)

### Crypto.generateRsa

```text
generateRsa() returns RsaPrivateKey unless CryptoError
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Uses `Crypto.generateRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L9)

### Crypto.publicRsa

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError
```

Export the corresponding public key as an opaque immutable value.

Uses `Crypto.publicRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L11)

### Crypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

Uses `Crypto.signRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L13)

### Crypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

Uses `Crypto.verifyRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L15)

### Crypto.decodeBase64url

```text
decodeBase64url(string input) returns Bytes unless CryptoError
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

Uses `Crypto.decodeBase64url`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L17)

### Crypto.equal

```text
equal(Bytes left, Bytes right) returns bool
```

Compare bytes without early exit on their contents. Length remains observable.

Uses `Crypto.equal`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L19)

### Crypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> unless CryptoError
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

Uses `Crypto.exportRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L21)

### Crypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

Uses `Crypto.importRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L23)

### Crypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

Uses `Crypto.passwordHash`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L25)

## GnuTlsCrypto {#api-GnuTlsCrypto}

```text
GnuTlsCrypto() implements Crypto
```

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L40)

### GnuTlsCrypto.random

```text
random(int size) returns Bytes unless CryptoError
```

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG.

Uses `Crypto.random`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L41)

### GnuTlsCrypto.sha256

```text
sha256(Bytes input) returns Bytes unless CryptoError
```

Hash the complete input using SHA-256.

Uses `Crypto.sha256`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L44)

### GnuTlsCrypto.generateRsa

```text
generateRsa() returns RsaPrivateKey unless CryptoError
```

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

Uses `Crypto.generateRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L47)

### GnuTlsCrypto.publicRsa

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError
```

Export the corresponding public key as an opaque immutable value.

Uses `Crypto.publicRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L50)

### GnuTlsCrypto.signRsa

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError
```

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256).

Uses `Crypto.signRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L53)

### GnuTlsCrypto.verifyRsa

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError
```

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError.

Uses `Crypto.verifyRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L56)

### GnuTlsCrypto.decodeBase64url

```text
decodeBase64url(string input) returns Bytes unless CryptoError
```

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits.

Uses `Crypto.decodeBase64url`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L59)

### GnuTlsCrypto.equal

```text
equal(Bytes left, Bytes right) returns bool
```

Compare bytes without early exit on their contents. Length remains observable.

Uses `Crypto.equal`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L62)

### GnuTlsCrypto.exportRsa

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> unless CryptoError
```

Export unsigned big-endian modulus and exponent for an RSA JWK.

Uses `Crypto.exportRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L65)

### GnuTlsCrypto.importRsa

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError
```

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits.

Uses `Crypto.importRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/contracts.aug#L68)

### GnuTlsCrypto.passwordHash

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError
```

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000.

Uses `Crypto.passwordHash`.

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

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L12)

## rsaJwk {#api-rsaJwk}

```text
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) returns RsaJwk unless CryptoError
```

Export public parameters. Private key material never enters the JSON document.

Uses `Crypto.exportRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L15)

## importJwk {#api-importJwk}

```text
importJwk(RsaJwk jwk, resolve Crypto crypto) returns RsaPublicKey unless JwtError
```

Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL.

Uses `Crypto.decodeBase64url` and `Crypto.importRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L20)

## signJwt {#api-signJwt}

```text
signJwt(
    RsaPrivateKey key,
    Json claims,
    string kid,
    string tokenType,
    resolve Crypto crypto
) returns string unless JwtError
```

Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token.

Uses `Crypto.signRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L31)

## verifyJwt {#api-verifyJwt}

```text
verifyJwt(
    string token,
    RsaPublicKey publicKey,
    string kid,
    string tokenType,
    resolve Crypto crypto
) returns Json unless JwtError
```

Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs.

Uses `Crypto.decodeBase64url` and `Crypto.verifyRsa`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/crypto/jose.aug#L44)

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
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> uses Crypto.exportRsa unless CryptoError
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
extern C value _aug_crypto_export_rsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> uses Crypto.exportRsa unless CryptoError
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
    exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> unless CryptoError:
        unsafe:
            return _aug_crypto_export_rsa(publicKey)
    importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError:
        unsafe:
            return _aug_crypto_import_rsa(modulus, exponent)
    passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError:
        unsafe:
            return _aug_crypto_password_hash(password, salt, iterations)

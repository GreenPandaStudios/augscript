---
title: "packages/@git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug`

[OpenID Connect login application](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNTFkODVkYmFlYmYyODk3NDAxODA5NzQ5ZmI0NDIwYTIzMDdkNGIwNmIzMWQzODA4ZmFiYTU2OTEwYTMwOTc5NSIsImZvcm1hdHRlZFNoYTI1NiI6IjUzMjYwZWM1ODczOTYyZTk0NzQ5Y2Q0NjZjNDJiYzhiODkxMTIwNGY5YWE3MDgxZjU4NWVkNWIyNzI5NjRiNTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1DcnlwdG8ucmFuZG9tIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1DcnlwdG8uc2hhMjU2Il19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1DcnlwdG8uZ2VuZXJhdGVSc2EiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLUNyeXB0by5wdWJsaWNSc2EiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLUNyeXB0by5zaWduUnNhIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02IiwiI3N5bWJvbC1DcnlwdG8udmVyaWZ5UnNhIl19LHsiaWQiOiJzb3VyY2UtTDE4IiwiZmlyc3QiOjE4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC03IiwiI3N5bWJvbC1DcnlwdG8uZGVjb2RlQmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDIwIiwiZmlyc3QiOjIwLCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC1DcnlwdG8uZXF1YWwiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjIsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiLCIjc3ltYm9sLUNyeXB0by5leHBvcnRSc2EiXX0seyJpZCI6InNvdXJjZS1MMjQiLCJmaXJzdCI6MjQsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEwIiwiI3N5bWJvbC1DcnlwdG8uaW1wb3J0UnNhIl19LHsiaWQiOiJzb3VyY2UtTDI2IiwiZmlyc3QiOjI2LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMSIsIiNzeW1ib2wtQ3J5cHRvLnBhc3N3b3JkSGFzaCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjoyNywibGFzdCI6MjcsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3JhbmRvbSJdfSx7ImlkIjoic291cmNlLUwyOSIsImZpcnN0IjoyOCwibGFzdCI6MjgsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTMiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3NoYTI1NiJdfSx7ImlkIjoic291cmNlLUwzMCIsImZpcnN0IjoyOSwibGFzdCI6MjksImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTQiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX2dlbmVyYXRlX3JzYSJdfSx7ImlkIjoic291cmNlLUwzMSIsImZpcnN0IjozMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3B1YmxpY19yc2EiXX0seyJpZCI6InNvdXJjZS1MMzIiLCJmaXJzdCI6MzEsImxhc3QiOjMxLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE2IiwiI3N5bWJvbC1fYXVnX2NyeXB0b19zaWduX3JzYSJdfSx7ImlkIjoic291cmNlLUwzMyIsImZpcnN0IjozMiwibGFzdCI6MzIsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTciLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3ZlcmlmeV9yc2EiXX0seyJpZCI6InNvdXJjZS1MMzQiLCJmaXJzdCI6MzMsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE4IiwiI3N5bWJvbC1fYXVnX2NyeXB0b19kZWNvZGVfYmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjM0LCJsYXN0IjozNCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOSIsIiNzeW1ib2wtX2F1Z19jcnlwdG9fZXF1YWwiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6MzUsImxhc3QiOjM1LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIwIiwiI3N5bWJvbC1fYXVnX2NyeXB0b19leHBvcnRfcnNhIl19LHsiaWQiOiJzb3VyY2UtTDM3IiwiZmlyc3QiOjM2LCJsYXN0IjozNiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMSIsIiNzeW1ib2wtX2F1Z19jcnlwdG9faW1wb3J0X3JzYSJdfSx7ImlkIjoic291cmNlLUwzOCIsImZpcnN0IjozNywibGFzdCI6MzcsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjIiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3Bhc3N3b3JkX2hhc2giXX0seyJpZCI6InNvdXJjZS1MNDEiLCJmaXJzdCI6MzksImxhc3QiOjcyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIzIiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8iXX0seyJpZCI6InNvdXJjZS1MNDIiLCJmaXJzdCI6NDAsImxhc3QiOjQyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTI0IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8ucmFuZG9tIl19LHsiaWQiOiJzb3VyY2UtTDQ1IiwiZmlyc3QiOjQzLCJsYXN0Ijo0NSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yNSIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLnNoYTI1NiJdfSx7ImlkIjoic291cmNlLUw0OCIsImZpcnN0Ijo0NiwibGFzdCI6NDgsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjYiLCIjc3ltYm9sLUdudVRsc0NyeXB0by5nZW5lcmF0ZVJzYSJdfSx7ImlkIjoic291cmNlLUw1MSIsImZpcnN0Ijo0OSwibGFzdCI6NTEsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjciLCIjc3ltYm9sLUdudVRsc0NyeXB0by5wdWJsaWNSc2EiXX0seyJpZCI6InNvdXJjZS1MNTQiLCJmaXJzdCI6NTIsImxhc3QiOjU0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTI4IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8uc2lnblJzYSJdfSx7ImlkIjoic291cmNlLUw1NyIsImZpcnN0Ijo1NSwibGFzdCI6NTcsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjkiLCIjc3ltYm9sLUdudVRsc0NyeXB0by52ZXJpZnlSc2EiXX0seyJpZCI6InNvdXJjZS1MNjAiLCJmaXJzdCI6NTgsImxhc3QiOjYwLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMwIiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8uZGVjb2RlQmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDYzIiwiZmlyc3QiOjYxLCJsYXN0Ijo2MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zMSIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLmVxdWFsIl19LHsiaWQiOiJzb3VyY2UtTDY2IiwiZmlyc3QiOjY0LCJsYXN0Ijo2NiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zMiIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLmV4cG9ydFJzYSJdfSx7ImlkIjoic291cmNlLUw2OSIsImZpcnN0Ijo2NywibGFzdCI6NjksImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMzMiLCIjc3ltYm9sLUdudVRsc0NyeXB0by5pbXBvcnRSc2EiXX0seyJpZCI6InNvdXJjZS1MNzIiLCJmaXJzdCI6NzAsImxhc3QiOjcyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTM0IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8ucGFzc3dvcmRIYXNoIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNyeXB0byJdfSx7ImlkIjoic291cmNlLUw0My1MNDQiLCJmaXJzdCI6NDEsImxhc3QiOjQyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNDYtTDQ3IiwiZmlyc3QiOjQ0LCJsYXN0Ijo0NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQ5LUw1MCIsImZpcnN0Ijo0NywibGFzdCI6NDgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw1Mi1MNTMiLCJmaXJzdCI6NTAsImxhc3QiOjUxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX0seyJpZCI6InNvdXJjZS1MNTUtTDU2IiwiZmlyc3QiOjUzLCJsYXN0Ijo1NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDU4LUw1OSIsImZpcnN0Ijo1NiwibGFzdCI6NTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUw2MS1MNjIiLCJmaXJzdCI6NTksImxhc3QiOjYwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNjQtTDY1IiwiZmlyc3QiOjYyLCJsYXN0Ijo2MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04Il19LHsiaWQiOiJzb3VyY2UtTDY3LUw2OCIsImZpcnN0Ijo2NSwibGFzdCI6NjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOSJdfSx7ImlkIjoic291cmNlLUw3MC1MNzEiLCJmaXJzdCI6NjgsImxhc3QiOjY5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEwIl19LHsiaWQiOiJzb3VyY2UtTDczLUw3NCIsImZpcnN0Ijo3MSwibGFzdCI6NzIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiXX1dfQ
// Generated by aug spec. This is a copy of the installed dependency source.
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNTFkODVkYmFlYmYyODk3NDAxODA5NzQ5ZmI0NDIwYTIzMDdkNGIwNmIzMWQzODA4ZmFiYTU2OTEwYTMwOTc5NSIsImZvcm1hdHRlZFNoYTI1NiI6IjIzYmI2YjIyMjE5ODY3NmJkYzNjZmEyOGQ5NWZhNDg5MGI4YTJlM2YyMzIzNzZhYWQ0MDcxY2JjZDRlODZiMGYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1DcnlwdG8ucmFuZG9tIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1DcnlwdG8uc2hhMjU2Il19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1DcnlwdG8uZ2VuZXJhdGVSc2EiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLUNyeXB0by5wdWJsaWNSc2EiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLUNyeXB0by5zaWduUnNhIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02IiwiI3N5bWJvbC1DcnlwdG8udmVyaWZ5UnNhIl19LHsiaWQiOiJzb3VyY2UtTDE4IiwiZmlyc3QiOjE4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC03IiwiI3N5bWJvbC1DcnlwdG8uZGVjb2RlQmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDIwIiwiZmlyc3QiOjIwLCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC1DcnlwdG8uZXF1YWwiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjIsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiLCIjc3ltYm9sLUNyeXB0by5leHBvcnRSc2EiXX0seyJpZCI6InNvdXJjZS1MMjQiLCJmaXJzdCI6MjQsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEwIiwiI3N5bWJvbC1DcnlwdG8uaW1wb3J0UnNhIl19LHsiaWQiOiJzb3VyY2UtTDI2IiwiZmlyc3QiOjI2LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMSIsIiNzeW1ib2wtQ3J5cHRvLnBhc3N3b3JkSGFzaCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjoyOCwibGFzdCI6MjgsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3JhbmRvbSJdfSx7ImlkIjoic291cmNlLUwyOSIsImZpcnN0IjoyOSwibGFzdCI6MjksImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTMiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3NoYTI1NiJdfSx7ImlkIjoic291cmNlLUwzMCIsImZpcnN0IjozMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTQiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX2dlbmVyYXRlX3JzYSJdfSx7ImlkIjoic291cmNlLUwzMSIsImZpcnN0IjozMSwibGFzdCI6MzEsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3B1YmxpY19yc2EiXX0seyJpZCI6InNvdXJjZS1MMzIiLCJmaXJzdCI6MzIsImxhc3QiOjMyLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE2IiwiI3N5bWJvbC1fYXVnX2NyeXB0b19zaWduX3JzYSJdfSx7ImlkIjoic291cmNlLUwzMyIsImZpcnN0IjozMywibGFzdCI6MzMsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTciLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3ZlcmlmeV9yc2EiXX0seyJpZCI6InNvdXJjZS1MMzQiLCJmaXJzdCI6MzQsImxhc3QiOjM0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE4IiwiI3N5bWJvbC1fYXVnX2NyeXB0b19kZWNvZGVfYmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjM1LCJsYXN0IjozNSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOSIsIiNzeW1ib2wtX2F1Z19jcnlwdG9fZXF1YWwiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6MzYsImxhc3QiOjM2LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIwIiwiI3N5bWJvbC1fYXVnX2NyeXB0b19leHBvcnRfcnNhIl19LHsiaWQiOiJzb3VyY2UtTDM3IiwiZmlyc3QiOjM3LCJsYXN0IjozNywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMSIsIiNzeW1ib2wtX2F1Z19jcnlwdG9faW1wb3J0X3JzYSJdfSx7ImlkIjoic291cmNlLUwzOCIsImZpcnN0IjozOCwibGFzdCI6MzgsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjIiLCIjc3ltYm9sLV9hdWdfY3J5cHRvX3Bhc3N3b3JkX2hhc2giXX0seyJpZCI6InNvdXJjZS1MNDEiLCJmaXJzdCI6NDAsImxhc3QiOjk2LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIzIiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8iXX0seyJpZCI6InNvdXJjZS1MNDIiLCJmaXJzdCI6NDEsImxhc3QiOjQ1LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTI0IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8ucmFuZG9tIl19LHsiaWQiOiJzb3VyY2UtTDQ1IiwiZmlyc3QiOjQ2LCJsYXN0Ijo1MCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yNSIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLnNoYTI1NiJdfSx7ImlkIjoic291cmNlLUw0OCIsImZpcnN0Ijo1MSwibGFzdCI6NTUsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjYiLCIjc3ltYm9sLUdudVRsc0NyeXB0by5nZW5lcmF0ZVJzYSJdfSx7ImlkIjoic291cmNlLUw1MSIsImZpcnN0Ijo1NiwibGFzdCI6NjAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjciLCIjc3ltYm9sLUdudVRsc0NyeXB0by5wdWJsaWNSc2EiXX0seyJpZCI6InNvdXJjZS1MNTQiLCJmaXJzdCI6NjEsImxhc3QiOjY1LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTI4IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8uc2lnblJzYSJdfSx7ImlkIjoic291cmNlLUw1NyIsImZpcnN0Ijo2NiwibGFzdCI6NzAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjkiLCIjc3ltYm9sLUdudVRsc0NyeXB0by52ZXJpZnlSc2EiXX0seyJpZCI6InNvdXJjZS1MNjAiLCJmaXJzdCI6NzEsImxhc3QiOjc1LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMwIiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8uZGVjb2RlQmFzZTY0dXJsIl19LHsiaWQiOiJzb3VyY2UtTDYzIiwiZmlyc3QiOjc2LCJsYXN0Ijo4MCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zMSIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLmVxdWFsIl19LHsiaWQiOiJzb3VyY2UtTDY2IiwiZmlyc3QiOjgxLCJsYXN0Ijo4NSwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zMiIsIiNzeW1ib2wtR251VGxzQ3J5cHRvLmV4cG9ydFJzYSJdfSx7ImlkIjoic291cmNlLUw2OSIsImZpcnN0Ijo4NiwibGFzdCI6OTAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMzMiLCIjc3ltYm9sLUdudVRsc0NyeXB0by5pbXBvcnRSc2EiXX0seyJpZCI6InNvdXJjZS1MNzIiLCJmaXJzdCI6OTEsImxhc3QiOjk1LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTM0IiwiI3N5bWJvbC1HbnVUbHNDcnlwdG8ucGFzc3dvcmRIYXNoIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6MjcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNyeXB0byJdfSx7ImlkIjoic291cmNlLUw0My1MNDQiLCJmaXJzdCI6NDIsImxhc3QiOjQ0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNDYtTDQ3IiwiZmlyc3QiOjQ3LCJsYXN0Ijo0OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQ5LUw1MCIsImZpcnN0Ijo1MiwibGFzdCI6NTQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw1Mi1MNTMiLCJmaXJzdCI6NTcsImxhc3QiOjU5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX0seyJpZCI6InNvdXJjZS1MNTUtTDU2IiwiZmlyc3QiOjYyLCJsYXN0Ijo2NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDU4LUw1OSIsImZpcnN0Ijo2NywibGFzdCI6NjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUw2MS1MNjIiLCJmaXJzdCI6NzIsImxhc3QiOjc0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNjQtTDY1IiwiZmlyc3QiOjc3LCJsYXN0Ijo3OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04Il19LHsiaWQiOiJzb3VyY2UtTDY3LUw2OCIsImZpcnN0Ijo4MiwibGFzdCI6ODQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOSJdfSx7ImlkIjoic291cmNlLUw3MC1MNzEiLCJmaXJzdCI6ODcsImxhc3QiOjg5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEwIl19LHsiaWQiOiJzb3VyY2UtTDczLUw3NCIsImZpcnN0Ijo5MiwibGFzdCI6OTQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiXX1dfQ
// Generated by aug spec. This is a copy of the installed dependency source.
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

[Interactions and sequences](contracts-diagrams.md)

### `Crypto` · capability interface · [source](contracts.md#source-L4) {#symbol-Crypto}

Explicit permission for native cryptographic operations. Keys and bytes are immutable.

#### `Crypto.random` · [source](contracts.md#source-L6) {#symbol-Crypto.random}

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. It takes `size` as an integer.

It returns `Bytes`. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`.

#### `Crypto.sha256` · [source](contracts.md#source-L8) {#symbol-Crypto.sha256}

Hash the complete input using SHA-256. It takes `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`.

#### `Crypto.generateRsa` · [source](contracts.md#source-L10) {#symbol-Crypto.generateRsa}

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation.

It returns `RsaPrivateKey`. It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

#### `Crypto.publicRsa` · [source](contracts.md#source-L12) {#symbol-Crypto.publicRsa}

Export the corresponding public key as an opaque immutable value. It takes `key` as `RsaPrivateKey`.

It returns `RsaPublicKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`.

#### `Crypto.signRsa` · [source](contracts.md#source-L14) {#symbol-Crypto.signRsa}

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). It takes `key` as `RsaPrivateKey` and `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`.

#### `Crypto.verifyRsa` · [source](contracts.md#source-L16) {#symbol-Crypto.verifyRsa}

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`.

It returns `bool`. It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`.

#### `Crypto.decodeBase64url` · [source](contracts.md#source-L18) {#symbol-Crypto.decodeBase64url}

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. It takes `input` as a string.

It returns `Bytes`. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`.

#### `Crypto.equal` · [source](contracts.md#source-L20) {#symbol-Crypto.equal}

Compare bytes without early exit on their contents. Length remains observable. It takes `left` and `right` as `Bytes`.

It returns `bool`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

#### `Crypto.exportRsa` · [source](contracts.md#source-L22) {#symbol-Crypto.exportRsa}

Export unsigned big-endian modulus and exponent for an RSA JWK. It takes `publicKey` as `RsaPublicKey`.

It returns `Tuple<Bytes,Bytes>`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`.

#### `Crypto.importRsa` · [source](contracts.md#source-L24) {#symbol-Crypto.importRsa}

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. It takes `modulus` and `exponent` as `Bytes`.

It returns `RsaPublicKey`. It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`.

#### `Crypto.passwordHash` · [source](contracts.md#source-L26) {#symbol-Crypto.passwordHash}

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. It takes `password` and `salt` as `Bytes` and `iterations` as an integer.

It returns `Bytes`. It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`.

### `GnuTlsCrypto` · class · [source](contracts.md#source-L41) {#symbol-GnuTlsCrypto}

GnuTLS-backed capability adapter. Its constructor performs no I/O or key generation. It implements [`Crypto`](contracts.md#symbol-Crypto).

#### `GnuTlsCrypto.random` · [source](contracts.md#source-L42) {#symbol-GnuTlsCrypto.random}

Generate unpredictable bytes with the operating-system-backed GnuTLS RNG. It takes `size` as an integer. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-1
Within an unsafe block, it returns [`_aug_crypto_random`](contracts.md#symbol-_aug_crypto_random) with `size`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L43-L44)
:::

::: details Checked interface

```text
random(int size) returns Bytes unless CryptoError uses Crypto.random
```

It takes `size` as an integer. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.sha256` · [source](contracts.md#source-L45) {#symbol-GnuTlsCrypto.sha256}

Hash the complete input using SHA-256. It takes `input` as `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-2
Within an unsafe block, it returns [`_aug_crypto_sha256`](contracts.md#symbol-_aug_crypto_sha256) with `input`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L46-L47)
:::

::: details Checked interface

```text
sha256(Bytes input) returns Bytes unless CryptoError uses Crypto.sha256
```

It takes `input` as `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.generateRsa` · [source](contracts.md#source-L48) {#symbol-GnuTlsCrypto.generateRsa}

Create a fresh 3072-bit RSA private key. Private material is opaque and scrubbed on reclamation. It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-3
Within an unsafe block, it returns [`_aug_crypto_generate_rsa`](contracts.md#symbol-_aug_crypto_generate_rsa). Native operations must satisfy their declared C contracts. [source](contracts.md#source-L49-L50)
:::

::: details Checked interface

```text
generateRsa() returns RsaPrivateKey unless CryptoError uses Crypto.generateRsa
```

It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.publicRsa` · [source](contracts.md#source-L51) {#symbol-GnuTlsCrypto.publicRsa}

Export the corresponding public key as an opaque immutable value. It takes `key` as `RsaPrivateKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-4
Within an unsafe block, it returns [`_aug_crypto_public_rsa`](contracts.md#symbol-_aug_crypto_public_rsa) with `key`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L52-L53)
:::

::: details Checked interface

```text
publicRsa(RsaPrivateKey key) returns RsaPublicKey unless CryptoError uses Crypto.publicRsa
```

It takes `key` as `RsaPrivateKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.signRsa` · [source](contracts.md#source-L54) {#symbol-GnuTlsCrypto.signRsa}

Sign bytes using RSASSA-PKCS1-v1_5 with SHA-256 (JOSE RS256). It takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-5
Within an unsafe block, it returns [`_aug_crypto_sign_rsa`](contracts.md#symbol-_aug_crypto_sign_rsa) with `key` and `input`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L55-L56)
:::

::: details Checked interface

```text
signRsa(RsaPrivateKey key, Bytes input) returns Bytes unless CryptoError uses Crypto.signRsa
```

It takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.verifyRsa` · [source](contracts.md#source-L57) {#symbol-GnuTlsCrypto.verifyRsa}

Verify only RS256. Invalid signatures return false; invalid keys raise CryptoError. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`.

::: spec-paragraph specification-paragraph-6
It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`. Within an unsafe block, it returns [`_aug_crypto_verify_rsa`](contracts.md#symbol-_aug_crypto_verify_rsa) with `publicKey`, `input`, and `signature`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L58-L59)
:::

::: details Checked interface

```text
verifyRsa(RsaPublicKey publicKey, Bytes input, Bytes signature) returns bool unless CryptoError uses Crypto.verifyRsa
```

It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.decodeBase64url` · [source](contracts.md#source-L60) {#symbol-GnuTlsCrypto.decodeBase64url}

Decode canonical unpadded URL-safe base64, rejecting invalid characters and unused bits. It takes `input` as a string. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-7
Within an unsafe block, it returns [`_aug_crypto_decode_base64url`](contracts.md#symbol-_aug_crypto_decode_base64url) with `input`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L61-L62)
:::

::: details Checked interface

```text
decodeBase64url(string input) returns Bytes unless CryptoError uses Crypto.decodeBase64url
```

It takes `input` as a string. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.equal` · [source](contracts.md#source-L63) {#symbol-GnuTlsCrypto.equal}

Compare bytes without early exit on their contents. Length remains observable. It takes `left` and `right` as `Bytes`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

::: spec-paragraph specification-paragraph-8
Within an unsafe block, it returns [`_aug_crypto_equal`](contracts.md#symbol-_aug_crypto_equal) with `left` and `right`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L64-L65)
:::

::: details Checked interface

```text
equal(Bytes left, Bytes right) returns bool uses Crypto.equal
```

It takes `left` and `right` as `Bytes`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

:::

#### `GnuTlsCrypto.exportRsa` · [source](contracts.md#source-L66) {#symbol-GnuTlsCrypto.exportRsa}

Export unsigned big-endian modulus and exponent for an RSA JWK. It takes `publicKey` as `RsaPublicKey`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`.

::: spec-paragraph specification-paragraph-9
Within an unsafe block, it returns [`_aug_crypto_export_rsa`](contracts.md#symbol-_aug_crypto_export_rsa) with `publicKey`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L67-L68)
:::

::: details Checked interface

```text
exportRsa(RsaPublicKey publicKey) returns Tuple<Bytes, Bytes> unless CryptoError uses Crypto.exportRsa
```

It takes `publicKey` as `RsaPublicKey`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.importRsa` · [source](contracts.md#source-L69) {#symbol-GnuTlsCrypto.importRsa}

Import canonical public RSA parameters. Keys must have 2048 to 8192 bits. It takes `modulus` and `exponent` as `Bytes`.

::: spec-paragraph specification-paragraph-10
It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`. Within an unsafe block, it returns [`_aug_crypto_import_rsa`](contracts.md#symbol-_aug_crypto_import_rsa) with `modulus` and `exponent`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L70-L71)
:::

::: details Checked interface

```text
importRsa(Bytes modulus, Bytes exponent) returns RsaPublicKey unless CryptoError uses Crypto.importRsa
```

It takes `modulus` and `exponent` as `Bytes`. It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`.

:::

#### `GnuTlsCrypto.passwordHash` · [source](contracts.md#source-L72) {#symbol-GnuTlsCrypto.passwordHash}

PBKDF2-HMAC-SHA256, producing 32 bytes. Use a unique 16–64 byte salt; supported work factors are 100,000–2,000,000. It takes `password` and `salt` as `Bytes` and `iterations` as an integer.

::: spec-paragraph specification-paragraph-11
It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`. Within an unsafe block, it returns [`_aug_crypto_password_hash`](contracts.md#symbol-_aug_crypto_password_hash) with `password`, `salt`, and `iterations`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L73-L74)
:::

::: details Checked interface

```text
passwordHash(Bytes password, Bytes salt, int iterations) returns Bytes unless CryptoError uses Crypto.passwordHash
```

It takes `password` and `salt` as `Bytes` and `iterations` as an integer. It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`.

:::

### `_aug_crypto_random` · [source](contracts.md#source-L28) {#symbol-_aug_crypto_random}

It is private to its defining scope. It takes `size` as an integer.

It returns `Bytes`. It can call [`Crypto.random`](contracts.md#symbol-Crypto.random). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_sha256` · [source](contracts.md#source-L29) {#symbol-_aug_crypto_sha256}

It is private to its defining scope. It takes `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.sha256`](contracts.md#symbol-Crypto.sha256). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_generate_rsa` · [source](contracts.md#source-L30) {#symbol-_aug_crypto_generate_rsa}

It is private to its defining scope. It returns `RsaPrivateKey`. It can call [`Crypto.generateRsa`](contracts.md#symbol-Crypto.generateRsa). Failures can raise `CryptoError`.

Native C implementation; only its declared contract is visible here.

### `_aug_crypto_public_rsa` · [source](contracts.md#source-L31) {#symbol-_aug_crypto_public_rsa}

It is private to its defining scope. It takes `key` as `RsaPrivateKey`.

It returns `RsaPublicKey`. It can call [`Crypto.publicRsa`](contracts.md#symbol-Crypto.publicRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_sign_rsa` · [source](contracts.md#source-L32) {#symbol-_aug_crypto_sign_rsa}

It is private to its defining scope. It takes `key` as `RsaPrivateKey` and `input` as `Bytes`.

It returns `Bytes`. It can call [`Crypto.signRsa`](contracts.md#symbol-Crypto.signRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_verify_rsa` · [source](contracts.md#source-L33) {#symbol-_aug_crypto_verify_rsa}

It is private to its defining scope. It takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`.

It returns `bool`. It can call [`Crypto.verifyRsa`](contracts.md#symbol-Crypto.verifyRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_decode_base64url` · [source](contracts.md#source-L34) {#symbol-_aug_crypto_decode_base64url}

It is private to its defining scope. It takes `input` as a string.

It returns `Bytes`. It can call [`Crypto.decodeBase64url`](contracts.md#symbol-Crypto.decodeBase64url). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_equal` · [source](contracts.md#source-L35) {#symbol-_aug_crypto_equal}

It is private to its defining scope. It takes `left` and `right` as `Bytes`. It returns `bool`. It can call [`Crypto.equal`](contracts.md#symbol-Crypto.equal).

Native C implementation; only its declared contract is visible here.

### `_aug_crypto_export_rsa` · [source](contracts.md#source-L36) {#symbol-_aug_crypto_export_rsa}

It is private to its defining scope. It takes `publicKey` as `RsaPublicKey`.

It returns `Tuple<Bytes,Bytes>`. It can call [`Crypto.exportRsa`](contracts.md#symbol-Crypto.exportRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_import_rsa` · [source](contracts.md#source-L37) {#symbol-_aug_crypto_import_rsa}

It is private to its defining scope. It takes `modulus` and `exponent` as `Bytes`.

It returns `RsaPublicKey`. It can call [`Crypto.importRsa`](contracts.md#symbol-Crypto.importRsa). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

### `_aug_crypto_password_hash` · [source](contracts.md#source-L38) {#symbol-_aug_crypto_password_hash}

It is private to its defining scope. It takes `password` and `salt` as `Bytes` and `iterations` as an integer.

It returns `Bytes`. It can call [`Crypto.passwordHash`](contracts.md#symbol-Crypto.passwordHash). Failures can raise `CryptoError`. Native C implementation; only its declared contract is visible here.

::::

:::::

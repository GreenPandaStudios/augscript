import Crypto from august.crypto
/** One development account with a PBKDF2-HMAC-SHA256 verifier. Production account storage is deliberately a separate capability. */
verifyCredentials(string username, string password, resolve Crypto crypto) returns bool uses crypto.passwordHash and crypto.decodeBase64url and crypto.equal unless CryptoError:
    if username.length() > 64 || password.length() > 256:
        return false
    actual = crypto.passwordHash(password=password.bytes(), salt="August demo salt v1".bytes(), iterations=600000)
    expected = crypto.decodeBase64url(input="s70USYF6WohPz2f7VLA9haS_ZgEtenviSf_HG0o7B_A")
    userMatches = crypto.equal(left=username.bytes(), right="ada".bytes())
    passwordMatches = crypto.equal(left=actual, right=expected)
    return userMatches && passwordMatches

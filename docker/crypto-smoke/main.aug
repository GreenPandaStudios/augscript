import Crypto and GnuTlsCrypto from august.crypto

implement Crypto with GnuTlsCrypto
resolve Crypto to crypto

try:
    digest = crypto.sha256(input="abc".bytes())
    print(value=digest.base64url())
catch CryptoError error:
    print(value="crypto failed")

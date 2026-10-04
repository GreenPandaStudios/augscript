import Crypto and GnuTlsCrypto from crypto

implement Crypto with GnuTlsCrypto
resolve Crypto to crypto

try:
    input = "abc".bytes()
    digest = crypto.sha256(input=input)
    print(value=digest.base64url())
    key = crypto.generateRsa()
    publicKey = crypto.publicRsa(key=key)
    signature = crypto.signRsa(key=key, input=input)
    print(value=crypto.verifyRsa(publicKey=publicKey, input=input, signature=signature))
    print(value=crypto.verifyRsa(publicKey=publicKey, input="changed".bytes(), signature=signature))
    pair = crypto.exportRsa(publicKey=publicKey)
    restored = crypto.importRsa(modulus=pair.get(index=0), exponent=pair.get(index=1))
    print(value=crypto.verifyRsa(publicKey=restored, input=input, signature=signature))
catch CryptoError error:
    print(value="unexpected crypto error")

try:
    crypto.random(size=-1)
catch CryptoError error:
    print(value="caught invalid random size")

// aug-spec: "jose.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from contracts
import parse from august.json

/** A failed JOSE validation reveals no unverified claims. */
JwtError() implements Error:
    pass
/** This profile accepts only RS256, a configured key id, and an explicit token type. */
record JwtHeader(string alg, string kid, string typ)
/** Public signing-key metadata in RFC 7517 / RFC 7518 form. */
record RsaJwk(string kty, string kid, string alg, string use, string n, string e)
record RsaJwks(List<RsaJwk> keys)

/** Export public parameters. Private key material never enters the JSON document. */
rsaJwk(RsaPublicKey publicKey, string kid, resolve Crypto crypto) :
    (modulus, exponent) = crypto.exportRsa(publicKey)
    return RsaJwk(kty="RSA", kid=kid, alg="RS256", use="sig", n=modulus.base64url(), e=exponent.base64url())

/** Import only an RSA signing key for RS256. The transport caller selects the trusted JWKS URL. */
importJwk(RsaJwk jwk, resolve Crypto crypto) :
    if jwk.kty != "RSA" or jwk.alg != "RS256" or jwk.use != "sig":
        throw JwtError()
    try:
        modulus = crypto.decodeBase64url(input=jwk.n)
        exponent = crypto.decodeBase64url(input=jwk.e)
        return crypto.importRsa(modulus, exponent)
    catch CryptoError error:
        throw JwtError()

/** Sign immutable JSON with an explicit key id and token type. Claims are validated by the protocol that consumes the token. */
signJwt(RsaPrivateKey key, Json claims, string kid, string tokenType, resolve Crypto crypto) :
    try:
        header = Json(value=JwtHeader(alg="RS256", kid=kid, typ=tokenType)).stringify()
        payload = claims.stringify()
        signing = header.bytes().base64url() + "." + payload.bytes().base64url()
        signature = crypto.signRsa(key=key, input=signing.bytes())
        return signing + "." + signature.base64url()
    catch CryptoError error:
        throw JwtError()
    catch JsonError error:
        throw JwtError()

/** Verify the signature and configured algorithm, key id, and type before exposing the JSON payload. Never follows token-supplied URLs. */
verifyJwt(string token, RsaPublicKey publicKey, string kid, string tokenType, resolve Crypto crypto) :
    if token.length() > 16384:
        throw JwtError()
    parts = token.split(separator=".")
    if parts.length() != 3:
        throw JwtError()
    try:
        first = parts.get(index=0)
        second = parts.get(index=1)
        third = parts.get(index=2)
        header = parse(input=crypto.decodeBase64url(input=first).text()).decode<JwtHeader>()
        if header.alg != "RS256" or header.kid != kid or header.typ != tokenType:
            throw JwtError()
        signature = crypto.decodeBase64url(input=third)
        if not crypto.verifyRsa(publicKey=publicKey, input=(first + "." + second).bytes(), signature=signature):
            throw JwtError()
        return parse(input=crypto.decodeBase64url(input=second).text())
    catch CryptoError error:
        throw JwtError()
    catch ConversionError error:
        throw JwtError()
    catch JsonError error:
        throw JwtError()
    catch IndexError error:
        throw JwtError()

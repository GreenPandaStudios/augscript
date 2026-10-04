// aug-spec: "jose.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from contracts
import parse from "https://github.com/GreenPandaStudios/augscript/src/stdlib/json#v0.19.0"

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

/** Verify an Ed25519 JWT before exposing its claims. The caller supplies trusted
 * issuer, audience, token type, current epoch seconds, and the maximum lifetime.
 * sub, iat and exp are required. No token-supplied key location is followed. */
verifyIdentityToken(string token, string publicKey, string issuer, string audience, string tokenType, int now, int maximumAge, resolve Crypto crypto) returns Json:
    if token.utf16Length() == 0 or token.utf16Length() > 4096 or now < 0 or maximumAge < 1 or maximumAge > 3600:
        throw JwtError()
    parts = token.split(separator=".")
    if parts.length() != 3:
        throw JwtError()
    try:
        first = parts.get(index=0)
        second = parts.get(index=1)
        third = parts.get(index=2)
        header = parse(input=crypto.decodeBase64url(input=first).text())
        if header.require(name="alg").string() != "EdDSA" or header.require(name="typ").string() != tokenType or header.has(name="crit") or header.has(name="b64"):
            throw JwtError()
        signature = crypto.decodeBase64url(input=third)
        if not crypto.verifyEd25519(publicKey, input=(first + "." + second).bytes(), signature):
            throw JwtError()
        claims = parse(input=crypto.decodeBase64url(input=second).text())
        if claims.require(name="iss").string() != issuer:
            throw JwtError()
        target = claims.require(name="aud")
        allowed = false
        try:
            allowed = target.string() == audience
        catch JsonError error:
            for entry in target.items():
                if entry.string() == audience:
                    allowed = true
        if not allowed:
            throw JwtError()
        subject = claims.require(name="sub").string()
        issued = claims.require(name="iat").integer()
        expires = claims.require(name="exp").integer()
        if subject.trim().utf16Length() == 0 or subject.utf16Length() > 512 or issued < 0 or issued > 9007199254740991 or expires < 0 or expires > 9007199254740991:
            throw JwtError()
        if issued > now or now - issued > maximumAge or expires <= now or expires <= issued or expires - issued > maximumAge:
            throw JwtError()
        return claims
    catch CryptoError error:
        throw JwtError()
    catch ConversionError error:
        throw JwtError()
    catch JsonError error:
        throw JwtError()
    catch IndexError error:
        throw JwtError()

/** Validate one configured identity-token profile. A failed check exposes no claims. */
interface IdentityVerifier:
    verify(string token, int now) returns Json unless JwtError uses Crypto.decodeBase64url, Crypto.verifyEd25519
/** Bind trusted key and identity settings once. The caller supplies the current epoch seconds for each verification. */
Ed25519IdentityVerifier(resolve Crypto crypto, string publicKey, string issuer, string audience, string tokenType, int maximumAge) implements IdentityVerifier:
    verify(string token, int now) returns Json:
        return verifyIdentityToken(token, publicKey, issuer, audience, tokenType, now, maximumAge)

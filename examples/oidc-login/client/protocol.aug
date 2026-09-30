// aug-spec: "protocol.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionError from contracts
import Discovery and IdClaims from provider
import settings from common
import HttpClient from august.web
import parse from august.json
import Crypto and GnuTlsCrypto and RsaJwks and rsaJwk and signJwt and importJwk and verifyJwt and JwtError from august.crypto

/** Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. */
responseJson(HttpResponse<Bytes> response) returns Json unless SessionError:
    if response.status != 200:
        throw SessionError()
    match response.headers.get(name="content-type"):
        when null:
            throw SessionError()
        when some contentType:
            if (not contentType.startsWith(prefix="application/json")):
                throw SessionError()
    try:
        return parse(input=response.body.text())
    catch ConversionError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()

/** Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. */
discover(resolve HttpClient client) returns Discovery uses client.request unless SessionError and HttpError:
    config = settings()
    json = responseJson(response=client.request(method="GET", url=config.issuer + "/.well-known/openid-configuration"))
    try:
        document = json.decode<Discovery>()
        if document.issuer != config.issuer or document.authorization_endpoint != config.issuer + "/authorize" or document.token_endpoint != config.issuer + "/token" or document.jwks_uri != config.issuer + "/jwks" or document.userinfo_endpoint != config.issuer + "/userinfo":
            throw SessionError()
        return document
    catch JsonError error:
        throw SessionError()

/** Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. */
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) returns IdClaims uses crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and crypto.equal unless SessionError:
    config = settings()
    if jwks.keys.length() != 1:
        throw SessionError()
    try:
        jwk = jwks.keys.get(index=0)
        if jwk.kid != "provider-1":
            throw SessionError()
        publicKey = importJwk(jwk)
        claims = verifyJwt(token, publicKey, kid="provider-1", tokenType="JWT").decode<IdClaims>()
        if claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() > 255:
            throw SessionError()
        if claims.exp <= now or claims.iat < now - 300 or claims.iat > now + 30 or claims.exp <= claims.iat or claims.exp > now + 330:
            throw SessionError()
        if (not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes())):
            throw SessionError()
        return claims
    catch JwtError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()
    catch IndexError error:
        throw SessionError()
    catch CryptoError error:
        throw SessionError()

test validateIdentity:
    when signed_identity_claims:
        implement Crypto with GnuTlsCrypto
        resolve Crypto to crypto
        key = crypto.generateRsa()
        publicKey = crypto.publicRsa(key)
        jwks = RsaJwks(keys=[rsaJwk(publicKey, kid="provider-1")])
        config = settings()
        now = 1700000000
        expectedNonce = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"

        it accepts_valid_identity:
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now+300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            identity = validateIdentity(token, nonce=expectedNonce, now, jwks)
            assert(condition=identity.sub == "ada")

        it rejects_signed_invalid_claims for (issuer, audience, subject, issued, expires, nonce) in [
            ("https://wrong-issuer.invalid", config.clientId, "ada", now, now+300, expectedNonce),
            (config.issuer, "wrong-audience", "ada", now, now+300, expectedNonce),
            (config.issuer, config.clientId, "", now, now+300, expectedNonce),
            (config.issuer, config.clientId, "ada", now-400, now+300, expectedNonce),
            (config.issuer, config.clientId, "ada", now+100, now+300, expectedNonce),
            (config.issuer, config.clientId, "ada", now, now, expectedNonce),
            (config.issuer, config.clientId, "ada", now, now+600, expectedNonce),
            (config.issuer, config.clientId, "ada", now, now+300, "wrong-nonce")
        ]:
            claims = IdClaims(iss=issuer, sub=subject, aud=audience, exp=expires, iat=issued, nonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid="provider-1", tokenType="JWT")
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)

        it rejects_token_context for (kid, tokenType) in [("wrong-key", "JWT"), ("provider-1", "august-session+jwt")]:
            claims = IdClaims(iss=config.issuer, sub="ada", aud=config.clientId, exp=now+300, iat=now, nonce=expectedNonce, name="Ada")
            token = signJwt(key, claims=Json(value=claims), kid, tokenType)
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)

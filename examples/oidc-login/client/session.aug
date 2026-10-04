// aug-spec: "session.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from crypto
import Clock from time
import ExpiringStore from memory

/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) :
    match token:
        when null:
            throw SessionError()
        when some value:
            try:
                publicKey = crypto.publicRsa(key=keys.session())
                claims = verifyJwt(token=value, publicKey, kid="session-1", tokenType="august-session+jwt").decode<SessionClaims>()
                config = settings()
                now = clock.now()
                if claims.iss != config.baseUrl + "/app" or claims.aud != "august-app" or claims.sub.length() == 0 or claims.exp <= now or claims.iat > now + 30 or claims.iat < now - config.sessionSeconds or claims.exp <= claims.iat or claims.exp > now + config.sessionSeconds + 30:
                    throw SessionError()
                if (not claims.jti.isToken(min=43, max=43)) or (not claims.csrf.isToken(min=43, max=43)):
                    throw SessionError()
                match sessions.get(key=claims.jti, now=now):
                    when null:
                        throw SessionError()
                    when some saved:
                        if saved.sub != claims.sub or saved.exp != claims.exp or (not crypto.equal(left=saved.csrf.bytes(), right=claims.csrf.bytes())):
                            throw SessionError()
                        return claims
            catch CryptoError error:
                throw SessionError()
            catch JwtError error:
                throw SessionError()
            catch JsonError error:
                throw SessionError()

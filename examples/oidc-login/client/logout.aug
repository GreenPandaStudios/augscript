import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory

/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get and sessions.take unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError:
    config = settings()
    if origin != config.baseUrl:
        throw SessionError()
    session = authenticate(token)
    if !crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes()):
        throw SessionError()
    sessions.take(key=session.jti, now=clock.now())
    headers = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value="", path="/", maxAge=0, secure=config.secureCookies)
    return HttpResponse(body=<p>Signed out.</p>, status=303, headers=headers)

// aug-spec: "endpoints.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import authenticate from session
import LoginPage and Welcome from views
import UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory

/** The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. */
endpoint GET "/" as home(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless KeyError and TimeError and HttpError:
    try:
        session = authenticate(token)
        return HttpResponse(body=Welcome(session), headers=securityHeaders())
    catch SessionError error:
        return HttpResponse(body=LoginPage(), headers=securityHeaders())

/** A protected JSON resource accepts only a live, verified application session. */
endpoint GET "/me" as me(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<UserInfo> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless SessionError with status 401 and KeyError and TimeError and HttpError:
    session = authenticate(token)
    return HttpResponse(body=UserInfo(sub=session.sub, name=session.name), headers=securityHeaders())

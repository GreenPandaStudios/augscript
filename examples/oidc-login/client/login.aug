// aug-spec: "login.aug.md" explains this file. Read it before changes; refresh with aug spec.
import LoginTransaction and SessionClaims and SessionError from contracts
import discover and responseJson and validateIdentity from protocol
import TokenResponse and UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto and RsaJwks and signJwt and JwtError from august.crypto
import Clock from august.time
import HttpClient and urlEncode from august.web
import ExpiringStore and StoreFull from august.memory

/** Start a browser-bound, short-lived transaction. The PKCE verifier stays on the server. */
endpoint GET "/login/start" as startLogin(resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve ExpiringStore<LoginTransaction> transactions) returns HttpResponse<Html> uses crypto.random and crypto.sha256 and clock.now and client.request and transactions.put unless SessionError with status 502 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    document = discover()
    browser = crypto.random(size=32).base64url()
    state = crypto.random(size=32).base64url()
    nonce = crypto.random(size=32).base64url()
    verifier = crypto.random(size=32).base64url()
    transaction = LoginTransaction(state, nonce, verifier, expires=clock.now() + 300)
    transactions.put(key=browser, value=transaction, expires=transaction.expires, now=clock.now())
    challenge = crypto.sha256(input=verifier.bytes()).base64url()
    location = document.authorization_endpoint + "?response_type=code&client_id=" + urlEncode(input=config.clientId) + "&redirect_uri=" + urlEncode(input=config.callback) + "&scope=openid%20profile&state=" + urlEncode(input=state) + "&nonce=" + urlEncode(input=nonce) + "&code_challenge=" + urlEncode(input=challenge) + "&code_challenge_method=S256"
    headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_login", value=browser, path="/login", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=<p>Opening the identity provider.</p>, status=303, headers=headers)

/** Exchange a one-use code over HTTP, verify the provider JWT/JWKS and UserInfo subject, then issue a distinct app-session JWT. */
endpoint GET "/login/callback" as loginCallback(string code from query, string state from query, optional string browser from cookie "aug_login", resolve Crypto crypto, resolve Clock clock, resolve HttpClient client, resolve SigningKeys keys, resolve ExpiringStore<LoginTransaction> transactions, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.signRsa and crypto.decodeBase64url and crypto.importRsa and crypto.verifyRsa and clock.now and client.request and keys.session and transactions.take and sessions.put unless SessionError with status 400 and CryptoError with status 503 and TimeError with status 503 and KeyError and StoreFull with status 503 and JwtError and JsonError and HttpError:
    if (not code.isToken(min=43, max=43)) or (not state.isToken(min=43, max=43)):
        throw SessionError()
    match browser:
        when null:
            throw SessionError()
        when some secret:
            match transactions.take(key=secret, now=clock.now()):
                when null:
                    throw SessionError()
                when some transaction:
                    if (not crypto.equal(left=transaction.state.bytes(), right=state.bytes())):
                        throw SessionError()
                    config = settings()
                    document = discover()
                    body = "grant_type=authorization_code&code=" + urlEncode(input=code) + "&redirect_uri=" + urlEncode(input=config.callback) + "&client_id=" + urlEncode(input=config.clientId) + "&code_verifier=" + urlEncode(input=transaction.verifier)
                    headers = Headers().with(name="content-type", value="application/x-www-form-urlencoded")
                    tokens = responseJson(response=client.request(method="POST", url=document.token_endpoint, headers, body=body.bytes())).decode<TokenResponse>()
                    if tokens.token_type != "Bearer" or (not tokens.access_token.isToken(min=43, max=43)) or tokens.expires_in <= 0:
                        throw SessionError()
                    jwks = responseJson(response=client.request(method="GET", url=document.jwks_uri)).decode<RsaJwks>()
                    identity = validateIdentity(token=tokens.id_token, nonce=transaction.nonce, now=clock.now(), jwks)
                    authHeaders = Headers().with(name="authorization", value="Bearer " + tokens.access_token)
                    user = responseJson(response=client.request(method="GET", url=document.userinfo_endpoint, headers=authHeaders)).decode<UserInfo>()
                    if user.sub != identity.sub:
                        throw SessionError()
                    now = clock.now()
                    session = SessionClaims(iss=config.baseUrl + "/app", sub=identity.sub, aud="august-app", exp=now + config.sessionSeconds, iat=now, jti=crypto.random(size=32).base64url(), csrf=crypto.random(size=32).base64url(), name=user.name)
                    jwt = signJwt(key=keys.session(), claims=Json(value=session), kid="session-1", tokenType="august-session+jwt")
                    sessions.put(key=session.jti, value=session, expires=session.exp, now=now)
                    responseHeaders = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value=jwt, path="/", maxAge=config.sessionSeconds, secure=config.secureCookies)
                    responseHeaders = withCookie(headers=responseHeaders, name="aug_login", value="", path="/login", maxAge=0, secure=config.secureCookies)
                    return HttpResponse(body=<p>Signed in.</p>, status=303, headers=responseHeaders)

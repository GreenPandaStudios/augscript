// aug-spec: "authorization.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationRequest and AuthorizationCode and LoginForm and LoginError from contracts
import ProviderLogin and ProviderFailure from views
import verifyCredentials from credentials
import settings and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore and StoreFull from august.memory
import urlEncode from august.web

/** Validate the registered client before offering a login form. A malformed redirect is never followed. */
endpoint GET "/provider/authorize" as authorize(string response_type from query, string client_id from query, string redirect_uri from query, string requestedScope from query "scope", string state from query, string nonce from query, string code_challenge from query, string code_challenge_method from query, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) returns HttpResponse<Html> uses crypto.random and crypto.decodeBase64url and clock.now and requests.put unless LoginError with status 400 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    if client_id != config.clientId or redirect_uri != config.callback or response_type != "code" or code_challenge_method != "S256":
        throw LoginError()
    if requestedScope != "openid" and requestedScope != "openid profile":
        throw LoginError()
    if (not state.isToken(min=43, max=128)) or (not nonce.isToken(min=43, max=128)) or code_challenge.length() != 43:
        throw LoginError()
    try:
        if crypto.decodeBase64url(input=code_challenge).length() != 32:
            throw LoginError()
    catch CryptoError error:
        throw LoginError()
    requestId = crypto.random(size=32).base64url()
    browser = crypto.random(size=32).base64url()
    csrf = crypto.random(size=32).base64url()
    now = clock.now()
    request = AuthorizationRequest(clientId=client_id, redirectUri=redirect_uri, state=state, nonce=nonce, challenge=code_challenge, browser=browser, csrf=csrf, expires=now + 300)
    requests.put(key=requestId, value=request, expires=request.expires, now=now)
    headers = withCookie(headers=securityHeaders(), name="aug_authorize", value=browser, path="/provider", maxAge=300, secure=config.secureCookies)
    return HttpResponse(body=ProviderLogin(requestId, csrf, message="Authorize the registered August login app.", submit=handle providerLogin(input from form)), headers=headers)

/** The browser binding and CSRF token are checked before credentials. Each form request is consumed once. */
endpoint POST "/provider/login" as providerLogin(LoginForm form from form, optional string browser from cookie "aug_authorize", optional string origin from header "origin", resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) returns HttpResponse<Html> uses crypto.equal and crypto.random and crypto.passwordHash and crypto.decodeBase64url and clock.now and requests.take and codes.put unless CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    try:
        if origin != config.baseUrl:
            return HttpResponse(body=ProviderFailure(message="The sign-in form must come from this app."), status=403, headers=securityHeaders())
        match requests.take(key=form.request_id, now=clock.now()):
            when null:
                return HttpResponse(body=ProviderFailure(message="The sign-in request expired or was already used."), status=400, headers=securityHeaders())
            when some request:
                match browser:
                    when null:
                        return HttpResponse(body=ProviderFailure(message="The browser binding is missing."), status=403, headers=securityHeaders())
                    when some secret:
                        if (not crypto.equal(left=secret.bytes(), right=request.browser.bytes())) or (not crypto.equal(left=form.csrf.bytes(), right=request.csrf.bytes())):
                            return HttpResponse(body=ProviderFailure(message="The sign-in form could not be verified."), status=403, headers=securityHeaders())
                if (not verifyCredentials(username=form.username, password=form.password)):
                    return HttpResponse(body=ProviderFailure(message="The username or password was not accepted."), status=401, headers=securityHeaders())
                now = clock.now()
                code = crypto.random(size=32).base64url()
                grant = AuthorizationCode(clientId=request.clientId, redirectUri=request.redirectUri, challenge=request.challenge, nonce=request.nonce, subject="demo-ada", name="Ada", expires=now + 60)
                codes.put(key=code, value=grant, expires=grant.expires, now=now)
                location = request.redirectUri + "?code=" + urlEncode(input=code) + "&state=" + urlEncode(input=request.state)
                headers = withCookie(headers=securityHeaders().with(name="location", value=location), name="aug_authorize", value="", path="/provider", maxAge=0, secure=config.secureCookies)
                return HttpResponse(body=<p>Returning to the application.</p>, status=303, headers=headers)
    catch HttpError error:
        return HttpResponse(body=ProviderFailure(message="The submitted form is invalid."), status=400, headers=securityHeaders())

import UserInfo and AccessGrant from contracts
import securityHeaders from common
import Clock from august.time
import ExpiringStore from august.memory

/** The opaque access token is valid only at this provider. Missing, expired and malformed credentials receive the same response. */
endpoint GET "/provider/userinfo" as userinfo(optional string authorization from header, resolve Clock clock, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> uses clock.now and access.get unless TimeError and HttpError:
    match authorization:
        when missing:
            pass
        when some header:
            parts = header.split(separator=" ")
            if parts.length() == 2:
                try:
                    if parts.get(index=0) == "Bearer":
                        token = parts.get(index=1)
                        if token.isToken(min=43, max=43):
                            match access.get(key=token, now=clock.now()):
                                when null:
                                    pass
                                when some grant:
                                    return HttpResponse(body=Json(value=UserInfo(sub=grant.subject, name=grant.name)), headers=securityHeaders())
                catch IndexError error:
                    pass
    headers = securityHeaders().with(name="www-authenticate", value="Bearer error=\"invalid_token\"")
    return HttpResponse(body=Json(value={"error": "invalid_token"}), status=401, headers=headers)

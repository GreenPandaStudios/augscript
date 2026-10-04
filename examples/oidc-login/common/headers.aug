// aug-spec: "headers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Responses containing identity data are never cached or embedded by another site. */
securityHeaders() :
    return Headers().with(name="cache-control", value="no-store").with(name="pragma", value="no-cache").with(name="x-content-type-options", value="nosniff").with(name="referrer-policy", value="no-referrer").with(name="content-security-policy", value="default-src 'self'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")

/** Add a checked cookie without losing duplicate Set-Cookie response fields. */
withCookie(Headers headers, string name, string value, string path, int maxAge, bool secure) :
    result = headers
    for content in cookie(name, value, path, maxAge, secure).all(name="set-cookie"):
        result = result.with(name="set-cookie", value=content)
    return result
import cookie from web

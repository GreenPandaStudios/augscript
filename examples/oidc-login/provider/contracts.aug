// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** A provider request is bound to a browser cookie, a form CSRF token, and a registered client. */
record AuthorizationRequest(string clientId, string redirectUri, string state, string nonce, string challenge, string browser, string csrf, int expires)
/** Codes are short-lived, single-use and bound to a redirect URI and S256 challenge. */
record AuthorizationCode(string clientId, string redirectUri, string challenge, string nonce, string subject, string name, int expires)
record IdClaims(string iss, string sub, string aud, int exp, int iat, string nonce, string name)
record AccessGrant(string subject, string name, int expires)
record TokenResponse(string token_type, string access_token, string id_token, int expires_in, string scope)
record OAuthError(string error, string error_description)
record TokenForm(string grant_type, string code, string redirect_uri, string client_id, string code_verifier)
record LoginForm(string request_id, string csrf, string username, string password)
record UserInfo(string sub, string name)
LoginError() implements Error:
    pass
CodeError() implements Error:
    pass

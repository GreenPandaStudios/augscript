/** Browser-bound client state, nonce and PKCE verifier, consumed by the callback. */
record LoginTransaction(string state, string nonce, string verifier, int expires)
/** Sessions require their own issuer, audience, key and JWT type, plus a live registry entry. */
record SessionClaims(string iss, string sub, string aud, int exp, int iat, string jti, string csrf, string name)
record LogoutForm(string csrf)
SessionError() implements Error:
    pass

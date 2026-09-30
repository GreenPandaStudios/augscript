// aug-spec: "discovery.aug.md" explains this file. Read it before changes; refresh with aug spec.
import settings and SigningKeys and KeyError from common
import Crypto and RsaJwks and rsaJwk from august.crypto

/** Discovery advertises exactly this provider's supported authorization-code profile. */
record Discovery(string issuer, string authorization_endpoint, string token_endpoint, string userinfo_endpoint, string jwks_uri, List<string> response_types_supported, List<string> grant_types_supported, List<string> subject_types_supported, List<string> id_token_signing_alg_values_supported, List<string> token_endpoint_auth_methods_supported, List<string> scopes_supported, List<string> claims_supported, List<string> code_challenge_methods_supported)
endpoint GET "/provider/.well-known/openid-configuration" as discovery() :
    config = settings()
    return Discovery(issuer=config.issuer, authorization_endpoint=config.issuer + "/authorize", token_endpoint=config.issuer + "/token", userinfo_endpoint=config.issuer + "/userinfo", jwks_uri=config.issuer + "/jwks", response_types_supported=["code"], grant_types_supported=["authorization_code"], subject_types_supported=["public"], id_token_signing_alg_values_supported=["RS256"], token_endpoint_auth_methods_supported=["none"], scopes_supported=["openid", "profile"], claims_supported=["iss", "sub", "aud", "exp", "iat", "nonce", "name"], code_challenge_methods_supported=["S256"])

/** Only the provider's public signing key is published. Session keys never enter this JWKS. */
endpoint GET "/provider/jwks" as jwks(resolve Crypto crypto, resolve SigningKeys keys) :
    publicKey = crypto.publicRsa(key=keys.provider())
    return RsaJwks(keys=[rsaJwk(publicKey=publicKey, kid="provider-1")])

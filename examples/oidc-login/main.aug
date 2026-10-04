// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto and GnuTlsCrypto from crypto
import Clock and SystemClock from time
import HttpClient and WebHttpClient from web
import ExpiringStore and MemoryStore from memory
import LoginTransaction and SessionClaims and home and me and logout and startLogin and loginCallback from client
import AuthorizationRequest and AuthorizationCode and AccessGrant and discovery and jwks and authorize and providerLogin and token and userinfo from provider
import SigningKeys and MemorySigningKeys and initializeKeys and KeyError from common

implement Crypto with GnuTlsCrypto
implement Clock with SystemClock
implement HttpClient with WebHttpClient
implement SigningKeys with MemorySigningKeys shared mutable
implement ExpiringStore<LoginTransaction> with MemoryStore<LoginTransaction> shared mutable
implement ExpiringStore<AuthorizationRequest> with MemoryStore<AuthorizationRequest> shared mutable
implement ExpiringStore<AuthorizationCode> with MemoryStore<AuthorizationCode> shared mutable
implement ExpiringStore<SessionClaims> with MemoryStore<SessionClaims> shared mutable
implement ExpiringStore<AccessGrant> with MemoryStore<AccessGrant> shared mutable

try:
    initializeKeys()
catch CryptoError error:
    print(value="Cryptographic initialization failed")
    exit(status=1)
catch KeyError error:
    print(value="Signing keys could not be initialized")
    exit(status=1)

serve home and me and logout and startLogin and loginCallback and discovery and jwks and authorize and providerLogin and token and userinfo on port 8787

// aug-spec: "keys.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from crypto

KeyError() implements Error:
    pass
/** Keys are initialized explicitly in main and expose distinct provider and session roles. */
capability SigningKeys:
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError

MemorySigningKeys() implements SigningKeys:
    Shared<Map<string, RsaPrivateKey>> _keys = Shared(value=Map<string, RsaPrivateKey>())
    configure(RsaPrivateKey provider, RsaPrivateKey session) :
        lock _keys as keys:
            if keys.length() != 0:
                throw KeyError()
            keys.set(key="provider", value=provider)
            keys.set(key="session", value=session)
    provider() :
        lock _keys as keys:
            match keys.get(key="provider"):
                when null:
                    throw KeyError()
                when some key:
                    return key
    session() :
        lock _keys as keys:
            match keys.get(key="session"):
                when null:
                    throw KeyError()
                when some key:
                    return key

initializeKeys(resolve Crypto crypto, resolve SigningKeys keys) :
    provider = crypto.generateRsa()
    session = crypto.generateRsa()
    keys.configure(provider, session)

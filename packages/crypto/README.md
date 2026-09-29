# august.crypto

`@greenpandastudios/aug-crypto` contains the Crypto capability, GnuTLS adapter, RSA JWK import/export, and signed JWT helpers. Verification requires an explicit algorithm, key id and token type; the consuming protocol validates claims.

The CLI installs the exact matching version. Run `aug-native` explicitly before native crypto builds. Current native support is macOS. Generated API, guide and gap ledger are included in `docs`.

See [the same-app OIDC example](https://github.com/GreenPandaStudios/augscript/tree/main/examples/oidc-login) and [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md).

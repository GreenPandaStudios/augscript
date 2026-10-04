# August crypto library

This package contains the source exported by `august/crypto/export.aug`. Import it as a regular August source package, or add the canonical repository folder:

```sh
aug add \
  https://github.com/GreenPandaStudios/augscript/src/stdlib/crypto \
  --as crypto
```

Then import public names from `crypto`. [The API reference](https://greenpandastudios.github.io/augscript/api/crypto) describes the operations. `aug run` prepares their required native libraries. The [web guide](https://greenpandastudios.github.io/augscript/web) and [gap ledger](https://greenpandastudios.github.io/augscript/web-library-gaps) describe current behavior and deployment limits.

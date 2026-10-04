# August web library

This package contains the source exported by `august/web/export.aug`. Import it as a regular August source package, or add the canonical repository folder:

```sh
aug add \
  https://github.com/GreenPandaStudios/augscript/src/stdlib/web \
  --as web
```

Then import public names from `web`. [The API reference](https://greenpandastudios.github.io/augscript/api/web) describes the operations. `aug run` prepares their required native libraries. The [web guide](https://greenpandastudios.github.io/augscript/web) and [gap ledger](https://greenpandastudios.github.io/augscript/web-library-gaps) describe current behavior and deployment limits.

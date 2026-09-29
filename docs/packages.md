# Packages and installation

The [augscript monorepo](https://github.com/GreenPandaStudios/augscript) versions the compiler, libraries, documentation, and editor together. Release packages contain the files needed to use them; they do not run install scripts or silently build native libraries.

| Distribution | Package | Provides |
| --- | --- | --- |
| CLI | `@greenpandastudios/aug-cli` | `aug`, `aug-native`, compiler, language server, C runtime, guides and examples |
| Standard library | `@greenpandastudios/aug-stdlib` | `august.io`, `august.json`, `august.time`, `august.memory` |
| Web library | `@greenpandastudios/aug-web` | `august.web`, HTTP capabilities and helpers |
| Crypto library | `@greenpandastudios/aug-crypto` | `august.crypto`, cryptographic capability, RSA JWK and signed JWT helpers |
| VS Code | `augscript.augscript` / `.vsix` | Syntax, file icons, hover, completion, fixes, navigation, tests and bundled compiler |

## From a checkout

Requires Node.js 24+, npm, and a C11 compiler. Web/crypto native dependency builds currently support **macOS**; the full suite is verified on Apple silicon. Broader platform support is tracked in the gap ledger.

```sh
git clone git@github.com:GreenPandaStudios/augscript.git
cd augscript
npm ci
node scripts/bootstrap-native.mjs --extract-only --only minicoro,yyjson
node bin/aug.mjs run examples/approved-design
node scripts/bootstrap-native.mjs
node bin/aug.mjs run examples/oidc-login
```

## Install release tarballs

Until registry publication is configured, download all four `.tgz` files from the same [GitHub release](https://github.com/GreenPandaStudios/augscript/releases). Install them together, replacing VERSION with the release version:

```sh
npm install --global ./greenpandastudios-aug-stdlib-VERSION.tgz ./greenpandastudios-aug-web-VERSION.tgz ./greenpandastudios-aug-crypto-VERSION.tgz ./greenpandastudios-aug-cli-VERSION.tgz
aug --version
aug --help
aug-native
aug check path/to/project
aug run path/to/project
```

The CLI depends on exact matching library versions. Import spellings stay `import Crypto from august.crypto`; npm package names never enter August source. The packaged CLI loads the separate installed libraries, and editor navigation opens their real `.aug` files.

Native dependencies use `~/.cache/augscript/native/VERSION/PLATFORM-ARCH` for an installed CLI. Source checkouts use `.aug-native`. `AUG_NATIVE_HOME` selects a shared cache for CLI and VS Code; building dependencies is an explicit command.

For core programs and JSON without web/crypto, `aug-native --extract-only --only minicoro,yyjson` downloads just the portable C sources. Compiler checkpoints use minicoro even in ordinary programs; this source dependency must be present before native execution. Full web/crypto bootstrap remains macOS only.

## npm registry

Once the owner has claimed the npm scope and configured publication:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug-native
```

The CLI brings its three matching libraries. Early releases use the `next` dist tag. Registry and Marketplace publication require their own owner accounts; a GitHub account does not grant those identities. See [releasing](releasing.md) for configuration.

## VS Code

Download the matching `.vsix` from a release and use **Extensions → Install from VSIX**, or:

```sh
code --install-extension augscript-VERSION.vsix
```

The extension bundles the same compiler sources, standard declarations, native bootstrap, guides, and examples. Set `augscript.nativeHome` to an existing dependency build directory. Node.js 24+ remains required.

## Package model

`packages/*/package.json` and `aug-package.json` are release manifests. Canonical code lives in `src`, `runtime`, and `src/stdlib`; generated staging directories live under ignored `dist`. `npm run package:packages` builds JavaScript and real npm tarballs. `npm run test:packages` installs those tarballs outside the checkout and checks imports, navigation, native execution, and compatibility.

This release resolves the built-in August packages. A general third-party August package resolver, project dependency lockfile, and native adapter ABI versioning remain future work. Changing builtin libraries independently of the compiler is unsupported.

With the full native bootstrap ready, `npm run test:packages -- --native` additionally builds the OIDC example and runs its signed-identity tests using the installed CLI and separate packages.

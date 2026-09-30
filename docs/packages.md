# Packages and installation

Install the CLI and its matching libraries to create, check, test, and build projects. Install the matching VS Code extension for completion, navigation, and editor diagnostics. August versions these tools together while it is experimental.

Start a project with [the npm CLI](#npm-registry). To share your own August library, follow [Author a package](#author-a-package), then [Use a package](#use-a-package).

| Distribution | Package | Provides |
| --- | --- | --- |
| CLI | `@greenpandastudios/aug-cli` | `aug`, `aug-cli`, `aug-native`, compiler, language server, C runtime, guides and examples |
| Standard library | `@greenpandastudios/aug-stdlib` | `august.io`, `august.json`, `august.time`, `august.memory` |
| Web library | `@greenpandastudios/aug-web` | `august.web`, HTTP capabilities and helpers |
| Crypto library | `@greenpandastudios/aug-crypto` | `august.crypto`, cryptographic capability, RSA JWK and signed JWT helpers |
| VS Code | `augscript.augscript` / `.vsix` | Syntax, file icons, hover, completion, fixes, navigation, tests and bundled compiler |

## npm registry

Create a starter with one command:

```sh
npx @greenpandastudios/aug-cli@next init hello-august
```

The [npm CLI package](https://www.npmjs.com/package/@greenpandastudios/aug-cli) and all three matching libraries were verified at version 0.19.0 on September 30, 2026; both `next` and `latest` pointed to that version. The installed published package passed starter checking, its native test, execution, and spec drift checking. `next` can advance: pin an exact release when you need a repeatable toolchain, and install matching versions together.

`aug init DIRECTORY` creates `main.aug`, an interface and implementation, a same-file test, README, and `.gitignore`. It refuses a nonempty directory. Work through [Your first project](getting-started.md) for the full lesson. Publication setup belongs to [the contributor release process](releasing.md).

Commands written as `aug` in the reference use the same compiler. Invoke them with `npx @greenpandastudios/aug-cli@next`, for example:

```sh
cd hello-august
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next test .
npx @greenpandastudios/aug-cli@next spec .
```

Native execution needs a C11 compiler and pinned C dependencies. Prepare the portable task/JSON sources once for ordinary programs:

```sh
npx --package=@greenpandastudios/aug-cli@next aug-native --extract-only --only minicoro,yyjson
npx @greenpandastudios/aug-cli@next run .
```

For web/crypto programs, run `npx --package=@greenpandastudios/aug-cli@next aug-native` to build the full dependency set. macOS and Linux are tested; other platforms remain outside the support matrix. [Docker](docker.md) provides a Linux toolchain option. `init` creates source files; it does not prepare these native dependencies.

If you prefer a persistent `aug` command, `npm install --global @greenpandastudios/aug-cli@next` installs it. This is optional. Use an exact version in place of `next` when pinning a toolchain.

## VS Code

Install **AugScript** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=augscript.augscript), or run:

```sh
code --install-extension augscript.augscript
```

For a pinned release, download its matching `.vsix` and use **Extensions → Install from VSIX**, or:

```sh
code --install-extension augscript-VERSION.vsix
```

The extension bundles the same compiler sources, standard declarations, native bootstrap, guides, and examples. Set `augscript.nativeHome` to an existing dependency build directory. Node.js 24+ remains required.

## Install release tarballs

For archive installation, download all four `.tgz` files from the same [GitHub release](https://github.com/GreenPandaStudios/augscript/releases). Install them together, replacing VERSION with the release version:

```sh
npm install --global ./greenpandastudios-aug-stdlib-VERSION.tgz ./greenpandastudios-aug-web-VERSION.tgz ./greenpandastudios-aug-crypto-VERSION.tgz ./greenpandastudios-aug-cli-VERSION.tgz
aug --version
aug --help
aug-native
aug check path/to/project
aug run path/to/project
```

The CLI depends on exact matching library versions. Import spellings stay `import Crypto from august.crypto`; npm package names never enter August source. The packaged CLI loads the separate installed libraries, and editor navigation opens their real `.aug` files.

Native dependencies use `~/.cache/augscript/native/VERSION/PLATFORM-ARCH`. `AUG_NATIVE_HOME` selects a shared cache for CLI and VS Code; building dependencies is an explicit command.

For core programs and JSON without web/crypto, `aug-native --extract-only --only minicoro,yyjson` downloads just the portable C sources. Compiler checkpoints use minicoro even in ordinary programs; this source dependency must be present before native execution. Full web/crypto bootstrap is available on macOS and Linux.

## Package model

User packages ship August source, retain their own public boundaries, and compile into the application's native executable. They use npm for archive/registry transport and August for visibility, compatibility, dependency scopes and checking. Changing builtin libraries independently of the compiler is unsupported; general native adapter ABI/version distribution remains future work.

The release gate installs real package archives in isolated projects and tests imports, navigation, native execution, and compatibility. See [the release process](releasing.md) for package-building and contributor commands.

## Author a package

Create a standalone library; it needs no `main.aug`:

```sh
aug package init my-math --name @your-npm-name/aug-math
aug check my-math
aug test my-math
aug package pack my-math
```

The scaffold includes `src/arithmetic.aug` with a same-file test, `src/export.aug`, `aug-package.json`, and npm's `package.json`. Public API, Javadoc and tests stay beside the implementation:

```text
// src/arithmetic.aug
/** Add two integers. @param left First integer. @param right Second integer. */
add(int left, int right) returns int:
    return left + right

test add:
    when addition:
        it adds:
            assert(add(left=2, right=3) == 5)

// src/export.aug
export add from arithmetic
```

`aug-package.json` owns August metadata and dependency aliases:

```json
{
  "format": 1,
  "name": "@your-npm-name/aug-math",
  "version": "0.1.0",
  "compiler": "0.19.0",
  "source": "src",
  "dependencies": {}
}
```

`package.json` supplies npm transport metadata, description, license, README and the files to include. `aug install` and `aug package pack` synchronize its name, version and dependencies from the August manifest. Keep the source folder and `aug-package.json` in its `files` list. Pack checks every declaration and test closure before creating `.aug-build/packages/your-npm-name-aug-math-0.1.0.tgz`. It checks test code; execute the cases with `aug test` before release.

After authenticating with an npm account that owns the namespace, publish that verified archive:

```sh
npm publish my-math/.aug-build/packages/your-npm-name-aug-math-0.1.0.tgz --access public
```

This is an explicit author action; `aug install` never publishes or executes dependency lifecycle scripts. August does not require a new registry account in addition to npm. See [npm's package publishing guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).

## Use a package

In the consuming application's `main.yaml`, choose a readable import alias:

```yaml
packages:
  math: "npm:@your-npm-name/aug-math@0.1.0"
```

Install explicitly, then import the public name:

```sh
aug install my-app
aug run my-app
```

```text
// my-app/main.aug
import add from math
print(value=add(left=20, right=22))
```

Local development uses the same source syntax. Replace the specification with `"../my-math"`, `"file:../my-math"`, or a path to the `.tgz`. `aug install` snapshots a local directory, so reinstall after editing its source. Check and build never fetch dependencies or silently refresh a local package. There are no symlinked live dependencies.

Only the source root's `export.aug` is visible to another package. To expose a submodule, write `export folder parsing` there and provide `src/parsing/export.aug`; consumers can then use `import Parser from math.parsing`. Private `_names`, files and folders remain inaccessible. `import everything` follows the same public surface. An alias cannot shadow a local file/folder or use the reserved `august` name.

Module dependency policies use the alias path (`math` or `math/parsing`) for external edges. Consumer architecture/style lints apply to its own source; they do not impose its conventions on library internals.

Ctrl-click an imported declaration, `from`, or a path segment to open the installed source or its export file. Hover preserves its Javadoc. VS Code recognizes a standalone library from `aug-package.json` and refreshes when the manifest or lock changes.

## Dependencies between libraries

Declare dependencies in the library's August manifest instead of `main.yaml`:

```json
"dependencies": {
  "math": "npm:@your-npm-name/aug-math@0.1.0"
}
```

Run `aug install` inside that library and use `import add from math`. Each package sees its own declared aliases. A consuming app cannot import a transitive alias unless it also declares that dependency. Multiple package versions have distinct type identities; duplicate copies of the same version share declarations only when their source and dependencies agree. Changed code with the same package name/version is rejected when conflicting copies would coexist.

Registry dependencies require exact versions. Ranges, latest tags, Git dependencies and arbitrary URLs are unsupported. Local paths are useful within a development workspace; publish registry references for libraries other developers will install.

## Reproducible builds

Commit `aug.lock.json` with your project. It records specifications, the installed graph, exact names/versions, npm integrity metadata, the compiler version, and hashes of source/manifests. `.aug-packages` is an ignored installed snapshot.

```sh
aug install my-app --frozen
aug check my-app
aug test my-app
aug build my-app
```

`--frozen` requires a matching lock and unchanged source graph. `--offline` additionally prohibits fetching uncached dependencies; a fresh machine may need one online install before it can work offline. Editing the installed source produces a diagnostic requiring a reinstall. The compiler version must match exactly while the language is experimental.

Libraries support `check`, same-file `test`, formatting, explain, editor help, and packing. `run`, `build`, `bench` and server OpenAPI generation belong to an application with `main.aug`. Consumer tests run the consumer's suites; dependency tests are checked and executed by the package author. Arbitrary C source, native build hooks, precompiled August binaries, compiler plugins and stable native ABIs are outside this package format.

`aug spec` also works on source libraries. `aug pack DIRECTORY` is an alias for `aug package pack DIRECTORY`. Packing refreshes and includes adjacent `.aug.md` files and `.aug-spec/` so the package carries complete source explanations and precise-version offline dependency links. See [compiled specifications](specifications.md).

The downloadable [package example](examples/packages-app/index.md) exercises the author and consumer workflow locally. The installer uses [npm aliases](https://docs.npmjs.com/cli/v11/using-npm/package-spec/) and [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/) with lifecycle scripts disabled and local packages installed as copied archives.

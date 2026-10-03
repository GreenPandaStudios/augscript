# Packages and installation

August libraries are source folders with an `export.aug` file. An application imports their public declarations, and the compiler checks those declarations with the application. A library can live in a public Git repository, a local folder, or an npm archive.

## npm registry

Install the CLI once:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init hello-august
cd hello-august
aug run
```

August 0.23.0 needs Node.js 24 or later and npm on macOS 14+ ARM64 or GNU/Linux x64/ARM64 with glibc 2.36+. August downloads a verified LLVM/runtime pack; native package consumers do not install a compiler or SDK. GitHub repository imports use the CLI's HTTPS transport without Git. Other Git servers require a local Git client. [Docker](docker.md) and [Dev Containers](dev-containers.md) provide a Linux workspace.

`aug run` finds `main.aug`, installs source dependencies declared by imports or `main.yaml`, checks the code, prepares the native libraries it needs, and compiles and starts the executable. Later runs reuse those dependencies. `aug check` and `aug spec` read the installed snapshot without fetching packages. Use `aug install` before those commands in a fresh project.

To use npx instead of a global installation:

```sh
npx @greenpandastudios/aug-cli@next init another-app
cd another-app
npx @greenpandastudios/aug-cli@next run
```

The starters include `AGENTS.md` with instructions for coding agents: read the neighboring specs, keep tests beside the code, and check changes. For a service, [start the weather API](weather-api.md) with `init weather --template weather`.

Pin an exact CLI release for repeatable builds. [GitHub releases](https://github.com/GreenPandaStudios/augscript/releases) list compiler and extension versions.

## Use a package

Give a public repository a short name:

```sh
aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/json --as json
```

This installs the source and adds a `json` alias to `main.yaml`. Import through that alias:

```text
import parse from json
```

Or import the repository URL directly:

```text
import parse from "https://github.com/GreenPandaStudios/augscript/src/stdlib/json"
```

Run the application to install it. GitHub URLs can select a folder inside a repository. Append `#v1.2.3` to choose a release tag, or `#COMMIT` to choose a commit. Without a revision, the first installation selects the repository's current default branch. `aug.lock.json` records the exact commit either way.

Imported names must appear in that folder's `export.aug`. An exported child folder has its own export file. A dependency's private names and unexported files remain inaccessible.

## Official libraries

The compiler supplies `august.io` for console, file, and argument capabilities. JSON, time, in-memory stores, web helpers, and cryptography are optional source packages. Add only what your application uses:

| Alias | Repository folder | API |
| --- | --- | --- |
| `json` | `src/stdlib/json` | [Parse JSON](api/json.md) |
| `time` | `src/stdlib/time` | [Read a clock](api/time.md) |
| `memory` | `src/stdlib/memory` | [Bounded expiring stores](api/memory.md) |
| `web` | `src/stdlib/web` | [HTTP client and server helpers](api/web.md) |
| `crypto` | `src/stdlib/crypto` | [Crypto and signed tokens](api/crypto.md) |

Each folder is under `https://github.com/GreenPandaStudios/augscript/`. For example, use `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/web --as web`. Endpoints, records, headers, and server-rendered HTML are language features; a simple weather service needs none of these optional packages.

## Author a package

Create a library:

```sh
aug package init arithmetic
cd arithmetic
aug check
aug test
aug spec
```

The starter exports `add` from `src/arithmetic.aug`, keeps its test in that file, and includes agent instructions. Edit `src/export.aug` to choose which declarations others can import. A library needs no `main.aug` and does not start an application when imported.

For a library you write by hand, `export.aug` in the root or a `src` folder is enough. `aug-package.json` is optional; use it when you want to name a package, state its version and compiler, choose another source folder, or declare dependency aliases. npm metadata is only needed for npm distribution.

Commit the source, export file, tests, comments, and dependency lock to your Git repository. Include a license, run `aug check` and `aug test`, then publish a release tag. Other projects can import your repository URL with `#v0.1.0`.

## Dependencies between libraries

A library can import another repository URL directly. The installer follows those imports and installs the complete graph. Each library has its own aliases and export boundaries; its dependencies do not become imports in the application automatically.

For local development, use an alias mapped to a folder:

```yaml
packages:
  arithmetic: ../arithmetic
```

Then run `aug install`. Local dependencies inside a library resolve relative to that library's original folder. To share the library remotely, replace development paths with public repository URLs or exact registry versions.

## Reproducible builds

Commit `aug.lock.json`. It records repository commits, registry archive integrity, source hashes, and the dependency graph. Installed sources live in `.aug-packages`; do not edit or commit that directory.

```sh
aug install --frozen
aug check
aug test
aug build
```

A frozen install restores the recorded revisions and rejects changed source contents. `aug install --update` deliberately selects current revisions again. A normal install preserves a matching lock. `aug run --offline` and `aug install --frozen --offline` use previously cached sources and native dependencies; an uncached input produces an error explaining how to prepare it online.

Installation reads Git source blobs without running hooks and extracts registry archives without running lifecycle scripts. Application code can still call native adapters and unsafe operations; review those before running a dependency.

## npm archives and releases

For npm distribution, use `aug package init arithmetic --name @owner/arithmetic`, then `aug package pack`. Packing checks the library and its test bodies, generates specs, synchronizes npm metadata, and prints the archive path. Run `aug test` yourself before publishing the archive with npm.

Consumers can use `aug add npm:@owner/arithmetic@0.1.0 --as arithmetic` or a local `.tgz` path. Registry versions must be exact. Git, registry, and local dependencies can appear in the same graph.

## VS Code

Install the matching 0.23.0 `.vsix` from [GitHub Releases](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.23.0) using **Extensions: Install from VSIX…** in VS Code. The [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=augscript.augscript) can lag the compiler release; check its version before using it. The extension bundles a compiler and uses the project's installed source graph for completion, help, and navigation. [The editor guide](editor.md) covers completion, fixes, and inferred type hints.

## Install release tarballs

The CLI tarball requires its matching core stdlib package. npm normally obtains it automatically. For an archive installation, install the matching CLI and stdlib tarballs together; optional web and crypto packages are regular source libraries.

Verified LLVM packs and native artifacts use `~/.cache/augscript/native-artifacts`, keyed by their archive hashes. `AUG_NATIVE_ARTIFACT_CACHE` selects another cache. Source, compiler, runtime, and platform selections remain in `aug.lock.json`. The C migration reference uses the older `AUG_NATIVE_HOME` source-build cache. The [native package guide](native-packages.md) covers ownership, platform requirements, and publishing; [release process](releasing.md) covers the compiler distribution.

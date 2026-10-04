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

The compiler supplies `august.io` for console, file, and argument capabilities. **Unreleased:** it also supplies [bounded integer ranges](reference.md#bounded-integer-ranges) through `august.collections` and [checked mathematics](reference.md#checked-mathematics-unreleased) through `august.math`. JSON, time, in-memory stores, web helpers, and cryptography are optional source packages. Add only what your application uses:

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

Commit the source, export file, tests, comments, and dependency lock to your Git repository. Include a license, run `aug check` and `aug test`, then publish a release tag. Other projects can import your repository URL with `#v0.1.0`. The unreleased [publishing guide](package-publishing.md) adds checked release metadata and consumer CI generation.

## Compiler compatibility

A manifest names the compiler that can check the library. Published 0.23.0 requires an exact version. **Unreleased:** the next compiler also accepts bounded requirements such as `~0.23.0` and `^1.0.0`; `aug package init` still starts with an exact version. Authors must test the releases they claim to support. See [package compatibility](package-compatibility.md) for the requirement grammar, lock format and upgrade procedure.

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

A frozen install restores the recorded revisions and rejects changed source contents. `aug install --update` deliberately selects current revisions again. A normal install preserves a matching lock. The unreleased compiler also preserves existing repository commits when the compiler changes or a dependency is added; `--update` is the explicit revision update. `aug run --offline` and `aug install --frozen --offline` use previously cached sources and native dependencies; an uncached input produces an error explaining how to prepare it online.

Installation reads Git source blobs without running hooks and extracts registry archives without running lifecycle scripts. Application code can still call native adapters and unsafe operations; review those before running a dependency.

## Preview a dependency update (unreleased)

Run `aug update --preview` before accepting new dependency revisions. It resolves the requested repositories into a temporary source graph, compares their public contracts and explanations, and checks your current application and same-file test bodies against the proposed dependencies. The accepted lock and installed source snapshots stay in place. Normal source transport caches may change; no native artifacts are downloaded and no dependency code or tests run.

```sh
aug update --preview
aug update --preview --json
```

The review shows old and proposed commits, labeled input changes, checked errors, ownership, effects and native requirements. A required argument appears as a caller diagnostic; the preview supplies no business value. Each package is checked independently, so its interface changes remain visible when the application needs repairs. The application’s “before” result uses your current source with the accepted dependencies, rather than retrieving historical application code. The “after” result uses that same source with the proposed dependencies.

Native selections include the current host, artifact hashes, runtime requirements and cache integrity. Download figures are declared upper bounds for missing archives, counted once per hash, rather than measured archive sizes. An unsupported proposed target or damaged cached artifact rejects readiness. A missing archive is reported without fetching it. Compiler acceptance, artifact selection and behavioral results remain separate; a successful preview does not prove that the program runs correctly.

You can change a dependency tag or alias declaration before previewing it. Source, configuration, accepted-lock and installed-source checks reject a preview if those inputs change during analysis. `--offline` can inspect changed local folders; choosing a fresh repository revision requires online resolution. An unresolved `aug add` transaction must be recovered with `aug install` first.

Run independent tests before accepting an update. `aug install --update` resolves the requests again; it does not apply a saved preview transaction. For a moving branch, pin the reviewed commit in the package declaration or repeat the review after installation. [Package compatibility](package-compatibility.md) explains exact commit locks and compiler requirements.

## npm archives and releases

For npm distribution, use `aug package init arithmetic --name @owner/arithmetic`, then `aug package pack`. Packing checks the library and its test bodies, generates specs, synchronizes npm metadata, and prints the archive path. Run `aug test` yourself before publishing the archive with npm.

Consumers can use `aug add npm:@owner/arithmetic@0.1.0 --as arithmetic` or a local `.tgz` path. Registry versions must be exact. Git, registry, and local dependencies can appear in the same graph.

## VS Code

Install AugScript from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=augscript.augscript), or install a published `.vsix` from [GitHub Releases](https://github.com/GreenPandaStudios/augscript/releases) using **Extensions: Install from VSIX…** in VS Code. Editor-only patches can have a different version from the CLI; their release notes identify the bundled compiler. The extension bundles that compiler and uses the project's installed source graph for completion, help, and navigation. [The editor guide](editor.md) covers completion, fixes, and inferred type hints.

## Install release tarballs

The CLI tarball requires its matching core stdlib package. npm normally obtains it automatically. For an archive installation, install the matching CLI and stdlib tarballs together; optional web and crypto packages are regular source libraries.

Verified LLVM packs and native artifacts use `~/.cache/augscript/native-artifacts`, keyed by their archive hashes. `AUG_NATIVE_ARTIFACT_CACHE` selects another cache. Source, compiler, runtime, and platform selections remain in `aug.lock.json`. The unreleased `aug doctor --json` reports source checks, selected native artifacts, verified cached bytes and separate offline/frozen readiness without preparing anything. The C migration reference uses the older `AUG_NATIVE_HOME` source-build cache. The [native package guide](native-packages.md) covers ownership, platform requirements, and publishing; [release process](releasing.md) covers the compiler distribution.

The unreleased `aug cache --json` adds separate cache sizes and accepted source/native identities to the offline readiness report. `aug cache prune` previews reclaimable test compilation; `--write` clears verified idle entries. Source snapshots, repository transport and shared native artifacts are retained. See [cache management](tooling.md#inspect-and-clear-caches) for location settings and pruning limits.

## Automatic aliases (unreleased)

`aug add URL` derives a short import alias from a repository or package name. For example, an `aug-sqlite` repository becomes `sqlite`; `--as database` selects a different spelling. A local package uses its manifest name. The lock still records the complete repository identity and exact revision. If the derived name is already assigned to another package, August stops and asks for `--as NAME` before changing configuration. It never replaces a different dependency merely because their names match.


## Inspect a dependency or prepare a library (unreleased)

`aug dependencies PROJECT` explains the installed graph. It shows each alias, package identity, source digest, locked Git commit, importing file and public names. Transitive aliases remain in their owner's scope. Native selections include the target, artifact identity and checksum. `--json` gives the complete structured report. This command verifies installed source bytes without fetching, updating a lock, or running package code; locked native metadata does not claim that an artifact is already cached.

Before publishing a source library, run `aug package check DIRECTORY`. It checks production declarations and same-file tests, narrow exports, Javadoc, compiler requirements and a license file. For a native library it also validates descriptor metadata, declared targets and third-party notices. Add `--json` for CI. A passing report is static readiness: run `aug test` for behavioral evidence and qualify native artifacts and cleanup on each target before publishing. August does not choose your package's license.

Use `aug package diff BEFORE AFTER` to compare two local package revisions that already have their dependencies installed. The report follows each `export.aug` boundary and includes labels, result types, defaults, checked errors, effects, ownership and native requirements. The contract comparison omits private storage and bodies. Changed explanations are reported separately and can describe those implementation details within an exported declaration. `--json` retains both sides of each changed contract. This command does not fetch releases or decide whether a public change is acceptable to consumers.

## Find a package by task (unreleased)

Use `aug libraries sql`, `aug libraries compression` or `aug libraries crypto` to search the curated [library catalog](library-catalog.md). Each result includes its import, installation command, platform requirements, license notes, ownership and test links. Add `--json` for native artifact metadata and exact source identities. Search works offline and changes no project or cache.

The catalog is a list of known packages. You can import any public repository that satisfies August’s package conventions. `aug add` still resolves the repository and records its selected commit; native installation still verifies its descriptor, artifact checksums and supported host.


## Review a package change (unreleased)

Run `aug package diff BEFORE AFTER` with two local package folders. Both revisions must check, including same-file test bodies. The report follows `export.aug`, expands inherited methods and compares labeled inputs, defaults, results, checked errors, capabilities, mutation, ownership, generic constraints and native requirements. It retains resolved type and capability identities, so two repositories exporting a type named `User` remain different types. Private storage names, source positions and the package’s own version number do not create contract changes by themselves.

Changed explanations appear beside the contract differences. They come from the same deterministic spec trees as `aug spec`; the report does not write generated files. It compares explanations of exported declarations, so an unexported standalone helper body is not shown merely because it changed. An exported class’s explanation includes its private fields and method bodies; edits there can change the explanation without changing its public contract. An unchanged explanation is not proof that behavior is unchanged. Use `--json` for complete contracts, exact value differences, source locations, source/configuration/dependency revisions and the native metadata from both manifests. The text view limits long contract values and points to JSON when more changes remain.

The compiler checks these revisions; it does not run their tests. Run independent behavioral checks before accepting the package update. See [testing](testing.md) for test selection and [package compatibility](package-compatibility.md) for version requirements.

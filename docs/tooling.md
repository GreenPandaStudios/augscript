# Native builds and developer tooling

The CLI checks, builds, tests, and explains August projects. Commands and configuration are listed below. Start with [the book](learn/index.md) for a first project, or [the module review guide](guides/change-a-module.md) to use context reports during a change.

## CLI

Install `aug` once as shown in [Your first project](getting-started.md). Commands take a project folder, defaulting to the current directory. Editor commands also accept --file and --offset; use --help for the command inventory.

| Command | Output |
| --- | --- |
| `doctor [PROJECT] [--json]` | Setup report without downloads or writes; unreleased. |
| `libraries [QUERY] [--json]` | **Unreleased:** search curated task/import/platform/ownership/license/test metadata offline. |
| `update PROJECT --preview [--offline] [--json]` | **Unreleased:** check proposed dependency contracts, callers and native selections without accepting the update. |
| `dependencies PROJECT [--json]` | **Unreleased:** explain verified installed source and locked native dependencies without downloads. |
| `package workflow [DIRECTORY] [--write] [--json]` | **Unreleased:** print or create reviewed consumer CI; current candidate templates require the next compiler release. |
| `package release [DIRECTORY] --tag vVERSION [--json]` | **Unreleased:** verify the tag, tracked source/specs, public contracts, dependency lock and cached native host artifacts without publication. |
| `package check DIRECTORY [--json]` | **Unreleased:** static package publishing readiness; behavioral tests remain explicit. |
| `package diff BEFORE AFTER [--json]` | **Unreleased:** compare resolved public contracts, changed spec prose and native metadata of local revisions. |
| `scratch FILE [--prepare] [--run] [--offline] [--json]` | **Unreleased:** check an isolated temporary entry module; execution requires --run. See [Try a snippet](guides/try-a-snippet.md). |
| `check PROJECT [--json]` | Production, tests, module policy, documentation, and configuration diagnostics. |
| `bundle PROJECT --out DIRECTORY [--offline] [--frozen] [--json]` | **Unreleased:** release executable, runtime libraries, notices and verification manifest. |
| `bundle verify DIRECTORY [--json]` | **Unreleased:** verify bundle files without executing the application. |
| `build PROJECT [--out NAME] [--json]` | Native path; JSON contains output and sourceMap. |
| `run [PROJECT] [--offline] -- args...` | Prepares declared packages and required native libraries, checks, compiles, and runs; program stdout is preserved. |
| `emit-c PROJECT` | Generated C for inspection. |
| `emit-llvm PROJECT` | Checked execution IR lowered directly to LLVM IR. |
| `emit-ir PROJECT` | Verified August execution IR with typed root cells and source locations, for compiler contributors. |
| `format PROJECT [--file PATH] [--write] [--json]` | Canonical source; --write updates files. |
| `migrate PROJECT [--file PATH] [--write] [--json]` | Verified migration of rejected legacy syntax; preview by default. |
| `spec PROJECT [--check] [--json]` | Adjacent prose specs with expandable checked interfaces, paragraph source links and offline dependencies; --check detects drift without writing. |
| `test PROJECT --suggest-inputs FUNCTION --file FILE [--cases JSON_FILE] [--combinations] [--limit N] [--json]` | **Unreleased:** propose bounded, compiler-checked scalar input rows; assertions remain author decisions. See [test inputs](testing.md#suggest-boundary-inputs). |
| `test PROJECT [--coverage] [--json]` | Isolated native tests and optional statement-line report. |
| `bench PROJECT [--iterations N] [--warmup N] [--timeout MS] [--json] -- args...` | Release build with timed native executions. |
| `explain PROJECT --file PATH [--name NAME]` | Checked contracts, dependencies, layers, origins, tests, and module surface. |
| `context PROJECT --file PATH [--name NAME] [--budget N] [--require-complete]` | Bounded JSON context, including related declarations and source snippets. |
| `graph PROJECT --composition [--case TEST_ID] [--json\|--mermaid]` | **Unreleased:** inspect selected application/test providers, lifetimes and constructor dependencies without execution. |
| `lsp PROJECT` | Persistent language server over stdio. |
| `init DIRECTORY [--template hello\|weather]` | New application with agent instructions and same-file tests. |
| `package init DIRECTORY [--name @owner/name]` | Standalone source library with public exports, Javadoc and a same-file test. |
| `package pack DIRECTORY` | Checked source archive ready for npm publishing or local installation. |
| `add URL [--as NAME] [--project DIRECTORY]` | Installs a repository or archive under a short import alias. |
| `install PROJECT [--frozen|--update] [--offline]` | Explicit dependency snapshot and aug.lock.json. |

Warnings are nonblocking. Human diagnostics show the source line, a pointer, and help. Machine diagnostics carry severity, code, file, line, column, message, and help. The unreleased compiler adds `related` declaration locations and `expected`/`actual` input facts. Call-input type errors name the public input and its substituted type; label errors list the callable’s accepted caller labels. Human output shows an excerpt at each related location. Fix malformed labels first: omitted-input checks resume after those labels are valid. The compiler does not choose missing argument values. check/build fail on errors; invalid options and missing option values return status 2. Test failure returns nonzero and includes the case output. Put runtime arguments after `--`, for example `aug run -- --port 8080`.

## Check an installation

The unreleased CLI adds `aug doctor`. It reports the compiler version, Node version, host target, writable project/cache paths, cached compiler/runtime integrity, and source or installed-package errors. Each selected native package includes its target, runtime requirements, cache identity and the files it links or deploys. Cached files are hashed and checked against the source-verified artifact contract. Add `--json` for a versioned report. Exit status 1 means a check failed; status 0 can still include warnings.

Doctor does not download dependencies, create caches, or edit source and locks. An uncached compiler pack is a warning: the first `aug run` still needs network access. Missing project packages require `aug install`. The JSON fields `offlineReady` and `frozenReady` describe LLVM inputs separately from `ready`, which means no setup error was found. Offline readiness requires checked source and verified cached compiler/native bytes. Frozen readiness also requires matching compiler/runtime and native locks for this host, with contributor overrides unset. A passing report does not run the application or guarantee that a future download will succeed.

Set `AUG_NATIVE_ARTIFACT_CACHE` to a writable directory when the default cache is unsuitable. When a verified cache is damaged, stop active builds before removing that entry and running online again. Contributor LLVM/runtime overrides are reported separately; unset them to check the ordinary installation. The published 0.23.0 CLI has no doctor command.

## Native standard libraries

August 0.23.0 uses LLVM by default on macOS 14+ ARM64 and GNU/Linux x64/ARM64 with glibc 2.36+. `aug run` prepares source packages and the verified compiler/runtime pack, then builds and starts the application. `build`, `test`, and `bench` use the same backend; install source packages before running them in a fresh project. Consumers do not install Clang, LLVM, or an SDK.

The first LLVM run downloads the host's tools and prebuilt runtime components. JSON, tasks, crypto, and HTTP select components from that pack. A native package can add its own platform archives. Each download has a SHA-256 pin and size bound; later projects share verified cache entries. Installation never runs package build scripts or silently falls back to a source build. Missing artifacts and unsupported platforms include the failed requirement and a recovery step.

For an offline run, prepare the project once with network access, then use:

```sh
aug run --offline
```

`--offline` prevents dependency downloads; it does not restrict application networking. `--frozen` requires recorded source, native artifact, compiler, and runtime selections for the current host. Prepare a project once online before using both flags. A cache for another architecture cannot satisfy the current host. See [native packages](native-packages.md) for supported platforms and exact qualification status.

Set `AUG_NATIVE_ARTIFACT_CACHE` to share verified downloads across compiler copies. The CLI and bundled VS Code compiler use the same LLVM default and archive pins. Native library deployment files load relative to the executable. The temporary `--backend c` reference needs a C11 compiler and source-build tools; `AUG_NATIVE_HOME` and `aug-native` configure that contributor workflow.

The [web guide](web.md) covers transport/TLS/OpenAPI configuration and the working login app. The [gap ledger](web-library-gaps.md) records remaining native and language coverage.

## Configuration

main.yaml is optional. The supported subset has scalar key/value lines and indented dash lists; it is not a general YAML implementation.

```yaml
output: application
optimization: debug
block_style: indent
indentation: tabs
assignment: to
spec:
  require_comments: none
strict_modules: false
max_public_symbols: 12
max_dependencies: 8
lint:
  - wildcard_imports
  - public_helpers
  - public_docs
  - broad_errors
  - discarded_errors
  - architecture
module_dependencies:
  - ".: app, contracts"
  - "app: contracts, shared"
```

| Key | Meaning |
| --- | --- |
| output | Executable name under .aug-build, or an absolute output path. |
| optimization | debug (-O0) or release (-O2); both retain debug information. |
| backend | llvm (default in 0.23.0) or the temporary c migration reference. |
| compiler | **Unreleased:** optional exact project compiler pin. A mismatch fails checking in the CLI and editor, before dependency installation. |
| block_style | Braces or indent for formatting and generated source. |
| indentation | Spaces (four) or tabs for formatting and generated source. |
| assignment | Formatter equals or to; both remain accepted source forms. |
| spec.require_comments | Require Javadoc on none (default), public declarations/methods, or all declarations/methods. Inherited method docs satisfy it. |
| strict_modules | Require sibling declarations to be listed in the folder export file. |
| max_public_symbols | Public declaration/member warning threshold, default 12. |
| max_dependencies | Import fan-out warning threshold, default 8. |
| lint | Optional warnings listed above. |
| module_dependencies | Allowed folder edges; same-folder imports and standard capabilities are allowed. |
| libraries / library_paths | C reference linker names and project-relative search directories; LLVM requires native package metadata. |

An owner without a rule is unrestricted. `.` names the project root; folder names use slash paths. `*` matches any folder, and `domain/*` matches that folder and descendants. Rules use the first matching owner. Import cycles are always rejected independently of the policy.

Unknown/duplicate keys, invalid values, and unsupported list shapes fail during check. VS Code provides key help and completion. Architecture warnings count public surface and dependency fan-out; there is no file-length rule.

## Numeric and text contracts

- int is a signed 64-bit integer. Literals are checked exactly. +, -, multiplication, and negation wrap in two's-complement arithmetic. The minimum divided by -1 also wraps to the minimum. Integer comparison preserves values beyond floating-point precision.
- Division by a potentially zero operand raises checked ArithmeticError. A known nonzero integer literal divisor does not need that clause.
- float uses IEEE 754 binary64. Literals must be finite. Mixed int/float arithmetic widens to double and can lose integer precision. Runtime floating-point results follow native double behavior.
- c_int is signed 32-bit and maps to the platform C int, whose width is checked during compilation. c_int(value=wide) raises ConversionError outside its range; int(value=narrow) widens without loss.
- Source strings are Unicode text, emitted as UTF-8. NUL and unpaired surrogates are compile errors. File text rejects embedded NUL and malformed/overlong UTF-8 as FileError. Binary files need a future byte API.
- Immutable tuples and records have structural equality/hashing. Behavioral classes and mutable collection objects have identity equality. Map/Set preserve insertion order for iteration.

## C boundary

Declare a C function, then call it inside an unsafe wrapper:

```aug project=ffi-guide file=main.aug
import announce from native

announce(message="Hello from C")
```

```aug project=ffi-guide file=native.aug
extern C puts(string value) returns c_int

announce(string message):
    unsafe:
        result = puts(value=message)
```

| AugScript | C ABI |
| --- | --- |
| int | int64_t |
| c_int | int, checked as 32 bits |
| float | double |
| bool | bool |
| string | const char* (UTF-8, no NUL) |
| void | void |

C calls require unsafe, and executable callers infer uses C.function. Ordinary scalar extern declarations have no generics, resolve parameters, ownership transfer, nullable boundary types, or checked error clause. For libc functions taking C int, explicitly narrow with c_int; do not declare their boundary as int64_t.

Standard adapters use `extern C value` for the managed AugValue ABI. Each C argument and result must actually be AugValue; headers expose the declared capability effect and checked failures. `pure` asserts a trusted native implementation has no observable effects. These declarations are unsafe contracts, not automatic C bindings. The crypto, HTTP, JSON, and time adapters use this boundary in `src/stdlib` and `runtime`.

The extern declaration must match the real native ABI. For owned opaque handles and binary buffers, use [native package descriptors](native-packages.md); binding maintainers can check a reviewed descriptor against a C header with `aug bind header`. Ordinary scalar extern declarations do not expose pointers, callbacks or arbitrary structs.

## Source locations and debugging

Native output lives under `.aug-build`. LLVM failures identify the August source location or failing artifact/link input. A successful build writes `EXECUTABLE.augmap.json` with compiler/runtime identities, hashes, selected artifacts and source symbols. C reference output uses `#line` locations and records its C arguments separately.

Both development and optimized builds include source debug information: an adjacent dSYM on macOS, and DWARF in the ELF executable on Linux. The compiler pack supplies macOS `dsymutil`; consumers do not need Apple developer tools to create the dSYM. LLDB reads the C-compatible tagged storage, while files, locations and producer identify the August source. Optimized variables may be unavailable. Rich collection views and August expression evaluation remain unfinished.

Use **Debug AugScript** in VS Code with LLVM lldb-dap on PATH, or configure augscript.lldbDapPath. The extension builds the project and launches the standard adapter. See the [VS Code debugger API](https://code.visualstudio.com/api/extension-guides/debugger-extension) and [LLDB DAP documentation](https://lldb.llvm.org/use/lldbdap.html).

**AugScript: Debug in LLDB Terminal** works with an ordinary lldb executable. Example terminal commands:

```text
breakpoint set --file /absolute/project/domain/numbers.aug --line 20
run
bt
```

Source breakpoints work. Variables show tagged runtime storage. Ownership-aware debugging is not yet available.

AUG_TRACE_DROPS=1 enables runtime cleanup tracing to stderr for lifecycle verification; it is developer instrumentation, not a language I/O capability.

## Benchmarks

`aug bench` uses the selected backend's release mode, runs warmups, then reports every sample, median, minimum, and p95 in milliseconds. Measurements include process startup and exclude compilation. The timeout bounds each native run.

See [performance and benchmark graphs](performance.md) for current comparisons with C, Node and Python, peak memory, HTTP throughput, raw results, and reproduction commands. Contributor commands live in [benchmark maintenance](contributing-benchmarks.md).

Benchmark the compiled executable with a workload representative of your application.

## Context for developers and LLMs

`aug explain` reports a declaration's inputs, result, state changes, I/O, checked errors, dependencies, tests, and source locations. It also reports interceptor order and binding lifetimes. For endpoints, it includes routes, statuses, streaming, input sources, and policy settings.

`aug context` adds related declarations and source snippets. Its character budget ranges from 512 to 100000, with a default of 12000.

The unreleased context packet gives the selected contract and actual implementation priority over import summaries. Resolved type identities, required dependency contracts, reverse callers, source digests, configuration digests, and the compiler identity follow. Locations use project-relative or package-relative paths. `aug explain` retains its declaration report and absolute navigation locations.

Context coverage has separate fields for project checking, graph boundaries, delivered facts, and reverse callers. A checked import closure cannot claim all project callers. Interface dispatch and native code remain explicit boundaries. A short budget reports omitted sections and identities; if even the inventory cannot fit, the packet reports that omission and marks required context incomplete. Increase the budget before making a change from it.

Use `--require-complete` in an agent integration to return exit status 1 when required facts, project coverage, reverse callers, or dispatch coverage are incomplete. Receiving a complete packet establishes compiler context. It does not establish that a requested behavior is correct: the packet describes the starting code, says that requirements have not been supplied, and reports behavioral evidence as not run.

Save an `aug explain` report and compare a later one with `--baseline previous.json`. The comparison shows changed dependencies, public signatures, and member counts. Both reports must cover the modules being compared.

## Persistent editor checks and reproducibility

### File icons

The VS Code extension includes an August logo and a file icon theme. Run
**AugScript: Open Welcome** for the illustrated overview and guides; its images
are bundled and work offline. Run
**AugScript: Enable File Icons** to select it for the current workspace, or use
**Preferences: File Icon Theme → AugScript Icons**.

| File | Icon meaning |
| --- | --- |
| `.aug` | Burgundy open circle. |
| `main.aug` | Amber startup file. |
| `export.aug` | Purple export file. |
| `main.yaml` | Teal project configuration. |

Default light/dark language icons also work with compatible icon themes. The
August theme provides the special startup and export marks. After installing an
updated VSIX, use **Developer: Reload Window** if the editor still displays the
previous version.

### Language server

The language server implements the [LSP 3.17 protocol](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.17/specification.md) over Content-Length framed UTF-8 messages. It handles document versions, diagnostics, hover, completion, definitions, formatting, fixes, and semantic tokens.

One server runs per project. Parsed modules and checked import closures are cached by source/configuration revision. Unrelated edits reuse the previous immutable semantic document; dependency edits invalidate its closure. Local files can be checked while main composition is incomplete. Whole-project check/build still validates all bindings and startup.

Compiler and extension development dependencies use exact versions and lockfiles. LLVM source maps record the compiler/runtime identities, target, source revision, native artifacts, executable, and debug files. Source packages use public repository URLs, local folders, or npm archives, with revisions and integrity in `aug.lock.json`; [the package guide](packages.md) covers creation, installation, public imports and frozen builds.

## Inferred contract hints

**Unreleased:** generic interceptor chains show each application’s resolved dependencies and effects. A second use with different types does not replace the first application’s contract.

VS Code shows inferred results, mutations, capability operations, and escaping checked errors beside executable headers. Long capability/error lists collapse to counts; their tooltip shows the full contract. These hints use the checked project, including unsaved edits and imported declarations. They are display text; formatting and saving do not add them to source. Hover, signature help, `aug explain`, and compiled specs share the same contracts. Bodyless interfaces and foreign declarations keep explicit contracts.

Hints are enabled by default. Disable `augscript.inferredContractHints` to hide them, or use VS Code’s `editor.inlayHints.enabled` setting. The language server supports `textDocument/inlayHint` with range filtering for other editors.

## Resolved project references (unreleased)

`aug graph PROJECT --file PATH` returns a revision-bearing graph with reproducible project/package paths, source and configuration digests, compiler identity, resolved symbols and occurrences, forward dependencies, and reverse callers. Coverage distinguishes checking the project, enumerating its source callers, runtime dispatch boundaries, and callers outside the project. `aug references PROJECT --file PATH --offset N` returns the selected symbol's occurrences with that revision and coverage. Offsets and editor columns use UTF-16 code units.

The language server uses the same graph for Find References and checks rename candidates before returning edits. Standard LSP clients can request versioned `documentChanges`; clients that support change annotations also receive the fix's consequence in its preview. The initial rename profile is described in [the editor guide](editor.md#find-references-and-rename-unreleased). These read-only plans do not yet provide a durable command-line source transaction.

### Inferred-hint detail (unreleased)

LSP clients can select `inferredContractHintDetail: "full"` in initialization options or under `settings.augscript` in `workspace/didChangeConfiguration`. The default is `"compact"`. The `aug/editor` `inlay-hints` request also accepts `options.detail`. Both views return the same complete tooltip and never insert inferred clauses into source.

### Checked syntax examples (unreleased)

Context packets can include small independent examples for the constructs in the selected code. Each example includes complete source units, a source digest, and its compiler regression fixture. The catalog covers inferred bindings, field comparisons, labeled calls, checked errors, owned results, borrows, and joined tasks. These examples are not declarations in your project and do not prescribe business values or recovery policy. Budget omissions still apply.

An unknown type named `let` now explains the binding forms. A direct assignment after an `if` or `while` condition explains the difference between `=` and `==`. The diagnostic asks the author to choose the intended operation; it does not rewrite behavior automatically. An actual imported type or function named `let` remains valid.

### Pin a compiler

**Unreleased:** add `compiler: 0.23.0` to `main.yaml` to require that exact compiler. The CLI and editor report both versions when they differ. Use the reported `npx @greenpandastudios/aug-cli@VERSION` command, and configure the editor to use that installation. The pin does not download or silently switch compilers. Changing it is an explicit upgrade; check dependencies, run tests, and refresh the lock.

### Build progress

**Unreleased:** interactive `run`, `build`, `bundle`, and `bench` commands show their current phase and elapsed time on stderr. Add `--progress` to show phases when redirecting output or using a task runner. Source resolution, checking, native artifacts, the compiler pack, lowering, object generation, linking, and execution report separately. The phase that fails is marked failed; the original diagnostic remains visible. Program stdout and JSON reports retain their usual format.


## Create a deployment bundle (unreleased)

Run `aug bundle . --out deploy` from an application project. It prepares ordinary package imports, selects the host's verified native artifacts, and compiles an optimized LLVM executable. Add `--frozen --offline` after preparing the recorded host selections to require cached inputs. The C reference backend cannot make bundles.

The new directory contains `app`, its required `lib` files, third-party notices under `share/august-native`, and `bundle.json`. Pure programs can use a static runtime and need no shared-library folder. Copy the complete directory to a compatible host, then run `./deploy/app`. Node.js and compiler tools are not needed there. File paths read by the application still resolve from its working directory; provide application data and secrets separately. TLS configuration that embeds certificate paths is currently rejected because those paths would prevent reliable relocation.

Use `aug bundle verify deploy` before deployment or after transfer. It checks the complete file set, hashes, sizes and executable permission without loading native libraries or running code. Links, special files, malformed manifests and unexpected files fail verification. The manifest records the compiler, source revision, native artifact hashes and minimum operating-system/libc requirements. These hashes check the recorded bytes; they do not authenticate the publisher or test the application.

A bundle destination must be new. Compilation and verification take place in a temporary sibling directory, and a completed directory is published by rename under an August writer lock. Failed builds leave no accepted output. Choose another destination for a subsequent build; review and replace an existing deployment yourself. This command does not promise coordination with external filesystem writers or survival of arbitrary storage failures.

## Starter source preferences (unreleased)

New applications and libraries record indentation, four spaces and equals in `main.yaml`. Select another style when creating them:

```sh
aug init greeting --block-style braces --indentation tabs --assignment to
aug init forecasts --template weather --assignment to
aug package init calculations --block-style indent --assignment to
```

The options configure `block_style`, `indentation` and `assignment`; edit those keys later and run `aug format --write` to reformat existing files. They change spelling and layout. Both block forms and both assignment forms retain the same behavior. Invalid, duplicate or missing option values fail before creating the project directory. Initialization writes source and configuration; `aug run` prepares application dependencies.

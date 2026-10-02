# Native builds and developer tooling

Use this page to look up CLI commands, project configuration, native requirements, and editor behavior. If you need a running first project, follow [the book](learn/index.md). To use context reports during a change, follow [the module review guide](guides/change-a-module.md).

## CLI

Install `aug` once as shown in [Your first project](getting-started.md). Commands take a project folder, defaulting to the current directory. Editor commands also accept --file and --offset; use --help for the command inventory.

| Command | Output |
| --- | --- |
| `check PROJECT [--json]` | Production, tests, module policy, documentation, and configuration diagnostics. |
| `build PROJECT [--out NAME] [--json]` | Native path; JSON contains output and sourceMap. |
| `run [PROJECT] [--offline] -- args...` | Prepares declared packages and required native libraries, checks, compiles, and runs; program stdout is preserved. |
| `emit-c PROJECT` | Generated C for inspection. |
| `emit-llvm PROJECT` | Checked execution IR lowered directly to LLVM IR. |
| `emit-ir PROJECT` | Verified August execution IR with typed root cells and source locations, for compiler contributors. |
| `format PROJECT [--file PATH] [--write] [--json]` | Canonical source; --write updates files. |
| `migrate PROJECT [--file PATH] [--write] [--json]` | Verified migration of rejected legacy syntax; preview by default. |
| `spec PROJECT [--check] [--json]` | Adjacent Markdown specs and offline dependency explanations; --check detects drift without writing. |
| `test PROJECT [--coverage] [--json]` | Isolated native tests and optional statement-line report. |
| `bench PROJECT [--iterations N] [--warmup N] [--timeout MS] [--json] -- args...` | Release build with timed native executions. |
| `explain PROJECT --file PATH [--name NAME]` | Checked contracts, dependencies, layers, origins, tests, and module surface. |
| `context PROJECT --file PATH [--name NAME] [--budget N]` | Bounded JSON context, including related declarations and source snippets. |
| `lsp PROJECT` | Persistent language server over stdio. |
| `package init DIRECTORY [--name @owner/name]` | Standalone source library with public exports, Javadoc and a same-file test. |
| `package pack DIRECTORY` | Checked source archive ready for npm publishing or local installation. |
| `add URL --as NAME [--project DIRECTORY]` | Installs a repository or archive under a short import alias. |
| `install PROJECT [--frozen|--update] [--offline]` | Explicit dependency snapshot and aug.lock.json. |

Warnings are nonblocking. Human diagnostics show the source line, a pointer, and help. Machine diagnostics carry severity, code, file, line, column, message, and help. check/build fail on errors; invalid options and missing option values return status 2. Test failure returns nonzero and includes the case output. Put runtime arguments after `--`, for example `aug run -- --port 8080`.

## Native standard libraries

August 0.21.0 uses LLVM by default on macOS 14+ ARM64 and GNU/Linux x64/ARM64 with glibc 2.36+. `aug run` prepares source packages and the verified compiler/runtime pack, then builds and starts the application. `build`, `test`, and `bench` use the same backend; install source packages before running them in a fresh project. Consumers do not install Clang, LLVM, or an SDK.

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

| Key | Contract |
| --- | --- |
| output | Executable name under .aug-build, or an absolute output path. |
| optimization | debug (-O0) or release (-O2); both retain debug information. |
| backend | llvm (default in 0.21.0) or the temporary c migration reference. |
| block_style | Formatter braces or indent. |
| indentation | Formatter spaces (four) or tabs. |
| assignment | Formatter equals or to; both remain accepted source forms. |
| spec.require_comments | Require Javadoc on none (default), public declarations/methods, or all declarations/methods. Inherited method docs satisfy it. |
| strict_modules | Require sibling declarations to be listed in the folder export file. |
| max_public_symbols | Public declaration/member warning threshold, default 12. |
| max_dependencies | Import fan-out warning threshold, default 8. |
| lint | Optional warnings listed above. |
| module_dependencies | Allowed folder edges; same-folder imports and standard capabilities are allowed. |
| libraries / library_paths | C reference linker names and project-relative search directories; LLVM requires native package metadata. |

An owner without a rule is unrestricted. . names the project root; folder names use slash paths. * matches any folder, and domain/* matches that folder and descendants. Rules use the first matching owner. Import cycles are always rejected independently of the policy.

Unknown/duplicate keys, invalid values, and unsupported list shapes fail during check. VS Code provides key help and completion. Architecture warnings count public surface and dependency fan-out; there is no file-length rule.

## Numeric and text contracts

- int is a signed 64-bit integer. Literals are checked exactly. +, -, multiplication, and negation wrap in two's-complement arithmetic. The minimum divided by -1 also wraps to the minimum. Integer comparison preserves values beyond floating-point precision.
- Division by a potentially zero operand raises checked ArithmeticError. A known nonzero integer literal divisor does not need that clause.
- float uses IEEE 754 binary64. Literals must be finite. Mixed int/float arithmetic widens to double and can lose integer precision. Runtime floating-point results follow native double behavior.
- c_int is signed 32-bit and maps to the platform C int, whose width is checked during compilation. c_int(value=wide) raises ConversionError outside its range; int(value=narrow) widens without loss.
- Source strings are Unicode text, emitted as UTF-8. NUL and unpaired surrogates are compile errors. File text rejects embedded NUL and malformed/overlong UTF-8 as FileError. Binary files need a future byte API.
- Immutable tuples and records have structural equality/hashing. Behavioral classes and mutable collection objects have identity equality. Map/Set preserve insertion order for iteration.

## C boundary

The programmer can expose a C declaration through the language, then wrap it in an ordinary callable with a visible effect contract:

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

Standard adapters use `extern C value` for the managed AugValue ABI. Each C argument and result must actually be AugValue; headers expose the declared capability effect and checked failures. `pure` asserts a trusted native implementation has no observable effects. These declarations are unsafe contracts, not automatic C bindings. Crypto, HTTP, JSON and time adapters demonstrate this narrow boundary in src/stdlib and runtime.

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

Source breakpoints work. Variables currently show tagged runtime storage; rich collection views, August expression evaluation, and ownership-aware debugging remain unfinished.

AUG_TRACE_DROPS=1 enables runtime cleanup tracing to stderr for lifecycle verification; it is developer instrumentation, not a language I/O capability.

## Benchmarks

`aug bench` uses the selected backend's release mode, runs warmups, then reports every sample, median, minimum, and p95 in milliseconds. Measurements include process startup and exclude compilation. The timeout bounds each native run.

See [performance and benchmark graphs](performance.md) for current comparisons with C, Node and Python, peak memory, HTTP throughput, raw results, and reproduction commands. Contributor commands live in [benchmark maintenance](contributing-benchmarks.md).

Benchmark the compiled executable with a representative workload. Source readability and native compilation do not determine the time spent in allocation, I/O, or your dependencies.

## Context for developers and LLMs

Explain emits checked callable inputs, results, mutation, capabilities, effective errors, interceptor order/dependencies/short-circuit signals, source locations, tests, and binding lifetimes. Endpoint contracts also include route, status, streaming, wire input sources, policy options and explicit policy dependencies. Context adds reachable related declarations and source snippets within a character budget (512–100000, default 12000).

Output labels completeness as checked or partial and marks truncation explicitly. A partial or truncated result cannot establish whole-application correctness. Provenance uses stable declaration IDs and absolute source locations.

Save a report, then compare architecture with --baseline previous.json. Reports include file dependency edges, public signature hashes, and member counts; changes describe added/removed dependencies and public interface growth. Both reports must cover the modules being compared.

## Persistent editor checks and reproducibility

### File icons

The VS Code extension includes an August logo and a file icon theme. Run
**AugScript: Open Welcome** for the illustrated overview and guides; its images
are bundled and work offline. Run
**AugScript: Enable File Icons** to select it for the current workspace, or use
**Preferences: File Icon Theme → AugScript Icons**.

| File | Icon meaning |
| --- | --- |
| `.aug` | Blue source file. |
| `main.aug` | Amber startup file. |
| `export.aug` | Purple public module surface. |
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

VS Code shows inferred results, mutations, capability operations, and escaping checked errors beside executable headers. Long capability/error lists collapse to counts; their tooltip shows the full contract. These hints use the checked project, including unsaved edits and imported declarations. They are display text; formatting and saving do not add them to source. Hover, signature help, `aug explain`, and compiled specs share the same contracts. Bodyless interfaces and foreign declarations keep explicit contracts.

Hints are enabled by default. Disable `augscript.inferredContractHints` to hide them, or use VS Code’s `editor.inlayHints.enabled` setting. The language server supports `textDocument/inlayHint` with range filtering for other editors.

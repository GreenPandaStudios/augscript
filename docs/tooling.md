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
| `format PROJECT [--file PATH] [--write] [--json]` | Canonical source; --write updates files. |
| `migrate PROJECT [--file PATH] [--write] [--json]` | Verified migration of rejected legacy syntax; preview by default. |
| `spec PROJECT [--check] [--json]` | Adjacent Markdown specs and offline dependency explanations; --check detects drift without writing. |
| `test PROJECT [--coverage] [--json]` | Isolated native tests and optional statement-line report. |
| `bench PROJECT [--iterations N] [--warmup N] [--timeout MS] [--json] -- args...` | Release build with timed native executions. |
| `explain PROJECT --file PATH [--name NAME]` | Checked contracts, dependencies, layers, origins, tests, and module surface. |
| `context PROJECT --file PATH [--name NAME] [--budget N]` | Bounded JSON context, including related declarations and source snippets. |
| `lsp PROJECT` | Persistent language server over stdio. |
| `package init DIRECTORY --name @owner/name` | Standalone source library with public exports, Javadoc and a same-file test. |
| `package pack DIRECTORY` | Checked source archive ready for npm publishing or local installation. |
| `install PROJECT [--frozen] [--offline]` | Explicit dependency snapshot and aug.lock.json. |

Warnings are nonblocking. Human diagnostics show the source line, a pointer, and help. Machine diagnostics carry severity, code, file, line, column, message, and help. check/build fail on errors; invalid options and missing option values return status 2. Test failure returns nonzero and includes the case output. Put runtime arguments after `--`, for example `aug run -- --port 8080`.

## Native standard libraries

`aug run` handles dependency preparation. `build`, `test`, and `bench` also prepare the native libraries their checked programs need; they require source packages to be installed already. Pure programs need only a C11 compiler. JSON needs yyjson, tasks need minicoro, crypto needs the pinned cryptographic libraries, and HTTP needs the full transport stack. Unused libraries are not downloaded.

The first native preparation can take several minutes for web/crypto; progress names the current download or build. Later runs reuse the cache. Downloaded archives must match their pinned SHA-256 hashes. Interrupted preparation can resume, and simultaneous projects sharing a cache wait for its writer. Native setup never installs system packages. Missing compilers or build tools produce a recovery command. On Linux, HTTP builds also need CMake and zlib development headers. macOS works with Xcode or its Command Line Tools.

For an offline run, prepare the project once with network access, then use:

```sh
aug run --offline
```

`--offline` prevents dependency downloads; it does not restrict application networking. Native commands accept it too. You can prewarm libraries without running an application using `aug-native --extract-only --only yyjson,minicoro`, `aug-native --profile crypto`, or `aug-native` for all libraries. The installed manifest records the host platform and architecture; a cache from another host produces an actionable error. The full build has run on macOS ARM and Linux ARM; Linux x86-64 is checked by the Docker CI job.

Set `AUG_NATIVE_HOME` to share a dependency directory across compiler copies. It names the directory containing `sources/` and `prefix/`, not the prefix itself. Bootstrap and compilation both honor it. For the bundled VS Code compiler, set `augscript.nativeHome` to that same absolute directory. The extension bundles the bootstrap scripts and lockfile; it does not bundle host-specific native libraries. Node 24+ and a C11 compiler remain requirements.

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
libraries:
  - m
library_paths:
  - native/lib
```

| Key | Contract |
| --- | --- |
| output | Executable name under .aug-build, or an absolute output path. |
| optimization | debug (-O0) or release (-O2); both retain debug information. |
| block_style | Formatter braces or indent. |
| indentation | Formatter spaces (four) or tabs. |
| assignment | Formatter equals or to; both remain accepted source forms. |
| spec.require_comments | Require Javadoc on none (default), public declarations/methods, or all declarations/methods. Inherited method docs satisfy it. |
| strict_modules | Require sibling declarations to be listed in the folder export file. |
| max_public_symbols | Public declaration/member warning threshold, default 12. |
| max_dependencies | Import fan-out warning threshold, default 8. |
| lint | Optional warnings listed above. |
| module_dependencies | Allowed folder edges; same-folder imports and standard capabilities are allowed. |
| libraries / library_paths | Linker library names and project-relative search directories. |

An owner without a rule is unrestricted. . names the project root; folder names use slash paths. * matches any folder, and domain/* matches that folder and descendants. Rules use the first matching owner. Import cycles are always rejected independently of the policy.

Unknown/duplicate keys, invalid values, and unsupported list shapes fail during check. VS Code provides key help and completion. Architecture warnings count public surface and dependency fan-out; there is no file-length rule.

## Numeric and text contracts

- int is a signed 64-bit integer. Literals are checked exactly. +, -, multiplication, and negation wrap in two's-complement arithmetic. The minimum divided by -1 also wraps to the minimum. Integer comparison preserves values beyond floating-point precision.
- Division by a potentially zero operand raises checked ArithmeticError. A known nonzero integer literal divisor does not need that clause.
- float uses C double. Literals must be finite. Mixed int/float arithmetic widens to double and can lose integer precision. Runtime floating-point results follow native double behavior.
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

announce(string message) uses C.puts:
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

C calls require unsafe, and callables declare uses C.function. Ordinary scalar extern declarations have no generics, resolve parameters, ownership transfer, nullable boundary types, or checked error clause. For libc functions taking C int, explicitly narrow with c_int; do not declare their boundary as int64_t.

Standard adapters use `extern C value` for the managed AugValue ABI. Each C argument and result must actually be AugValue; headers expose the declared capability effect and checked failures. `pure` asserts a trusted native implementation has no observable effects. These declarations are unsafe contracts, not automatic C bindings. Crypto, HTTP, JSON and time adapters demonstrate this narrow boundary in src/stdlib and runtime.

The extern declaration must match the real native ABI. This version does not expose pointers, callbacks, binary buffers, arbitrary structs, or a C header importer.

## Source locations and debugging

Native output lives under .aug-build. Generated C has #line locations for executable AugScript statements and extern declarations. Native compiler errors at those locations become NATIVE diagnostics. A successful build writes EXECUTABLE.augmap.json with compiler version, exact C arguments, source hashes, generated hash, and symbol origins.

Every build uses -g. Use **Debug AugScript** in VS Code with LLVM lldb-dap on PATH, or configure augscript.lldbDapPath. The extension builds the project and launches the standard adapter. See the [VS Code debugger API](https://code.visualstudio.com/api/extension-guides/debugger-extension) and [LLDB DAP documentation](https://lldb.llvm.org/use/lldbdap.html).

**AugScript: Debug in LLDB Terminal** works with an ordinary lldb executable. Example terminal commands:

```text
breakpoint set --file /absolute/project/domain/numbers.aug --line 20
run
bt
```

Debug information resolves source breakpoints. Variables currently display the C runtime's tagged representation; rich AugScript variable views, expression evaluation, and ownership-aware debugging are future work. This machine has LLDB but no lldb-dap, so the DAP launch path requires installing/configuring that adapter. The source-breakpoint smoke test resolved two locations; native launch then stalled on this host and was stopped, so interactive stepping and call-stack behavior remain unverified here.

AUG_TRACE_DROPS=1 enables runtime cleanup tracing to stderr for lifecycle verification; it is developer instrumentation, not a language I/O capability.

## Benchmarks

`aug bench` compiles release C, runs warmups, then reports every sample, median, minimum, and p95 in milliseconds. Measurements include process startup and exclude compilation. The timeout bounds each native run.

See [performance and benchmark graphs](performance.md) for measured comparisons with C, Node and Python, peak memory, HTTP throughput, raw results, and reproducible commands. `npm run bench:compare` measures the fixed workloads under `benchmarks/`. The earlier [single-workload baseline](benchmarks.json) is preserved as historical evidence.

The runtime uses tagged values, dynamic member lookup, a managed heap, and runtime collection adapters. Speed claims require workload comparisons and profiling; translating to C alone does not establish them.

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
**Preferences: File Icon Theme → AugScript Icons**. The repository already sets
`workbench.iconTheme` to `augscript-icons` in its workspace settings.

| File | Icon meaning |
| --- | --- |
| `.aug` | Blue source file. |
| `main.aug` | Amber startup file. |
| `export.aug` | Purple public module surface. |
| `main.yaml` | Teal project configuration. |

Default light/dark language icons also work with compatible icon themes. The
August theme provides the special startup and export marks. After installing an
updated VSIX, use **Developer: Reload Window** if the editor still displays the
previous version. Editable vector artwork and its rendering instructions live
in `vscode/media`.

### Language server

The language server implements the [LSP 3.17 protocol](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.17/specification.md) over Content-Length framed UTF-8 messages. It handles document versions, diagnostics, hover, completion, definitions, formatting, fixes, and semantic tokens.

One server runs per project. Parsed modules and checked import closures are cached by source/configuration revision. Unrelated edits reuse the previous immutable semantic document; dependency edits invalidate its closure. Local files can be checked while main composition is incomplete. Whole-project check/build still validates all bindings and startup.

Compiler and extension development dependencies use exact versions and lockfiles. Native maps record the selected C toolchain and inputs; C compiler/OS versions are environment requirements, not vendored binaries. User-authored source packages use npm archives/registry transport, exact versions, and `aug.lock.json`; [the package guide](packages.md) covers creation, installation, public imports and frozen CI builds.

# Compatibility and supported platforms

This page defines the compatibility contract for August 1.x. It takes effect when the qualified 1.0.0 stable release is published. The current published release, 0.23.0, remains a preview; [the roadmap](roadmap.md) records candidate evidence and remaining publication gates.

The [ownership and task conformance page](language-conformance.md) records checked preview behavior for moves, aliasing, cleanup, cancellation, and delayed errors.

## What a 1.0 release will keep stable

| Area | 1.x contract |
| --- | --- |
| August source | Accepted syntax, import visibility, labeled calls, types, ownership, effects, checked errors, tasks, and same-file tests keep their documented meaning through 1.x. Minor releases can add syntax or APIs. |
| CLI and project files | Documented `aug` commands, `main.yaml` keys, `aug-package.json`, and `aug.lock.json` retain compatible reading within 1.x. New fields have defaults; removing or changing a field requires a major release. |
| First-party packages | CLI, standard, web, and crypto packages use one exact version. A release tests installed tarballs together; mixing versions is unsupported. Published 0.23.0 requires an exact compiler in user manifests. The unreleased compiler accepts author-declared bounded ranges; exports still come from `export.aug`. See [package compatibility](package-compatibility.md). |
| Generated specifications | `aug spec` remains deterministic for a given compiler and project. Text and layout can improve between versions; tools should link to source and declarations rather than parse Markdown prose. |
| Native boundary | `aug-native-abi-1` uses fixed-width scalars, copied buffers and opaque resources over the target C ABI. Package descriptors preserve ownership, release, errors and platform requirements. The runtime's `AugValue` layout and pointer-call services remain compiler-private. The [ABI reference](native-abi.md) fixes the existing public contract. Its target gates must pass before a 1.x stability promise. |

A change that makes valid 1.x source fail to compile, changes its observable behavior, or removes a documented public name is breaking. A safety or correctness repair may require a narrow exception, but its release must explain the affected code, provide a diagnostic, and provide `aug migrate` support when mechanical migration is possible. Security fixes can be released promptly; they still get a compatibility note.

## Migration between versions

Each release documents source, configuration, package, and native changes in the changelog. When spelling can be changed safely, `aug migrate PROJECT` performs or suggests the edit. For changes requiring a choice, the diagnostic explains the alternatives without rewriting behavior silently. Install a compatible compiler and extension. With the unreleased compiler, `aug install` checks package requirements while retaining locked repository commits. Use `aug install --update` only when you intend to change those revisions too. Then run:

```sh
aug check PROJECT
aug test PROJECT
aug spec PROJECT --check
```

Rebuild native executables and private dependencies for the target platform after a compiler upgrade. `aug.lock.json` and the pinned native dependency manifest provide the input versions; a compiled executable is not promised to work with a different runtime image or native dependency set.

## Platform evidence

| Target | Preview evidence | 1.0 support decision |
| --- | --- | --- |
| macOS 14+ ARM64 | Installed CLI and real public native libraries pass on macOS 14 with Xcode and Command Line Tools removed. | Selected for 1.0; every release repeats language, debugger, sanitizer, performance and consumer gates. |
| GNU/Linux ARM64, glibc 2.36+ | Debian 12 CI runs LLVM language/runtime regressions and public imports in a consumer image without compilers, Git or headers. A [physical DGX Spark](dgx-spark.md) passed parity, safety gyms, benchmarks and real library imports. | Selected for 1.0; qualify each compiler candidate and deployment bundle. |
| GNU/Linux x86-64, glibc 2.36+ | The same Debian 12 CI and clean-consumer profile passes on native x86-64 runners. | Selected for 1.0; qualify each compiler candidate and deployment bundle. |
| Windows and other targets | No full native verification. | Outside the 1.0 support matrix. |

The 0.23.0 consumer workflow requires Node.js 24+ and a supported host. August downloads its pinned compiler/runtime and package artifacts; consumers do not install Clang, LLVM or an SDK. Explicit C reference builds and binding authoring require their [maintainer tools](tooling.md). Musl, Windows and cross compilation are outside this profile. Cooperative tasks share their current thread and heap. Worker tasks run on OS threads with isolated heaps and copied inputs and results. HTTP and OIDC library conformance is tracked separately in the [web and crypto gap ledger](web-library-gaps.md); that library work is tracked separately from the core language's 1.0 requirements.

All three selected hosts passed candidate qualification. The final source and assembled artifacts must repeat CI, installed-package and native integration gates before stable publication; dependency/license review and the documented update path remain release requirements. See [production readiness](production-readiness.md) for present limits.

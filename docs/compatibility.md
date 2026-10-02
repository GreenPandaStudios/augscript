# Compatibility and supported platforms

August is a preview. This page states the proposed 1.0 compatibility contract and the evidence still needed before it takes effect. The pending 0.21.0 release adds the qualified LLVM/native package profile; the [roadmap](roadmap.md) tracks its release gate.

The [ownership and task conformance page](language-conformance.md) records executable candidate behavior for moves, aliasing, cleanup, cancellation, and delayed errors.

## What a 1.0 release will keep stable

| Surface | 1.x promise |
| --- | --- |
| August source | Accepted syntax, import visibility, labeled calls, types, ownership, effects, checked errors, tasks, and same-file tests keep their documented meaning through 1.x. Minor releases can add syntax or APIs. |
| CLI and project files | Documented `aug` commands, `main.yaml` keys, `aug-package.json`, and `aug.lock.json` retain compatible reading within 1.x. New fields have defaults; removing or changing a field requires a major release. |
| First-party packages | CLI, standard, web, and crypto packages use one exact version. A release tests installed tarballs together; mixing versions is unsupported. Explicit user manifests currently require the exact compiler version and retain their own public `export.aug` surface. |
| Generated specifications | `aug spec` remains deterministic for a given compiler and project. Text and layout can improve between versions; tools should link to source and declarations rather than parse Markdown prose. |
| Native boundary | `aug-native-abi-1` uses fixed-width scalars, copied buffers and opaque resources over the target C ABI. Package descriptors preserve ownership, release, errors and platform requirements. The runtime's `AugValue` layout and pointer-call services remain compiler-private. The preview ABI must pass its release gates before a 1.x stability promise. |

A change that makes valid 1.x source fail to compile, changes its observable behavior, or removes a documented public name is breaking. A safety or correctness repair may require a narrow exception, but its release must explain the affected code, provide a diagnostic, and provide `aug migrate` support when mechanical migration is possible. Security fixes can be released promptly; they still get a compatibility note.

## Migration between versions

Each release documents source, configuration, package, and native changes in the changelog. When spelling can be changed safely, `aug migrate PROJECT` performs or suggests the edit. For changes requiring a choice, the diagnostic explains the alternatives without rewriting behavior silently. Upgrade the compiler and extension together; update source dependencies deliberately with `aug install --update`, then run:

```sh
aug check PROJECT
aug test PROJECT
aug spec PROJECT --check
```

Rebuild native executables and private dependencies for the target platform after a compiler upgrade. `aug.lock.json` and the pinned native dependency manifest provide the input versions; a compiled executable is not promised to work with a different runtime image or native dependency set.

## Platform evidence

| Target | Preview evidence | 1.0 support decision |
| --- | --- | --- |
| macOS 14+ ARM64 | Installed CLI and real public native libraries pass on macOS 14 with Xcode and Command Line Tools removed. | Candidate; every release must repeat language, debugger, sanitizer, performance and consumer gates. |
| GNU/Linux ARM64, glibc 2.36+ | Debian 12 CI runs LLVM language/runtime regressions and public imports in a consumer image without compilers, Git or headers. | Candidate; qualify each compiler candidate and deployment bundle. Physical DGX testing remains pending. |
| GNU/Linux x86-64, glibc 2.36+ | The same Debian 12 CI and clean-consumer profile passes on native x86-64 runners. | Candidate; qualify each compiler candidate and deployment bundle. |
| Windows and other targets | No full native verification. | Outside the proposed 1.0 support matrix. |

The pending 0.21.0 consumer workflow requires Node.js 24+ and a supported host. August downloads its pinned compiler/runtime and package artifacts; consumers do not install Clang, LLVM or an SDK. Explicit C reference builds and binding authoring require their [maintainer tools](tooling.md). Musl, Windows and cross compilation are outside this profile. The current runtime schedules tasks on one OS thread. HTTP and OIDC library conformance is tracked separately in the [web and crypto gap ledger](web-library-gaps.md); those application concerns are not language 1.0 gates.

The 1.0 support matrix becomes a commitment only after each candidate target has green CI, installed-package and native integration tests, dependency/license review, and a documented update path. See [production readiness](production-readiness.md) for present limits.

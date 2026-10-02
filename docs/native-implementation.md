# Native packages and LLVM implementation

The [accepted architecture](native-interop-llvm-plan.md) is being implemented on
`codex/native-llvm`. The first delivery requires real repository imports of CPU
LibTorch, SQLite, zlib, and Rust BLAKE3, compiled through LLVM on macOS ARM64.
Passing a linker probe or metadata test does not complete that delivery.

The 0.21.0 candidate now selects LLVM for ordinary `build`, `run`, `test` and
`bench` commands. C remains an explicit migration reference. Its updated
language, debugger, sanitizer, performance and clean-consumer gates must pass
on all three hosts before the compiler release is published. The published
0.20.1 CLI still uses C. CPU LibTorch `v0.1.4` and the other three libraries'
`v0.1.3` releases are already public.

The package manifest now has a checked format 2 for native dependencies. It pins
the binding descriptor, upstream identity, target requirements, archive hash and
size limits, link inputs, deployment files, and component versions. Source
installation validates those facts without running native build scripts. This
is development branch behavior; the published CLI does not support it yet.

The branch emits LLVM IR from checked execution IR, runs LLVM 23.1.2's optimizer
and object generator, and links with LLD using an independently authored platform
import stub. Consumers install a pinned compiler pack. Opaque resources have
deterministic release, call-duration loans, and checked package/provider identities.
Native failures use their resolved August constructors and method tables.

All four real adapters have been built and tested locally. Ten August cases
pass through the installed tool pack with native compilers, Git and SDK paths
unavailable to the test processes. Their versioned sources and native archives are
published in separate public repositories. A second check installs the npm CLI
archives into a fresh `node_modules`, downloads each library from GitHub, and
runs its program through LLVM using both URL imports and named package aliases.
All four programs produce the expected results, then run with unchanged frozen
locks offline. Each executable also runs after relocation with its deployment libraries and
notices. Real LibTorch adapter counters verify that a failed class constructor
releases its transferred handle and that an owned function input is released
before an early return reaches its caller. The check supplies only the unpublished
compiler archive locally; it uses real public transport for every library. The
macOS 14 ARM64 consumer gate passed in CI on commit `298c0a6`, including frozen,
offline and relocated execution. Compiler release publication remains outstanding;
each subsequent compiler change must pass that same gate before publication.
The independent native clients run
1,000 cleanup cycles per library. SQLite also checks persistent storage and
rejects SQL attachment/VACUUM INTO before they can expand filesystem authority.
Scalar reads authorize only queries before execution, rejecting PRAGMA commands,
transactions, savepoints, and writes without changing the connection.

The compiler suite checks owned field transfers, native error dispatch, bounded
direct calls, archive integrity, modified lock metadata and ambiguous physical
symbols. These finite checks do not establish arbitrary foreign-code safety.
LibTorch's collected redistribution notices do not replace an exhaustive upstream
binary SBOM; the qualification research records that gap.

LLVM also lowers optional and nominal record matches, nested dependency scopes,
`Shared` locks, `always` cleanup and cooperative tasks. The existing concurrency
fixtures run against both backends: grouped and collection waits retain order,
child failures cancel siblings, cancellation runs cleanup, and scopes join child
loans before dropping their resources. A task cancelled before entry releases
its transferred owned inputs even though its function never runs. Native regressions check normal execution,
early returns, caught and pending errors, and errors raised during cleanup.
The [native example projects](examples/index.md#native-libraries-llvm-preview)
include checked source, generated explanations and same-file tests. They require
the development compiler until its matching npm release and compiler pack are public.

The migration now includes JSON parsing and typed decoding, clocks, the existing
GnuTLS crypto APIs, native HTTP handlers and their policies, form decoding,
streams, server HTML/actions, and interceptor chains. Both backends use one
concrete schema graph; JSON and forms invoke the appropriate checked constructor
callback. LLVM verification runs before native object generation in development
and optimized builds. The existing web and interceptor fixtures run against the
LLVM path during migration. CI and release builds share
`node scripts/check-llvm-parity.mjs` to run the existing language, task, web and
real-app expectations through LLVM with bounded test concurrency.

Constructor layers track fresh results from `next()`. If interception fails after
construction, cleanup releases the completed object's owned fields before the
failure reaches its caller. Action captures evaluate labeled inputs once in their
written order. Runtime-pack builds also check operation, schema and policy
identifiers against the compiled headers; installation rejects a different
identifier contract.

Crypto and HTTP are separate prebuilt runtime components. Programs link and
deploy the components named by their checked IR. Their GnuTLS, Nettle and GMP
libraries remain replaceable dynamic files, with source archives, August adapter
sources, build recipes and notices in the deployment metadata. Maintainer builds
target macOS 14 and reject binaries with a higher deployment requirement. The
macOS 14 consumer gate passed for the expanded pack in
[CI run 36942469546](https://github.com/GreenPandaStudios/augscript/actions/runs/36942469546),
on commit `253bb1b`. That runner physically removed Xcode and Command Line Tools
before installing the CLI. All four public library downloads, frozen/offline
runs, relocated deployments, real-resource cleanup checks, task calls and
JSON/crypto/HTTP checks passed. Later compiler candidates must pass that gate
again. Tool removal is confined to the disposable GitHub-hosted job.

Execution IR now records checked source types, parameter labels, rooted cells and
source locations. A structural verifier checks frame bounds, control-flow targets,
cleanup returns, resolved calls, data schemas and private runtime signatures before
LLVM emission. The frontend remains responsible for source typing and ownership;
this verifier does not prove foreign code safe. Contributors can inspect it with
`aug emit-ir`.

Concrete nonnullable scalar cells stay outside the GC root frame; managed values
retain their registered roots. LLVM preserves integer wrapping and the runtime's
mixed numeric dispatch. Collection services use pointer arguments across the
private runtime boundary, avoiding target-specific C aggregate calling rules.
Runtime packs measure private execution flag and fiber offsets on each target.
LLVM functions retain their current execution pointer across suspension, as
the C reference does, and observe both task fibers and checkpoint hooks.

GNU/Linux packs include a verified core archive as well as the shared runtime.
Programs that need no dynamic runtime component link that archive directly;
crypto and HTTP programs use one shared core with their components. Both paths
retain the same task, root and ownership behavior. Only the existing private
checkpoint-hook boundary is exported by core-only executables. The archive is
a maintainer-built input; application compilation does not invoke a C compiler.

The compressed-stream disconnect regression now receives enough chunks to
trigger managed collection before disconnecting. It exposed temporary header
strings that were not rooted while another argument was allocated. Header
construction now roots those values before allocating its name; the check
also verifies disconnect logging and that the server remains alive.

LLVM output includes DWARF source lines and variables in both development and
optimized builds. The compiler pack contains `dsymutil`, which writes an adjacent
dSYM without an SDK. `.augmap.json` identifies the IR, object, executable, debug
file and selected native artifacts. Tests inspect the actual DWARF for source
functions, sibling lexical scopes, parameters, loop bindings and catch variables.
Local variable declarations appear at their source position. Debugger values use the real tagged representation;
LLDB uses its C-compatible type reader for that representation while the source
and producer identify August. This fixes missing variables in LLDB versions
that cannot read an unregistered vendor language. Rich views and August
expression evaluation are future work. LLVM tests also collect statement-line coverage,
including zero counts for unexecuted statements. Setup assertions do not count
toward a test case's required assertions. Same-file tests honor the configured
development or release optimization mode.
An actual LLDB check stops at an August source line, reads a parameter and local
in their tagged representation, then continues to a successful process exit.

Configured executable and OpenAPI output paths work with LLVM. Local
`libraries` and `library_paths` settings require the C reference backend; LLVM
requires package-declared native link inputs so its deployment closure stays
locked and does not depend on a consumer's toolchain.

## Delivery order

| Step | Work | Acceptance |
| --- | --- | --- |
| 1 | ABI profile, resources, targets, descriptor and artifact validation | Reject mismatched contracts, unsupported platforms, unsafe archive paths, and unbounded downloads |
| 2 | Four separate repositories, real adapters and release builds | Independent native clients verify upstream operations and cleanup |
| 3 | Checked execution IR and LLVM generation | Native August functions preserve labels, control flow, errors, and roots |
| 4 | Runtime packs and pointer-call services | Immediate resource release and interface dispatch pass native checks |
| 5 | SDK-free linker and distributed tools | A relocated executable runs without SDK or compiler inputs |
| 6 | Repository transport, native locks and cache | URL and alias imports restore exact source and artifact identities |
| 7 | Compiler-checked bindings and CLI bundles | All four accepted examples compile through LLVM and run correctly |
| 8 | First milestone qualification | Installed CLI works on a clean macOS 14+ ARM64 machine with no native toolchain |
| 9 | Full language parity, debug information and release builds | Existing language, runtime, HTTP, editor and package suites pass with LLVM |
| 10 | Linux packs, migration and LLVM default | Per-platform parity, deployment and distribution gates pass |

Callbacks, exported August libraries, borrowed native views, additional platform
profiles and GPU support follow the qualified first profile as specified in the
architecture. Their semantics must not be implied by the initial resource ABI.

## Evidence

Maintainers can check C adapter headers with `aug bind header`. It emits reviewed
declaration fragments and a physical ABI report; it keeps ownership and allocator
promises explicitly author-declared. Independent malformed-header fixtures check
integer signedness, byte booleans, buffer lengths, mutable pointers, releases,
callbacks and error layout. The audit found an unsigned cleanup-counter mismatch
in LibTorch's `v0.1.3` adapter. Its corrected signed exports passed native clients
on all three targets and are published as
[`v0.1.4`](https://github.com/GreenPandaStudios/aug-pytorch/releases/tag/v0.1.4);
the three other real package headers passed.

Compiler locks now retain independent selections for each host. Installed-CLI
qualification checks that recording another host preserves the current pin and
that a frozen build with its current entry removed fails without editing the lock.

The LLVM migration benchmark accepts `--backend llvm` and `--backend c` with the
same checked programs and independent output checks. Scalar lowering retains
wrapping int64 arithmetic, IEEE comparisons and checked runtime division. Tests
include the signed minimum divided by minus one, NaN, optional values and mixed
integer/float comparisons. Performance qualification is still in progress.
The current local Mac candidate passes the frozen limits; both GNU/Linux CI
producer jobs now run the same paired workloads and preserve their raw reports.
The frozen migration limits live in `native/llvm-performance-gates.json`: each
batch median may rise by at most 20% or 0.5ms against the same August program on
the C backend; HTTP throughput may fall by at most 20%. Qualification requires
15 rotating samples after three warmups and five HTTP rounds at each declared
concurrency. These limits apply to migration, not a general speed claim.

The maintainer sanitizer harness accepts `--backend llvm`. LLVM's ASan pass
instruments the actual emitted program before object generation. The harness
adds `sanitize_address` to each generated function, checks the inserted memory
probes, and requires a deliberate stack overflow to fail. Clang builds
the same core runtime sources with ASan and UBSan, then links that LLVM object.
This is a maintainer test, and does not introduce a consumer toolchain
requirement. It checks collections, allocation pressure and owned task inputs.
UBSan covers the C runtime; it does not reconstruct source-level arithmetic
checks from LLVM IR or establish that an upstream binary is safe. Leak checking
is disabled for the coroutine harness; independent resource counters provide
the separate native cleanup evidence.

GNU/Linux lowering now supports x86-64 and ARM64 on Debian/Ubuntu with glibc
2.36 or later. An independently authored process-entry object calls the public
libc initialization entry. LLD links against the host's runtime libc and loader;
application compilation requires no CRT development objects, headers or native
compiler. ELF libraries load relative to the executable. LLVM's own C++/ICU/XZ
dependencies stay in its tool directory and are not application dependencies.

Debian 12 x86-64 and ARM64 qualification passed in
[CI run 36953864621](https://github.com/GreenPandaStudios/augscript/actions/runs/36953864621)
on commit `c2cab3d`. Each architecture passed 247 LLVM regression cases; three
macOS DWARF inspection cases were skipped. Two native ABI boundary cases also
passed. An installed CLI ran CPU LibTorch, SQLite, zlib and Rust BLAKE3 using
verified local candidates, including their same-file tests, frozen/offline locks,
relocation, owned-resource cleanup and task calls. The independent native clients
ran 1,000 cleanup cycles per library. These checks use local native archives and
do not qualify public Linux downloads. All four libraries publish checksum-pinned
archives for macOS ARM64, GNU/Linux x86-64 and GNU/Linux ARM64. The
per-architecture workflows also run public repository imports in a separate
Debian 12 consumer container without compilers, Git or development headers.
Only the unpublished compiler pack is supplied locally for that check.

The local clean Debian 12 ARM64 consumer check also passed against all four public
`v0.1.3` repository tags and release archives. It ran without Clang, GCC, Git or
development headers, including the Node headers normally present in the base
image. URL imports, named aliases, same-file tests, frozen/offline runs, relocated
deployments, real-resource cleanup, tasks, JSON, crypto and HTTP forms passed.
Both clean GNU/Linux jobs passed independently on commit `c21cd88` in
[run 36956350591](https://github.com/GreenPandaStudios/augscript/actions/runs/36956350591).
The matching macOS 14 gate passed in
[run 36956350544](https://github.com/GreenPandaStudios/augscript/actions/runs/36956350544).
These gates used the then-current `v0.1.3` public libraries; later compiler and
library changes must pass them again.

The ARM64 LibTorch CPU archive contains OpenBLAS 0.3.34 and Arm Compute 53.2.0
alongside LibTorch 2.14.1. The build checks reported binary versions and retains
their exact source archives and license files. It rejects CUDA, NVPL and Python
libraries from the deployment closure. The GCC runtime dependencies are pinned
Debian packages with corresponding sources, patches and license texts. Consumers
never execute these maintainer recipes. The upstream binary's exhaustive static
component inventory remains a documented limit.

Physical DGX Spark qualification awaits a reachable machine. Container results
are ARM64 evidence; they do not establish that August has run on DGX hardware.

The metadata suite exercises package loading and target selection. The
[research note](research/native-interop-llvm.md) records a macOS ARM64 linker
probe with independent platform stubs and no SDK inputs. Neither is a fresh
machine installation test. Release qualification will record the exact LLVM
version, runtime build inputs, package tags, native artifacts and test results.
Run `node scripts/qualify-native-consumers.mjs --local-compiler` after packaging
to repeat the prepublication consumer check. Omit `--local-compiler` after the
compiler release asset is public to check every download through HTTPS.

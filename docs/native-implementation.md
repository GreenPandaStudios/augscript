# Native packages and LLVM implementation

The [accepted architecture](native-interop-llvm-plan.md) is being implemented on
`codex/native-llvm`. The first delivery requires real repository imports of CPU
LibTorch, SQLite, zlib, and Rust BLAKE3, compiled through LLVM on macOS ARM64.
Passing a linker probe or metadata test does not complete that delivery.

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
unavailable to the test processes. Their `v0.1.1` sources and native archives (SQLite `v0.1.2`) are
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
[CI run 36938094736](https://github.com/GreenPandaStudios/augscript/actions/runs/36938094736),
on commit `e72a8a2`. Later compiler candidates must pass that gate again.

Execution IR now records checked source types, parameter labels, rooted cells and
source locations. A structural verifier checks frame bounds, control-flow targets,
cleanup returns, resolved calls, data schemas and private runtime signatures before
LLVM emission. The frontend remains responsible for source typing and ownership;
this verifier does not prove foreign code safe. Contributors can inspect it with
`aug emit-ir`.

LLVM output includes DWARF source lines and variables in both development and
optimized builds. The compiler pack contains `dsymutil`, which writes an adjacent
dSYM without an SDK. `.augmap.json` identifies the IR, object, executable, debug
file and selected native artifacts. Tests inspect the actual DWARF for source
functions, sibling lexical scopes, parameters, loop bindings and catch variables.
Local variable declarations appear at their source position. Debugger values use the real tagged representation;
rich views are future work. LLVM tests also collect statement-line coverage,
including zero counts for unexecuted statements. Setup assertions do not count
toward a test case's required assertions. Same-file tests honor the configured
development or release optimization mode.

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

The metadata suite exercises package loading and target selection. The
[research note](research/native-interop-llvm.md) records a macOS ARM64 linker
probe with independent platform stubs and no SDK inputs. Neither is a fresh
machine installation test. Release qualification will record the exact LLVM
version, runtime build inputs, package tags, native artifacts and test results.
Run `node scripts/qualify-native-consumers.mjs --local-compiler` after packaging
to repeat the prepublication consumer check. Omit `--local-compiler` after the
compiler release asset is public to check every download through HTTPS.

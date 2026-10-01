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

All four real adapters have been built and tested locally. Nine August cases
pass through the installed tool pack with native compilers, Git and SDK paths
unavailable to the test processes. Their `v0.1.1` sources and native archives are
published in separate public repositories. A second check installs the npm CLI
archives into a fresh `node_modules`, downloads each library from GitHub, and
runs its program through LLVM using both URL imports and named package aliases.
All four programs produce the expected results, then run with unchanged frozen
locks offline. Each executable also runs after relocation with its deployment libraries and
notices. Real LibTorch adapter counters verify that a failed class constructor
releases its transferred handle and that an owned function input is released
before an early return reaches its caller. The check supplies only the unpublished
compiler archive locally; it uses real public transport for every library. Compiler release publication
and minimum macOS 14 qualification remain outstanding. CI now runs that consumer
check on a fresh macOS 14 ARM64 runner before the preview is qualified.
The independent native clients run
1,000 cleanup cycles per library. SQLite also checks persistent storage and
rejects SQL attachment/VACUUM INTO before they can expand filesystem authority.

The compiler suite checks owned field transfers, native error dispatch, bounded
direct calls, archive integrity, modified lock metadata and ambiguous physical
symbols. These finite checks do not establish arbitrary foreign-code safety.
LibTorch's collected redistribution notices do not replace an exhaustive upstream
binary SBOM; the qualification research records that gap.

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

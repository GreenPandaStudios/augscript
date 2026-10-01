# Native package design examples

This page records design examples from the [LLVM/native architecture plan](native-interop-llvm-plan.md). The four package repositories now exist and their real native adapters pass local LLVM qualification. Read [native packages](native-packages.md) for the implemented profile. The examples below include future binding-generation and library-output commands; these remain proposals. Placeholder digests and sizes are illustrative.

The implemented packages use LibTorch **2.14.1**, SQLite **3.53.4**, zlib **1.3.2**, and Rust `blake3` **1.8.7**, with LLVM **23.1.2**. Their public native archives have passed installed-CLI checks locally and on a macOS 14 ARM64 CI runner. Compiler publication and broader LLVM parity are still pending; the [implementation record](native-implementation.md) tracks those limits. Complete source/spec examples are available for [PyTorch](examples/native-pytorch/index.md), [SQLite](examples/native-sqlite/index.md), [zlib](examples/native-zlib/index.md), and [BLAKE3](examples/native-blake3/index.md).

## Shared repository and artifact convention

Use the existing source-package layout with one additional binding descriptor. A consumer imports `src/export.aug`, not the native build directory:

```text
aug-LIBRARY/
  aug-package.json
  native.abi.json
  src/
    export.aug
    bindings.aug           # foreign declarations and resource identities
    api.aug                # safe August API and same-file tests
    contracts.aug          # errors/capabilities where needed
    *.aug.md               # compiler-produced explanations
  native/
    include/aug_LIBRARY.h
    src/adapter.c|cpp|rs
    tests/                 # independently authored native clients
    build.json             # explicit maintainer recipe and locked inputs
    sources.lock.json
    Cargo.toml/Cargo.lock  # Rust adapter only
    rust-toolchain.toml    # Rust adapter only
  examples/smoke/
    main.aug
    main.yaml
  .github/workflows/release.yml
  README.md
  LICENSE
  THIRD_PARTY_NOTICES.md
  AGENTS.md
```

Native artifacts are GitHub Release assets, not Git-tracked binaries or `node_modules` installs. For milestone 1, use dynamic adapter libraries and a dynamic prebuilt August runtime on macOS; statically embed small upstream C/Rust implementations inside their adapters where appropriate. This keeps platform OS imports inside binaries produced by maintainers and limits consumer linker inputs. Later static app linking can be qualified separately. LibTorch remains a tested dynamic dependency closure.

An artifact contains a library, its runtime dependencies where permitted, an export/symbol manifest, file hashes, licenses/notices, an SBOM, and build provenance. It contains no consumer-executed install script. Public adapter headers and source remain reviewable in the repository. Archive extraction and runtime deployment follow the architecture plan's limits.

### Proposed manifest format 2

This is a complete **shape example**, with placeholders deliberately invalid as publishable hashes. Use the same schema for all four packages. The native metadata records facts that cannot be inferred from ordinary August source:

```json
{
  "format": 2,
  "name": "@greenpandastudios/aug-pytorch",
  "version": "0.1.0",
  "compiler": "LLVM_PREVIEW_VERSION",
  "source": "src",
  "dependencies": {},
  "native": {
    "profile": "aug-native-abi-1",
    "bindings": "native.abi.json",
    "bindingsSha256": "REPLACE_WITH_64_HEX_DIGEST",
    "upstream": {
      "repository": "https://github.com/pytorch/pytorch",
      "version": "2.14.1",
      "sourceRevision": "REPLACE_WITH_VERIFIED_SOURCE_REVISION"
    },
    "artifacts": [
      {
        "id": "cpu-macos-arm64",
        "target": {
          "triple": "aarch64-apple-darwin",
          "os": "macos",
          "arch": "arm64",
          "minimumOS": "14.0",
          "cpuBaseline": "armv8-a",
          "libc": "libSystem",
          "cxxRuntime": "system-libc++",
          "cxxABI": "apple-libc++",
          "features": ["cpu", "float64"]
        },
        "url": "https://github.com/GreenPandaStudios/aug-pytorch/releases/download/v0.1.0/native-cpu-macos-arm64.tar.gz",
        "sha256": "REPLACE_WITH_64_HEX_DIGEST",
        "maximumDownloadBytes": "REPLACE_WITH_MEASURED_INTEGER",
        "maximumUnpackedBytes": "REPLACE_WITH_MEASURED_INTEGER",
        "link": {
          "kind": "dynamic",
          "libraries": ["lib/libaug_torch.1.dylib"]
        },
        "runtime": {
          "files": ["lib/libaug_torch.1.dylib"],
          "closureManifest": "runtime-files.json",
          "relocation": "loader-relative"
        },
        "components": [
          {
            "id": "pytorch/libtorch",
            "version": "2.14.1",
            "compatibilityKey": "libtorch-process-runtime",
            "linkage": "dynamic",
            "required": true
          }
        ],
        "fileManifest": "files.json",
        "provenance": "provenance.json",
        "notices": "THIRD_PARTY_NOTICES.md"
      }
    ],
    "sourceBuild": {
      "recipe": "native/build.json",
      "inputs": "native/sources.lock.json",
      "tools": ["clang++", "cmake", "Apple macOS SDK"],
      "automatic": false
    }
  }
}
```

`runtime-files.json` is generated from the actual artifact inspection; it must list every redistributed dylib, its install name, hash, dependency edges, and OS floor. The example does **not** assume `libaug_torch` is LibTorch's entire closure. OS-provided libraries/frameworks are declared requirements and are not copied from an Apple SDK. Upstream archive digests, build tool versions, C++20 flags, exact feature choices, source inputs, and all transitive license identities belong in `sources.lock.json` and provenance.

Each other package uses the same required target/artifact fields with these substitutions:

| Package metadata | SQLite | zlib | Rust BLAKE3 |
| --- | --- | --- | --- |
| `name` | `@greenpandastudios/aug-sqlite` | `@greenpandastudios/aug-zlib` | `@greenpandastudios/aug-blake3` |
| Upstream source | SQLite 3.53.4 pinned amalgamation archive and upstream digest | `madler/zlib`, tag `v1.3.2`, pinned archive digest | `BLAKE3-team/BLAKE3`, crate `=1.8.7`, exact Cargo.lock |
| Release asset | `native-macos-arm64.tar.gz` in its own `v0.1.0` release | Same convention in its repository | Same convention in its repository |
| Adapter | `lib/libaug_sqlite.1.dylib` | `lib/libaug_zlib.1.dylib` | `lib/libaug_blake3.1.dylib` |
| Native components | SQLite version, compile options, serialized thread configuration | zlib version/configuration, embedded static linkage | Rust crate graph and licenses, Rust compiler version, `std`/`pure` features, `panic=unwind` |
| C++ requirement | none | none | none; Rust std's native/runtime requirements still declared |
| Maintainer tools | C compiler and licensed platform SDK | C compiler and licensed platform SDK | pinned Rust/Cargo and licensed platform linker/SDK inputs |

The Rust `pure` feature is explicitly an upstream testing feature with no stable-feature promise. Pin and qualify it; do not advertise it as a generally stable configuration or a performance result. Alternatively a later release can use the crate's default SIMD configuration while still exposing a Rust C-ABI adapter, provided its actual C/Rust build inputs are disclosed. [Tagged BLAKE3 features/build](https://github.com/BLAKE3-team/BLAKE3/blob/1.8.7/Cargo.toml).

### Proposed lock extension

This fragment illustrates the additional information, not a hand-authored lock. The existing source commit/digest/graph remains part of the full lock:

```json
{
  "format": 2,
  "compiler": "LLVM_PREVIEW_VERSION",
  "native": {
    "targets": {
      "aarch64-apple-darwin/macos14": {
        "runtime": {
          "abi": "compiler-private-runtime-v1",
          "version": "LLVM_PREVIEW_VERSION",
          "sha256": "REPLACE_WITH_RUNTIME_DIGEST"
        },
        "packages": [
          {
            "sourcePackage": "@greenpandastudios/aug-pytorch@0.1.0",
            "sourceCommit": "REPLACE_WITH_LOCKED_COMMIT",
            "contractSha256": "REPLACE_WITH_BINDING_DIGEST",
            "artifact": "cpu-macos-arm64",
            "artifactSha256": "REPLACE_WITH_ARCHIVE_DIGEST",
            "upstreamVersions": {"pytorch/libtorch": "2.14.1"},
            "dependencies": ["pytorch/libtorch@2.14.1"],
            "linkage": "dynamic"
          }
        ]
      }
    },
    "hostTools": {
      "darwin-arm64": {
        "driverVersion": "LLVM_PREVIEW_VERSION",
        "llvmVersion": "23.1.2",
        "sha256": "REPLACE_WITH_HOST_TOOL_DIGEST"
      }
    }
  }
}
```

The implementation must also retain URLs, full target/ABI constraints, closure/file hashes, source input identities, resolved component edges, and exact build/link evidence. An unrecorded target requires explicit lock expansion; frozen installs cannot invent it.

## Binding profile and native header

Use fixed-width C parameters and out-pointers. This **proposed header convention** avoids passing runtime structs across the interface. All pointer/length pairs state ownership and permitted lifetime in `native.abi.json`:

```c
#include <stdint.h>

typedef struct aug_native_error_v1 {
    uint32_t code;
    uint32_t message_length;
    char message[512];
} aug_native_error_v1;

/* code 0 is success. Output pointers are null/zero on failure.
   Error messages are bounded UTF-8; no exception crosses this ABI. */
```

The struct is passed only through a pointer. Headers/probes verify its alignment, size, offsets, and truncation behavior per target. Count conversion must reject overflows before dereference/allocation. The adapter creates no managed August values and assumes no August runtime entry. Every package uses symbol prefixes and ABI version suffixes; its qualified export list rejects accidental C++/Rust implementation exports.

The new source form **`extern C resource NAME`** declares an opaque external resource, not a class. It has no accessible pointer or public constructor and must be acquired/owned through a checked native binding. Its release identity is mandatory in the descriptor. Public operations may be ordinary August functions; no marker class/interface is required solely to wrap an opaque C object. Behavioral August adapters still use ordinary interfaces/classes.

Marshalled `extern C` declarations below are **typed August views of descriptor-checked adapters**. Their logical list/string/resource types are converted to the actual C signature. They are not claims that C accepts an August List or checked exception. A descriptor explicitly maps each source declaration to a native symbol, conversion, output parameter, error status, and release function. Unmatched declarations and unsupported marshalling fail checking. Raw calls still require `unsafe` inside the library.

## Package 1: CPU PyTorch through LibTorch

Repository: **`GreenPandaStudios/aug-pytorch`**. Use the common layout with `native/src/adapter.cpp`, a pinned LibTorch download in `sources.lock.json`, and a CMake build that uses the selected distribution's configuration/flags and C++20. `native/tests/tensor.cpp` and the consumer test independently verify the values and ownership.

### Native implementation seam

The initial C ABI is a bounded tensor API:

```c
typedef struct aug_torch_tensor_v1 aug_torch_tensor_v1;

int32_t aug_torch_tensor_from_f64_v1(
    const double *values, uint64_t count,
    aug_torch_tensor_v1 **out, aug_native_error_v1 *error);
int32_t aug_torch_tensor_add_v1(
    const aug_torch_tensor_v1 *left,
    const aug_torch_tensor_v1 *right,
    aug_torch_tensor_v1 **out, aug_native_error_v1 *error);
int32_t aug_torch_tensor_sum_v1(
    const aug_torch_tensor_v1 *tensor,
    double *out, aug_native_error_v1 *error);
int32_t aug_torch_tensor_values_v1(
    const aug_torch_tensor_v1 *tensor,
    double **out, uint64_t *count, aug_native_error_v1 *error);
void aug_torch_values_release_v1(double *values);
void aug_torch_tensor_release_v1(aug_torch_tensor_v1 *tensor);
```

Each fallible export is implemented in C++ with `noexcept` and catches native exceptions. An opaque handle owns a real LibTorch tensor. Creation explicitly chooses CPU/float64 and copies the input into owned storage, for example by cloning a validated `from_blob` tensor. Addition and sum call LibTorch operations; `values` copies its result into adapter-owned storage. Release destroys the C++ tensor wrapper; the output array uses its own matching release export. No view outlives the input list and no GPU is selected implicitly.

Prefer LibTorch's supported stable tensor/operator API where the pinned version covers these operations, but pair the adapter with the exact qualified distribution in either case. A smaller upstream stable ABI is useful; it does not justify claiming the entire PyTorch API is binary-compatible. [LibTorch stable API scope](https://docs.pytorch.org/docs/main/notes/libtorch_stable_abi.html).

### August source

Proposed `src/bindings.aug` declares the public opaque resource:

```text
extern C resource Tensor
```

The private foreign calls live in `api.aug` alongside their safe callers. August does not allow importing another file's `_` declarations. The descriptor declares these operations logically pure (apart from internal allocation), call-duration reads, and blocking native work with no August callback. Those are audited author assertions. CPU LibTorch may use its own worker threads; those workers cannot enter the August runtime.

Proposed `src/contracts.aug` uses existing syntax:

```text
TensorError(int code, string message) implements Error:
    pass
```

Proposed `src/api.aug`, with imports kept local:

```text
import Tensor from bindings
import TensorError from contracts

extern C _tensor(List<float> values) returns own Tensor unless TensorError
extern C _add(Tensor left, Tensor right) returns own Tensor unless TensorError
extern C _sum(Tensor tensor) returns float unless TensorError
extern C _values(Tensor tensor) returns List<float> unless TensorError

tensor(List<float> values) returns own Tensor unless TensorError:
    unsafe:
        return _tensor(values)

add(Tensor left, Tensor right) returns own Tensor unless TensorError:
    unsafe:
        return _add(left, right)

sum(Tensor tensor) returns float unless TensorError:
    unsafe:
        return _sum(tensor)

values(Tensor tensor) returns List<float> unless TensorError:
    unsafe:
        return _values(tensor)
```

The explicit own returns are necessary choices. Ordinary executable result/error inference still works where omitted; foreign declarations must retain checked contracts. Compiler/spec output explains effective contracts regardless of written inference clauses. The normal same-name call shorthand above already exists.

`src/export.aug` keeps the package narrow:

```text
export Tensor from bindings
export TensorError from contracts
export tensor from api
export add from api
export sum from api
export values from api
```

One descriptor entry demonstrates the **proposed** physical/logical mapping. The actual file includes every function and resolved declaration identity, plus target header/layout probes:

```json
{
  "format": 1,
  "profile": "aug-native-abi-1",
  "resources": {
    "Tensor": {
      "declaration": "bindings.Tensor",
      "provider": "@greenpandastudios/aug-pytorch:Tensor/v1",
      "representation": "opaque-pointer",
      "release": "aug_torch_tensor_release_v1",
      "releaseCanFail": false,
      "thread": "runtime-owner"
    }
  },
  "functions": {
    "api._tensor": {
      "symbol": "aug_torch_tensor_from_f64_v1",
      "callingConvention": "C",
      "physicalParameters": ["ptr<f64>", "u64", "out<Tensor*>", "out<error-v1>"],
      "physicalResult": "i32",
      "input": {
        "values": {"marshal": "copy-list-f64", "data": 0, "length": 1}
      },
      "result": {"marshal": "owned-resource", "type": "Tensor", "out": 2},
      "failure": {"success": 0, "errorOut": 3, "type": "contracts.TensorError"},
      "effects": {"pure": true, "changes": [], "uses": []},
      "execution": {"blocking": true, "callbacks": false, "threads": "native-internal-only"}
    }
  }
}
```

`copy-list-f64` is a closed compiler-supported conversion recipe, not package JavaScript. It validates sizes, creates contiguous doubles, calls once, and releases temporary storage on every result path. The values output recipe copies a native double array into an August List then calls `aug_torch_values_release_v1`, including if the conversion fails. Metadata never receives permission to run arbitrary generated code during installation.

### Consumer program

Direct repository import, proposed `tensor-demo/main.aug`:

```text
import Tensor and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.0"

own Tensor left = tensor(values=[1.0, 2.0, 3.0])
own Tensor right = tensor(values=[4.0, 5.0, 6.0])
own Tensor result = add(left, right)
items = values(tensor=result)

assert(items.length() == 3)
assert(items.get(index=0) == 5.0)
assert(items.get(index=1) == 7.0)
assert(items.get(index=2) == 9.0)
assert(sum(tensor=result) == 21.0)
print(value="LibTorch: [5, 7, 9], sum 21")
```

The existing exact-name shorthand binds `left` and `right` to those parameter labels. Owned handles are released at exit or earlier failure. This verifies a real tensor operation and a copy out of native tensor storage; it does not call Python.

Existing command shapes, after a future release supplies this package/backend:

```sh
aug init tensor-demo
cd tensor-demo
# Replace main.aug with the proposed program above.
aug run --backend llvm
aug install --frozen
aug run --backend llvm --offline
```

`--backend llvm` is proposed. Direct import resolution and frozen/offline command shapes are existing features. The acceptance run saves the lock and verifies the artifact reported by the LLVM build.

## Package 2: SQLite

Repository: **`GreenPandaStudios/aug-sqlite`**. Use `native/src/adapter.c`, the pinned amalgamation, declared compile/thread options, and no dynamically loaded SQLite extensions. Build the selected SQLite into the adapter rather than using the host OS's different SQLite version. Independent C tests verify the SQL and failure paths.

### Native implementation seam

```c
typedef struct aug_sqlite_database_v1 aug_sqlite_database_v1;

int32_t aug_sqlite_open_v1(
    const uint8_t *path, uint64_t path_length,
    aug_sqlite_database_v1 **out, aug_native_error_v1 *error);
int32_t aug_sqlite_execute_v1(
    aug_sqlite_database_v1 *database,
    const uint8_t *sql, uint64_t sql_length,
    const uint8_t *const *arguments, const uint64_t *lengths,
    uint64_t argument_count, aug_native_error_v1 *error);
int32_t aug_sqlite_query_text_v1(
    aug_sqlite_database_v1 *database,
    const uint8_t *sql, uint64_t sql_length,
    const uint8_t *const *arguments, const uint64_t *lengths,
    uint64_t argument_count,
    uint8_t **out, uint64_t *out_length, aug_native_error_v1 *error);
void aug_sqlite_text_release_v1(uint8_t *text);
void aug_sqlite_database_release_v1(aug_sqlite_database_v1 *database);
```

The wrapper calls real `sqlite3_open_v2`, `sqlite3_prepare_v2`, parameter binding, `sqlite3_step`, column extraction, `sqlite3_finalize`, and connection close. Use `SQLITE_TRANSIENT` for text bindings. Copy the returned text before advancing or finalizing. A failed open can still allocate a SQLite connection, so clean it up. Finalize each statement before returning, preserving its execution/finalize error before publishing a successful result. `queryText` requires exactly one non-null text value; no row, null, extra rows, or wrong shape yields `DatabaseError` in this deliberately small API. [SQLite binding/column lifetimes](https://www.sqlite.org/c3ref/bind_blob.html), [SQLite column API](https://www.sqlite.org/c3ref/column_blob.html).

No statement escapes these operations. The release contract finalizes no user-visible live children, performs **no implicit commit**, and releases the acquired connection through the selected tested close policy. Checked transaction/flush/close APIs precede exposing more complex transaction state. A later prepared-statement resource needs an owner/child lifetime contract, not a borrowed pointer disguised as an independent database.

Direct C binding is also checked: generate the physical declarations from the selected SQLite header, and expose a small readonly version query mapped directly to `sqlite3_libversion_number` with its C-int return width. Include that upstream symbol in the qualified artifact export list or a separately declared SQLite library. Its native probe verifies the selected upstream version. This demonstrates direct C lowering as well as the higher-level adapter.

### August source

Proposed `src/bindings.aug`:

```text
extern C resource Database

DatabaseError(int code, string message) implements Error:
    pass
```

Proposed `src/contracts.aug` imports the resource and error. Keeping the resource in a file that does not import this capability prevents an import cycle:

```text
import Database and DatabaseError from bindings
capability Databases:
    open(string path) returns own Database uses Databases.open unless DatabaseError
```

Proposed `src/api.aug` contains the private foreign declarations and safe wrappers together:

```text
import Database and DatabaseError from bindings
import Databases from contracts

extern C _open(string path) returns own Database uses Databases.open unless DatabaseError
extern C _execute(borrow Database database, string sql, List<string> arguments) changes database unless DatabaseError
extern C _queryText(borrow Database database, string sql, List<string> arguments) returns string changes database unless DatabaseError

NativeDatabases() implements Databases:
    open(string path) returns own Database:
        unsafe:
            return _open(path)

execute(borrow Database database, string sql, List<string> arguments):
    unsafe:
        _execute(database, sql, arguments)

queryText(borrow Database database, string sql, List<string> arguments):
    unsafe:
        return _queryText(database, sql, arguments)
```

The descriptor resolves `api._open`, `api._execute`, and `api._queryText`. These native contracts explicitly grant and describe access. Querying changes connection/statement state even when it does not change table rows. Metadata maps string lists to bounded pointer/length arrays, assigns each result allocator, and names database cleanup. Implementations infer their effects and errors from the checked calls.

Public exports:

```text
export Database from bindings
export DatabaseError from bindings
export Databases from contracts
export NativeDatabases from api
export execute from api
export queryText from api
```

### Consumer program

Alias workflow uses existing commands:

```sh
aug init database-demo
cd database-demo
aug add https://github.com/GreenPandaStudios/aug-sqlite#v0.1.0 --as sqlite
```

Proposed `main.aug` after replacing the starter:

```text
import Database and Databases and NativeDatabases and execute and queryText from sqlite

implement Databases with NativeDatabases
resolve Databases to databases
own Database database = databases.open(path=":memory:")

borrow database:
    execute(database, sql="CREATE TABLE people(id INTEGER PRIMARY KEY, name TEXT NOT NULL)", arguments=[])
    execute(database, sql="INSERT INTO people(id, name) VALUES(1, ?)", arguments=["August"])
    name = queryText(database, sql="SELECT name FROM people WHERE id = 1", arguments=[])
    assert(name == "August")

print(value="SQLite: August")
```

This creates a real in-memory SQLite database, table, inserted row, and query. A separate acceptance program uses a temporary file, closes the first connection, opens another, and verifies persistence; memory-only evidence is insufficient for the file-backed contract. All operations are real SQLite calls. A repository-literal variant replaces `from sqlite` with `from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.0"` and removes the unused alias configuration.

```sh
aug run --backend llvm
aug build --backend llvm --bundle deployment
```

Both flags are proposed. The ordinary `main.yaml` alias written by `aug add` remains unchanged in shape.

## Package 3: zlib

Repository: **`GreenPandaStudios/aug-zlib`**. Use the common layout with `native/src/adapter.c`, exact zlib source/configuration, and a C build. `src/api.aug` contains private foreign declarations and safe functions **in the same file**. `src/contracts.aug` contains `CompressionError`.

### Native implementation seam

```c
int32_t aug_zlib_compress_v1(
    const uint8_t *input, uint64_t input_length, int32_t level,
    uint8_t **out, uint64_t *out_length, aug_native_error_v1 *error);
int32_t aug_zlib_decompress_v1(
    const uint8_t *input, uint64_t input_length, uint64_t limit,
    uint8_t **out, uint64_t *out_length, aug_native_error_v1 *error);
void aug_zlib_bytes_release_v1(uint8_t *bytes);
```

Compression calls zlib, with checked conversions to the upstream width and `compressBound` allocation. Decompression enforces the caller's output limit and rejects invalid/truncated/trailing input according to a stated single-stream policy. If implemented with inflate internally, `inflateEnd` runs on every initialized path. Error results publish no output allocation; successful output is copied into August Bytes, then freed through the adapter. The limit is a resource policy, not a guessed decompressed size. [Pinned zlib API](https://github.com/madler/zlib/blob/v1.3.2/zlib.h).

Proposed `src/api.aug`:

```text
import CompressionError from contracts

extern C _compress(Bytes input, int level) returns Bytes unless CompressionError
extern C _decompress(Bytes input, int limit) returns Bytes unless CompressionError

compress(Bytes input, int level):
    unsafe:
        return _compress(input, level)

decompress(Bytes input, int limit):
    unsafe:
        return _decompress(input, limit)
```

The descriptor validates level 0–9 and positive bounded output limits before converting native widths, permits only call-duration immutable input reads, and maps nonzero zlib statuses to `CompressionError`. Author-facing source/native metadata makes these constraints discoverable. `src/export.aug` exports `compress`, `decompress`, and `CompressionError`, excluding the raw calls.

### Consumer program

Proposed `compression-demo/main.aug`:

```text
import compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.0"

input = "August: apples, pears, and π".bytes()
compressed = compress(input, level=6)
restored = decompress(input=compressed, limit=4096)

assert(restored.length() == input.length())
assert(restored.base64url() == input.base64url())
print(value="zlib: round trip verified")
```

Comparing base64url compares full byte content using an existing builtin; it does not depend on reference equality. No assertion requires compressed short input to be smaller. The integration suite additionally round-trips NUL/high-byte buffers, empty input, repeated data, and corrupted/truncated streams through native fixture inputs and the real adapter. Do not treat text-only output as binary correctness coverage.

```sh
aug init compression-demo
cd compression-demo
# Replace main.aug with the proposed program.
aug run --backend llvm
```

The alias alternative is `aug add https://github.com/GreenPandaStudios/aug-zlib#v0.1.0 --as zlib`, followed by `import compress and decompress from zlib`.

## Package 4: Rust BLAKE3

Repository: **`GreenPandaStudios/aug-blake3`**. The native directory is a Rust adapter crate with a committed lock/toolchain file. This is wrapping a crate that does not itself promise the desired foreign interface; consuming an already C-compatible Rust library would instead import its verified header/contract directly.

Proposed `native/Cargo.toml`:

```toml
[package]
name = "aug-blake3-native"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
blake3 = { version = "=1.8.7", default-features = false, features = ["std", "pure"] }

[profile.release]
panic = "unwind"
```

The release recipe commits an exact `rust-toolchain.toml` chosen and tested during artifact construction; this research did not qualify a Rust compiler version. Set `MACOSX_DEPLOYMENT_TARGET=14.0` in the builder. Use `cargo build --locked`, then offline reproduction with cached declared inputs. Record Rust's version, crate versions/features, native dependencies, and any actual build scripts in provenance. Cargo execution occurs in author CI or an explicitly selected source build, not a consumer `aug install`.

### Native export interface

```c
int32_t aug_blake3_digest_hex_v1(
    const uint8_t *input, uint64_t input_length,
    uint8_t **out, uint64_t *out_length, aug_native_error_v1 *error);
void aug_blake3_text_release_v1(uint8_t *text, uint64_t length);
```

The Rust export uses `#[unsafe(no_mangle)] pub extern "C" fn ...`, validates pointers/lengths, and encloses real `blake3::hash(input).to_hex()` work in `catch_unwind`. Zero-length input uses an empty slice without making a null Rust slice. Nonzero lengths must fit `isize::MAX` and the target allocation rules; Rust references/layout do not cross the interface.

Return the 64 ASCII bytes as a Rust-allocated boxed byte slice. The matching release reconstructs that exact boxed slice using the recorded pointer and length; August copies it before release. Do not reconstruct an arbitrary Vec with a guessed capacity. On failure, output stays null/zero and a bounded error is supplied. A destructor for bytes is infallible; panic payload disposal and error reporting must not introduce another unwind across the C export. OOM/abort panics remain process failures, not a guaranteed `DigestError` recovery.

The one-shot API exercises Rust execution, panic strategy, a call-duration byte loan, Rust allocation transfer, and Rust deallocation. A later streaming Hasher resource can test `Box<Hasher>` ownership and poisoned-state policy, but is not needed to make this initial package useful.

Proposed `src/api.aug`:

```text
import DigestError from contracts

extern C _digestHex(Bytes input) returns string unless DigestError

digestHex(Bytes input):
    unsafe:
        return _digestHex(input)
```

The descriptor specifies a Rust-owned UTF-8/ASCII output slice and `aug_blake3_text_release_v1`, with panic status mapped to `DigestError`. `src/export.aug` exports `digestHex` and `DigestError`. No Crypto capability is required for deterministic hashing; this API provides no randomness or secret-key operation.

### Consumer program

Proposed `digest-demo/main.aug`:

```text
import digestHex from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.0"

actual = digestHex(input="".bytes())
expected = "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262"
assert(actual == expected)
print(value="Rust BLAKE3: digest verified")
```

Use the pinned upstream test vectors for the acceptance suite and add nonempty inputs, rather than an oracle calculated by the same adapter under test. The exact empty-input vector above must be checked against that pinned fixture when the repository is created. [Upstream vectors](https://github.com/BLAKE3-team/BLAKE3/blob/1.8.7/test_vectors/test_vectors.json).

```sh
aug init digest-demo
cd digest-demo
# Replace main.aug with the proposed program.
aug run --backend llvm
```

The alias alternative is `aug add https://github.com/GreenPandaStudios/aug-blake3#v0.1.0 --as blake3`, then `import digestHex from blake3`.

## Author build and publish workflow

These are **proposed contributor commands**, not commands available in the published CLI. Native tools are expected on the maintainer machine. Example for the PyTorch repository; apply the same sequence to the other three with their headers/recipes:

```sh
aug package init aug-pytorch --name @greenpandastudios/aug-pytorch
cd aug-pytorch
# Add the planned sources, descriptor, wrapper, recipe and tests.
aug bind header native/include/aug_torch.h --target aarch64-apple-darwin --output native.abi.json
aug package native build --target aarch64-apple-darwin
aug package native verify --target aarch64-apple-darwin
aug check
aug test --backend llvm
aug spec
aug spec --check
```

`aug package init DIRECTORY --name NAME` is already implemented; `bind`, `package native`, and backend options are new proposals. `native verify` checks headers/layout, expected exports, artifact requirements, and independent test results. Any test that executes a library is an explicit verification command, not installation work.

After candidate artifacts pass, compute hashes and record metadata in release commit P while preserving the native source inputs built from S. Native provenance records S and the input subset digest. Publish `v0.1.0` in the **separate package repository**, attach the hash-matched native assets/notices/SBOM/provenance, and verify public installs of that exact tag. Changing the wrapper or upstream dependency creates a new package tag/artifact; never replace a released archive in place.

CI should run independent native tests on author toolchains, then the **installed August CLI** against the just-published candidate source/artifact in a consumer environment with no native toolchain. It checks direct URL and alias imports, exact lock restoration, actual computation, errors, resource release, and a moved deployment bundle. Compiler-owned runtime/tool artifacts must already be available before that package claims support for a compiler preview.

### Consuming without build tools

Once the planned preview is published, a consumer installs the CLI, adds a repository URL or uses one directly, and runs the program. No compiler checkout is needed:

```sh
npm install --global @greenpandastudios/aug-cli@LLVM_PREVIEW_VERSION
aug init tensor-demo
cd tensor-demo
aug add https://github.com/GreenPandaStudios/aug-pytorch#v0.1.0 --as pytorch
# Write the sample with `from pytorch`.
aug run --backend llvm
aug install --frozen
aug build --backend llvm --bundle deployment
```

The version and flags are proposals. Keep Node/npm as prerequisites; automatically obtain the compiler-owned LLVM/linker/runtime and the package's correct prebuilt artifacts. Commit the source lock. For a second target, explicitly add its selection with proposed `aug install --target TARGET`, then use frozen installation in CI. An optional source-build command reports required tools and never acts as an invisible fallback.

## Expected failure diagnostics

Codes and exact wording here are proposed. Each diagnostic is structured for the editor/agents as well as readable in the terminal:

| Failure | Proposed diagnostic and response |
| --- | --- |
| macOS too old | `NATIVE_TARGET: aug-pytorch requires macOS 14.0+ arm64; this host is macOS 13.6 arm64. Supported artifact: cpu-macos-arm64. Use a supported target; August did not start a source build.` |
| Wrong architecture/libc | `NATIVE_TARGET: requested aarch64-unknown-linux-musl, but this artifact is x86_64-unknown-linux-gnu with the declared glibc floor. No compatible prebuilt artifact is published.` |
| Missing asset | `NATIVE_ARTIFACT: aug-zlib@0.1.0 declares native-macos-arm64.tar.gz, but it could not be obtained at the locked URL. Retry if the release is still publishing, or select a published package version. The lock was preserved.` |
| Corrupt/changed bytes | `NATIVE_INTEGRITY: downloaded artifact SHA-256 differs from aug.lock.json. Rejected before extraction. Restore the expected release or choose a new version explicitly.` |
| Offline miss | `NATIVE_OFFLINE: the locked LibTorch artifact is not cached for this target. Run aug install --frozen online to prepare it, then retry --offline.` |
| Lock lacks target | `PACKAGE_TARGET: the frozen lock has no native selection for this target. Add it explicitly with aug install --target TARGET, review the lock, then retry frozen installation.` |
| Header/ABI mismatch | `NATIVE_ABI: api._tensor expects the recorded physical signature/layout, but the artifact contract differs. Rebuild the package adapter and descriptor together.` |
| Missing dylib at deployment | `NATIVE_LOAD: the deployment requires libtorch_cpu at its declared relative path; the bundle is incomplete. Deploy the complete aug build --bundle directory.` |
| Unsupported pointer/callback | `FFI_PROFILE: this declaration retains an input pointer or callback beyond the call. aug-native-abi-1 supports call-duration loans only; use a copied-input adapter or a separately supported lifetime profile.` |
| Ownership misuse | `OWNERSHIP: Tensor result was moved or released here and is used again here.` Both locations are reported. |
| LLVM feature not ported | `BACKEND_UNSUPPORTED: this checked August construct has not been lowered by the LLVM preview. The source location and profile are reported; no C fallback occurred.` |
| Source build requested without tools | `NATIVE_SOURCE_BUILD: this explicitly selected recipe needs clang++/CMake and a licensed macOS SDK. Install the maintainer prerequisites or use a supported prebuilt artifact.` |

Native computation errors remain ordinary checked August errors, such as `TensorError`, `DatabaseError`, `CompressionError`, and `DigestError`. Their messages contain copied bounded native details, rather than unstable pointers or C++/Rust stack unwinding. Application tests catch those failures using existing `try`/`catch`, and resource cleanup remains guaranteed on the supported paths.

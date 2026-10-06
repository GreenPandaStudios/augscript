[//]: # (Generated from src/library-catalog.ts and native/library-catalog.json.)
# Find a library

Search by the task you need to perform: SQL, compression, JSON, hashing or tensors. The curated catalog includes bundled modules and ordinary repository packages. Native entries refer to published preview source tags and their declared artifact pins.

**Unreleased CLI command:**

```sh
aug libraries sql
aug libraries compression
aug libraries tensors --json
```

Search works offline and writes nothing. The results explain imports, ownership, requirements, license notes and tests. JSON also includes source commits and native artifact checksums. A catalog entry does not install a package or verify downloaded bytes; `aug add` performs normal dependency resolution and integrity checks.

| Library | Task | Access |
| --- | --- | --- |
| [BLAKE3](#blake3) | Hash bytes with the Rust BLAKE3 implementation. | Repository package |
| [Bounded ranges](#collections) | Construct half-open integer ranges with checked steps and size limits. | Bundled with this compiler |
| [Cryptography and JWT](#crypto) | Random bytes, digests, key operations and checked JWT helpers. | Repository package |
| [Typed error context](#errors) | Retain a concrete error cause with an operation name and source location. | Bundled with this compiler |
| [Metal GPU operations](#gpu) | Upload float32 vectors, add them on a Metal GPU and copy results back. | Repository package |
| [Console, files and arguments](#io) | Explicit console, file and command-line capabilities. | Bundled with this compiler |
| [JSON](#json) | Parse JSON with strict or bounded ingestion-compatible number handling. | Repository package |
| [Checked integers and decimals](#math) | Checked int64 arithmetic and exact bounded fixed-scale decimals. | Bundled with this compiler |
| [Expiring in-memory stores](#memory) | Bounded generic in-memory stores with explicit expiry. | Repository package |
| [PostgreSQL](#postgres) | PostgreSQL connections, bounded queries and copied result access through libpq. | Repository package |
| [PyTorch / LibTorch](#pytorch) | Create CPU float64 tensors, add them, and read sums or values. | Repository package |
| [SQLite](#sqlite) | Embedded SQL databases with bound parameters and scalar queries. | Repository package |
| [Clock](#time) | Read wall-clock time through a replaceable capability. | Repository package |
| [Validated domain values](#values) | Calendar dates, exact durations, identifiers, HTTP URLs, portable paths and bounded UTF-8 text. | Bundled with this compiler |
| [HTTP client and web helpers](#web) | HTTP capabilities, redirects, cookies and server controls. | Repository package |
| [zlib](#zlib) | Compress bytes and decompress within an explicit output limit. | Repository package |

Native host constraints below come from each tagged manifest. They describe available selections, while the linked tests and qualification guides describe behavior evidence. Keep each artifact’s notices when redistributing an application. The import blocks below are fragments. Follow the linked examples for complete programs and read the package’s public API for each call contract.

## BLAKE3 {#blake3}

Hash bytes with the Rust BLAKE3 implementation.

A digest function, with no password hashing or signing API.

Source: [0.1.5](https://github.com/GreenPandaStudios/aug-blake3/tree/v0.1.5).

```sh
aug add "https://github.com/GreenPandaStudios/aug-blake3#v0.1.5" --as blake3
```

```text
import HashError and hash from blake3
```

Managed Bytes input and copied digest text; no opaque resource is retained.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-unknown-linux-gnu` | glibc 2.36+; armv8-a |
| `x86_64-unknown-linux-gnu` | glibc 2.36+; x86-64 |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a |

BLAKE3/Rust components: MIT or Apache-2.0; see the retained crate notices. August adapter: MIT. [License details](https://github.com/GreenPandaStudios/aug-blake3/blob/v0.1.5/THIRD_PARTY_NOTICES.md).

Verify the independently published abc digest against the real Rust library. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/native-blake3/hashing).

## Bounded ranges {#collections}

Construct half-open integer ranges with checked steps and size limits.

Set an allocation limit appropriate to the operation; the default is one million values.

Import `august.collections` from the compiler’s core library. These additions are unreleased.

```text
import range and RangeError from august.collections
```

A fresh managed List<int>; request bounded exclusive mutation with borrow.

Declared compiler requirement: `1.0.0`.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

Ascending, descending, empty, invalid-step and boundary tests on both native backends. [Read the tests and example](https://greenpandastudios.github.io/augscript/reference#bounded-integer-ranges).

## Cryptography and JWT {#crypto}

Random bytes, digests, key operations and checked JWT helpers.

Bind Crypto explicitly. Select validation policy and trusted issuer/key inputs in application code.

Source: [v0.23.0 source](https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/crypto).

```sh
aug add "https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/crypto" --as crypto
```

```text
import Crypto and GnuTlsCrypto and verifyJwt and signJwt from crypto
```

Managed capability values with bounded key/native operations; checked validation errors remain visible.

This source folder has no declared compiler constraint. Its catalog reference targets August 0.23.0; check it with the compiler used by your project.

MIT bindings; GnuTLS and its dependency closure retain their upstream licenses. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/THIRD_PARTY_NOTICES.md).

The same-app OpenID Connect example verifies real native signatures and session JWT behavior. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/oidc-login/index).

## Typed error context {#errors}

Retain a concrete error cause with an operation name and source location.

Unreleased; use the matching compiler. Capture sourceLocation() at the operation, and choose whether to throw, log or expose context.

Import `august.errors` from the compiler’s core library. These additions are unreleased.

```text
import ContextError and errorContext from august.errors
```

Managed read-only context fields retain the original cause and its ordinary ownership rules.

Declared compiler requirement: `1.0.0`.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

Concrete cause propagation, relative source identities, nested worker errors and package aliases on both backends. [Read the tests and example](https://greenpandastudios.github.io/augscript/guides/add-error-context).

## Metal GPU operations {#gpu}

Upload float32 vectors, add them on a Metal GPU and copy results back.

Apple Silicon with an available Metal GPU. No CUDA artifact or CPU fallback.

Source: [0.1.1](https://github.com/GreenPandaStudios/aug-gpu/tree/v0.1.1).

```sh
aug add "https://github.com/GreenPandaStudios/aug-gpu#v0.1.1" --as gpu
```

```text
import Device and Buffer and GpuError and openDevice and upload and add from gpu
import download from gpu
```

Own devices and buffers on their creating worker. No handles cross workers; downloads copy values into that worker’s heap.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a |

August adapter: MIT. Uses system Metal and Foundation frameworks; they are not redistributed. [License details](https://github.com/GreenPandaStudios/aug-gpu/blob/v0.1.1/THIRD_PARTY_NOTICES.md).

Compare native GPU vector results in isolated workers with independently computed sums. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/native-gpu/compute).

## Console, files and arguments {#io}

Explicit console, file and command-line capabilities.

Implement the capabilities the application needs in main.aug.

Import `august.io` from the compiler’s core library. 

```text
import Console and SystemConsole from august.io
```

Managed capability providers; immutable text and copied file content.

Declared compiler requirement: `1.0.0`.

MIT August source; retain the runtime’s redistribution notices. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/THIRD_PARTY_NOTICES.md).

A greeting project shows explicit console injection and same-file tests. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/hello/index).

## JSON {#json}

Parse JSON with strict or bounded ingestion-compatible number handling.

Choose strict parse or parseCompatible explicitly. Compatibility retains documented depth and Unicode limits.

Source: [v0.23.0 source](https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/json).

```sh
aug add "https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/json" --as json
```

```text
import parse and parseCompatible from json
```

Managed immutable JSON views; extracted text and bytes have checked bounds.

This source folder has no declared compiler constraint. Its catalog reference targets August 0.23.0; check it with the compiler used by your project.

MIT August source; yyjson: MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/THIRD_PARTY_NOTICES.md).

Parser and ingestion profiles include presence, numbers, malformed inputs and bounds. [Read the tests and example](https://github.com/GreenPandaStudios/augscript/blob/main/tests/ingestion-values.test.mjs).

## Checked integers and decimals {#math}

Checked int64 arithmetic and exact bounded fixed-scale decimals.

Decimal scale is 0–18 and coefficients are int64. Inexact arithmetic fails; there is no implicit rounding.

Import `august.math` from the compiler’s core library. These additions are unreleased.

```text
import checkedAdd and Decimal and parseDecimal from august.math
import formatDecimal from august.math
```

Integer values and immutable Decimal records.

Declared compiler requirement: `1.0.0`.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

Independent BigInt comparison grids, boundary cases, parsing and exact arithmetic. [Read the tests and example](https://greenpandastudios.github.io/augscript/reference#checked-mathematics-unreleased).

## Expiring in-memory stores {#memory}

Bounded generic in-memory stores with explicit expiry.

Bind ExpiringStore<T> explicitly. Time is supplied by the caller; each provider stores at most 512 live entries.

Source: [v0.23.0 source](https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/memory).

```sh
aug add "https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/memory" --as memory
```

```text
import ExpiringStore and MemoryStore and StoreFull from memory
```

Managed capability provider with an internally locked table. Stored values satisfy immutable Data.

This source folder has no declared compiler constraint. Its catalog reference targets August 0.23.0; check it with the compiler used by your project.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

The session example supplies expiry times to the bounded store; its login checks exercise the surrounding flow. [Read the tests and example](https://github.com/GreenPandaStudios/augscript/blob/main/tests/oidc-login.test.mjs).

## PostgreSQL {#postgres}

PostgreSQL connections, bounded queries and copied result access through libpq.

A reachable PostgreSQL server and explicit DatabaseStorage provider. Supply deadlines, row limits and copied-result byte limits.

Source: [0.1.0](https://github.com/GreenPandaStudios/aug-postgres/tree/v0.1.0).

```sh
aug add "https://github.com/GreenPandaStudios/aug-postgres#v0.1.0" --as postgres
```

```text
import Pool and Connection and Result and PostgresError from postgres
import DatabaseStorage and NativeDatabaseStorage and acquire from postgres
import query and rows and text from postgres
```

Own pools, connection leases and results on their creating worker. Borrow a lease for a query; scope exit releases native resources and rolls back unfinished transactions.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-unknown-linux-gnu` | glibc 2.36+; armv8-a |
| `x86_64-unknown-linux-gnu` | glibc 2.36+; x86-64 |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a |

August adapter: MIT. libpq: PostgreSQL License. OpenSSL: Apache-2.0. [License details](https://github.com/GreenPandaStudios/aug-postgres/blob/v0.1.0/THIRD_PARTY_NOTICES.md).

Live database tests include bound data, bytea, SQLSTATE, transactions, cancellation and HTTP drain. [Read the tests and example](https://github.com/GreenPandaStudios/aug-postgres/tree/v0.1.0/tests).

## PyTorch / LibTorch {#pytorch}

Create CPU float64 tensors, add them, and read sums or values.

CPU float64 preview. GPU support and the wider PyTorch API are absent. Linux includes its declared C++ runtime; macOS uses system libc++.

Source: [0.1.6](https://github.com/GreenPandaStudios/aug-pytorch/tree/v0.1.6).

```sh
aug add "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.6" --as pytorch
```

```text
import Tensor and TensorError and tensor and add and sum and values from pytorch
```

Own each Tensor. Inputs are borrowed for a call; scope exit releases the LibTorch object, including checked failures.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-unknown-linux-gnu` | glibc 2.36+; armv8-a; bundled-libstdc++ |
| `x86_64-unknown-linux-gnu` | glibc 2.36+; x86-64; bundled-libstdc++ |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a; system-libc++ |

August adapter: MIT. PyTorch: BSD-style plus component licenses. Linux closures include GPL/LGPL runtimes and the GCC Runtime Library Exception. The preview has no exhaustive binary SBOM; retain the full closure notices. [License details](https://github.com/GreenPandaStudios/aug-pytorch/blob/v0.1.6/THIRD_PARTY_NOTICES.md).

Create real LibTorch tensors, add them, and verify their values and sum. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/native-pytorch/tensors).

## SQLite {#sqlite}

Embedded SQL databases with bound parameters and scalar queries.

No separate database server. File-backed databases require an explicit DatabaseStorage provider.

Source: [0.1.5](https://github.com/GreenPandaStudios/aug-sqlite/tree/v0.1.5).

```sh
aug add "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5" --as sqlite
```

```text
import Database and SqliteError and openMemory and execute from sqlite
import queryScalar from sqlite
```

Own Database; borrow it for writes. Scope exit releases the native connection. Query text is copied into August memory.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-unknown-linux-gnu` | glibc 2.36+; armv8-a |
| `x86_64-unknown-linux-gnu` | glibc 2.36+; x86-64 |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a |

SQLite core: public domain. August adapter: MIT. [License details](https://github.com/GreenPandaStudios/aug-sqlite/blob/v0.1.5/THIRD_PARTY_NOTICES.md).

Insert and query a bound value in a real in-memory SQLite database. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/native-sqlite/database).

## Clock {#time}

Read wall-clock time through a replaceable capability.

Bind Clock to SystemClock or a test implementation.

Source: [v0.23.0 source](https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/time).

```sh
aug add "https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/time" --as time
```

```text
import Clock and SystemClock from time
```

Managed clock provider; whole Unix-second results in UTC.

This source folder has no declared compiler constraint. Its catalog reference targets August 0.23.0; check it with the compiler used by your project.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

The LLVM clock consumer binds SystemClock and checks a native wall-clock read. [Read the tests and example](https://github.com/GreenPandaStudios/augscript/blob/main/tests/llvm-backend.test.mjs).

## Validated domain values {#values}

Calendar dates, exact durations, identifiers, HTTP URLs, portable paths and bounded UTF-8 text.

Unreleased; use the matching compiler. Civil dates use years 1–9999, durations exact int64 milliseconds, URLs an ASCII DNS-host profile, and paths a lexical portable-relative profile. Text limits measure bytes.

Import `august.values` from the compiler’s core library. These additions are unreleased.

```text
import CivilDate and Duration and TokenId and HttpUrl from august.values
import PortableRelativePath and BoundedText from august.values
```

Deeply immutable records; constructors, copies and JSON decoding enforce the same invariants.

Declared compiler requirement: `1.0.0`.

MIT. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/LICENSE).

Independent calendar/int64 vectors, parser caps, original text, copy/JSON validation and malformed native UTF-8 on both backends. [Read the tests and example](https://greenpandastudios.github.io/augscript/guides/use-domain-values).

## HTTP client and web helpers {#web}

HTTP capabilities, redirects, cookies and server controls.

Endpoints and server-rendered HTML are language features. Import this package for its helper/client capabilities.

Source: [v0.23.0 source](https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/web).

```sh
aug add "https://github.com/GreenPandaStudios/augscript/tree/v0.23.0/src/stdlib/web" --as web
```

```text
import HttpClient and WebHttpClient from web
```

Managed capability providers and checked request/response values.

This source folder has no declared compiler constraint. Its catalog reference targets August 0.23.0; check it with the compiler used by your project.

MIT bindings; native HTTP/TLS closure notices apply. [License details](https://github.com/GreenPandaStudios/augscript/blob/v0.23.0/THIRD_PARTY_NOTICES.md).

The complete login example exercises the native HTTP pipeline and checked protocol helpers. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/oidc-login/index).

## zlib {#zlib}

Compress bytes and decompress within an explicit output limit.

Choose maximumOutput explicitly when decompressing.

Source: [0.1.5](https://github.com/GreenPandaStudios/aug-zlib/tree/v0.1.5).

```sh
aug add "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5" --as zlib
```

```text
import CompressionError and compress and decompress from zlib
```

Managed Bytes inputs and copied Bytes results; the adapter releases temporary native buffers.

Declared compiler requirement: `0.23.0`.

| Host | Runtime requirement |
| --- | --- |
| `aarch64-unknown-linux-gnu` | glibc 2.36+; armv8-a |
| `x86_64-unknown-linux-gnu` | glibc 2.36+; x86-64 |
| `aarch64-apple-darwin` | macOS 14.0+; armv8-a |

zlib: Zlib license. August adapter: MIT. [License details](https://github.com/GreenPandaStudios/aug-zlib/blob/v0.1.5/THIRD_PARTY_NOTICES.md).

Compress and restore UTF-8 bytes with real zlib; verify the round trip. [Read the tests and example](https://greenpandastudios.github.io/augscript/examples/native-zlib/compression).

## Use another repository

The catalog is not a package registry. Your own library needs a narrow `export.aug` and may supply an August manifest for native artifacts and compatibility requirements. Share its repository URL or tag, then use the same `aug add` and import workflow. See [packages](packages.md) and [native bindings](native-packages.md).

---
generated: true
source: examples/native-*
editLink: false
---

# Use native library packages

Use LibTorch, SQLite, zlib, and Rust BLAKE3 through ordinary repository imports. Install the [August 1.0.0 CLI](getting-started.md) on a [supported host](compatibility.md). It downloads the required native libraries; no separate compiler or SDK is needed.

Save each program’s two files in one folder. Run `aug run` to install its dependencies, compile it, and execute it. Run `aug test` to check the same-file test, or download the complete project from its link below.

## CPU tensors

LibTorch creates two float64 tensors, adds them, and sums the result to 21. The test also checks each result element. Each owned handle releases its native tensor at scope exit, including failures. GPU support and wider PyTorch APIs are deferred.

[Package repository](https://github.com/GreenPandaStudios/aug-pytorch/tree/v0.2.0) · [Code, specs, and download](examples/native-pytorch/index.md)

**main.aug**

```text
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"

try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

**tensors.aug**

```text
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"

/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)

test calculate:
    when cpu:
        it adds_and_reads_real_tensors:
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
```

```sh
aug run
aug test
aug spec
```

## A SQLite database

SQLite opens an in-memory database, creates a table, inserts a bound parameter, and queries it. The query returns August. Updates happen inside a borrow, and the owned database closes when the operation ends.

[Package repository](https://github.com/GreenPandaStudios/aug-sqlite/tree/v0.2.0) · [Code, specs, and download](examples/native-sqlite/index.md)

**main.aug**

```text
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310"

try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)
```

**database.aug**

```text
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310"

/** Store a bound value in an in-memory SQLite database and read it back. */
storedName() returns string unless SqliteError:
    own Database database = openMemory()
    borrow database:
        execute(database, sql="CREATE TABLE users (name TEXT NOT NULL)", parameters=[])
        execute(database, sql="INSERT INTO users (name) VALUES (?)", parameters=["August"])
    return queryScalar(database, sql="SELECT name FROM users", parameters=[])

test storedName:
    when database:
        it inserts_and_queries_bound_data:
            assert(storedName() == "August")
```

```sh
aug run
aug test
aug spec
```

## A compression round trip

zlib compresses a UTF-8 buffer and decompresses it with a 4,096-byte output limit. The test checks the restored text and byte length. The adapter releases the native buffers after copying them.

[Package repository](https://github.com/GreenPandaStudios/aug-zlib/tree/v0.2.0) · [Code, specs, and download](examples/native-zlib/index.md)

**main.aug**

```text
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"

try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")
```

**compression.aug**

```text
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"

/** Compress text with zlib, then restore its bytes within a fixed output limit. */
roundTrip() returns Bytes unless CompressionError:
    Bytes input = "The world runs on language".bytes()
    Bytes compressed = compress(input)
    return decompress(input=compressed, maximumOutput=4096)

test roundTrip:
    when compression:
        it preserves_the_original_bytes:
            Bytes restored = roundTrip()
            assert(restored.text() == "The world runs on language")
            assert(restored.length() == 26)
```

```sh
aug run
aug test
aug spec
```

## A Rust hash function

The Rust BLAKE3 crate hashes abc. Its result must match the published 64-character digest checked by the test. The Rust adapter copies the output and catches unwinding panics before returning through the C ABI.

[Package repository](https://github.com/GreenPandaStudios/aug-blake3/tree/v0.2.0) · [Code, specs, and download](examples/native-blake3/index.md)

**main.aug**

```text
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"

try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)
```

**hashing.aug**

```text
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"

/** Hash UTF-8 text with the real Rust BLAKE3 implementation. */
hashText(string value) returns string unless HashError:
    return hash(input=value.bytes())

test hashText:
    when vectors:
        it matches_the_published_abc_vector:
            assert(hashText(value="abc") == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85")
```

```sh
aug run
aug test
aug spec
```

## Reuse a short import name

The URL in each import selects a release tag; installation resolves it to a source commit and native artifact hashes in `aug.lock.json`. An alias is useful when several files use the package:

```sh
aug add https://github.com/GreenPandaStudios/aug-zlib#v0.2.0 --as zlib
```

Then import `compress` and `decompress` from `zlib`. Keep the lock in source control. After an online build on the current host, `aug run --offline --frozen` requires the recorded compiler and library artifacts.

## Author and publish a binding

A native package uses the same `aug-package.json` and `export.aug` boundary as a source package. It adds `native.abi.json`, a reviewed C adapter header, native implementation/build files, and release archives for its declared targets. The descriptor identifies ownership, errors, release functions, OS/libc requirements, dependencies, and archive hashes. Follow [native packages](native-packages.md#author-a-binding) for header checking, artifact integrity, and deployment requirements.

C++ classes and Rust crate layouts stay behind C-compatible exports. Build and test those adapters in the maintainer’s pinned toolchain; consumers download the resulting archives. Installation runs no executable package recipes. Publish immutable source tags and matching artifacts, then verify an ordinary August import from a clean consumer environment.

## Diagnose installation failures

| Failure | Action |
| --- | --- |
| Unsupported OS, architecture, or libc | Use a supported host or a package release with a qualified matching target. |
| Missing archive or network failure | Check the named release artifact and network access; there is no automatic source build. |
| Checksum or descriptor mismatch | Restore the published artifact/descriptor pair. Do not suppress verification. |
| Missing frozen compiler selection | Build once online on this host, review the new lock entry, then use frozen mode. |
| Moved executable cannot load a library | Move its adjacent lib and share directories with it. |

Before deployment, review the package’s tests, supported platforms, build provenance, and license notices. The descriptor cannot establish that the native code honors its ownership rules.

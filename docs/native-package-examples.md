---
generated: true
source: examples/native-*
editLink: false
---

# Use native library packages

These complete programs call real LibTorch, SQLite, zlib, and Rust BLAKE3 implementations. They use ordinary repository imports and the published August 0.21.0 toolchain. Install the [CLI](getting-started.md) on a [supported host](compatibility.md); no native compiler or SDK is required.

For each program, save its two files in one folder. `aug run` installs and locks the source/native dependencies, compiles through LLVM, and runs it. `aug test` checks the nearby case. The source below is generated from the same canonical projects as the downloadable gallery.

## CPU tensors

LibTorch creates two float64 tensors, adds them, and sums the result to 21. The test also checks each result element. Each owned handle releases its native tensor at scope exit, including failures. GPU support and wider PyTorch APIs are deferred.

[Package repository](https://github.com/GreenPandaStudios/aug-pytorch/tree/v0.1.4) · [Code, specs, and download](examples/native-pytorch/index.md)

**main.aug**

```text
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4"

try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

**tensors.aug**

```text
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4"

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

SQLite opens an in-memory database, creates a table, inserts a bound parameter, and queries it. The result is August. Mutation occurs within borrow; the owned database closes when the operation ends.

[Package repository](https://github.com/GreenPandaStudios/aug-sqlite/tree/v0.1.3) · [Code, specs, and download](examples/native-sqlite/index.md)

**main.aug**

```text
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.3"

try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)
```

**database.aug**

```text
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.3"

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

zlib compresses a UTF-8 buffer and decompresses it with a 4,096-byte output limit. The test checks the restored text and byte length. Copied buffers use the adapter’s paired release operation.

[Package repository](https://github.com/GreenPandaStudios/aug-zlib/tree/v0.1.3) · [Code, specs, and download](examples/native-zlib/index.md)

**main.aug**

```text
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.3"

try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")
```

**compression.aug**

```text
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.3"

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

The Rust BLAKE3 crate hashes abc. Its result must match the published 64-character digest checked by the test. The Rust facade copies its output and contains unwinding panics before returning through the C ABI.

[Package repository](https://github.com/GreenPandaStudios/aug-blake3/tree/v0.1.3) · [Code, specs, and download](examples/native-blake3/index.md)

**main.aug**

```text
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.3"

try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)
```

**hashing.aug**

```text
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.3"

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
aug add https://github.com/GreenPandaStudios/aug-zlib#v0.1.3 --as zlib
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

A native descriptor describes a contract; it does not prove the foreign implementation obeys it. Review the package’s tests, provenance, platform qualification, and license notices before deployment.

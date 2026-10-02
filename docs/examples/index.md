---
title: "Example projects"
generated: true
source: "examples and benchmarks"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Example projects

Explore complete programs with code and compiled explanations side by side. Choose **Indentation** or **Braces** for the code view, follow links to dependencies, or download a project to run it. Native examples list their supported platforms.

Start with [Hello world with dependencies](hello/index.md) to trace a greeting through two folder boundaries. Then [review a change to the tested calculator](../guides/change-a-module.md). For a larger application, the [OpenID Connect example](oidc-login/index.md) combines pages, provider and client endpoints, and a session JWT. It is a development demonstration with documented limits.

For step-by-step lessons, start with [the book](../learn/index.md).

## Native libraries (LLVM preview)

| Project | What it demonstrates |
| --- | --- |
| [CPU tensors with PyTorch](native-pytorch/index.md) | Add two CPU tensors with LibTorch and check the elements and sum. Owned tensors are released at scope exit. |
| [A database with SQLite](native-sqlite/index.md) | Create an in-memory SQLite database, insert a bound value, and query it. Borrow the database for updates; scope exit closes it. |
| [Compression with zlib](native-zlib/index.md) | Compress a buffer with zlib and verify the restored bytes. A fixed output limit bounds decompression. |
| [Hashing with Rust BLAKE3](native-blake3/index.md) | Hash a buffer with the Rust BLAKE3 crate and compare a known digest. |

## Start here

| Project | What it demonstrates |
| --- | --- |
| [Hello world with dependencies](hello/index.md) | Print a greeting through an injected logger. Startup selects the providers, and export files choose what each folder makes public. |
| [Labeled calls and injection](new-syntax/index.md) | Construct an object with an injected dependency, call functions with labeled inputs, and run same-file tests. |
| [A small tested application](developer-workflow/index.md) | A calculator logs each addition. Its nearby tests replace the logger and verify both labeled inputs and fresh setup. |
| [Command-line arguments](cli-args/index.md) | Read arguments, inspect collections, and return a process exit status. |

## Web applications

| Project | What it demonstrates |
| --- | --- |
| [Weather API](weather-api/index.md) | Serve five simulated forecasts as typed JSON. The record, endpoint, and tests share a file; main.aug starts the listener and main.yaml enables OpenAPI. |
| [OpenID Connect login application](oidc-login/index.md) | One executable hosts a login page, an OpenID Connect provider and client, session JWTs, and logout. Accounts, keys, and sessions are held in memory for this development demonstration. |

## Values and errors

| Project | What it demonstrates |
| --- | --- |
| [Lists, tuples, sets, and maps](collections/index.md) | Create typed collections and update them through checked mutable access. |
| [Generic types and functions](generics/index.md) | Write reusable records, interfaces, classes, and functions with type parameters. |
| [Generic dependency injection](generic-di/index.md) | Bind a generic interface and resolve a class that uses it. |
| [Checked failures](errors/index.md) | Declare errors with unless, catch them, and run cleanup. |

## State and lifetime

| Project | What it demonstrates |
| --- | --- |
| [Read access and mutable borrows](ownership/index.md) | Share a reference for reading and grant explicit access for mutation. |
| [Move ownership](ownership-transfer/index.md) | Transfer an owned resource between labeled calls. |
| [Resource cleanup](drop/index.md) | Release an owned resource when its lifetime ends. |
| [Private state and helpers](visibility/index.md) | Keep underscore-prefixed implementation details inside their scope. |

## Modules and packages

| Project | What it demonstrates |
| --- | --- |
| [Modules and composition](approved-design/index.md) | Supply a scoped counter and call a doubling function that rejects negative inputs. |
| [Function and constructor middleware](interceptors/index.md) | Layer interceptors, map inputs, and keep logging dependencies explicit. |
| [Create a package](packages-math/index.md) | Export an arithmetic function from a library and test it. |
| [Use a package](packages-app/index.md) | Install the neighboring arithmetic package and import it through a local alias. |

## Native applications

| Project | What it demonstrates |
| --- | --- |
| [A native C boundary](ffi/index.md) | Declare a C operation and call it inside an unsafe block. |
| [A finite benchmark](benchmark/index.md) | Measure a deterministic arithmetic workload with aug bench. |

## Measured programs

| Project | What it demonstrates |
| --- | --- |
| [A million greetings](greetings-benchmark/index.md) | Print one million UTF-8 greetings and flush each line, matching the C reference. |
| [Startup benchmark](startup-benchmark/index.md) | Print one integer and exit to measure process startup. |
| [Floating-point benchmark](float-benchmark/index.md) | Accumulate exact binary fractions and check the final value. |
| [Function-call benchmark](calls-benchmark/index.md) | Call a labeled function repeatedly with a dependent integer result. |
| [List traversal benchmark](list-benchmark/index.md) | Grow a list and sum its snapshot values. |
| [String processing benchmark](strings-benchmark/index.md) | Split text into parts and sum their byte lengths. |
| [Map deletion benchmark](map-churn-benchmark/index.md) | Delete, replace and reinsert entries, then check values and insertion order. |
| [Checked-error benchmark](errors-benchmark/index.md) | Interleave successful calls and caught checked failures. |
| [Record allocation benchmark](records-benchmark/index.md) | Retain immutable records and sum their fields. |
| [Task scheduling benchmark](tasks-benchmark/index.md) | Start and join two tasks in each bounded scope. |
| [CPU benchmark](cpu-benchmark/index.md) | Two million dependent integer steps with a checked result. |
| [Map and Set benchmark](collections-benchmark/index.md) | Insert, find, and iterate over 20,000 collection entries. |
| [JSON benchmark](json-benchmark/index.md) | Parse, decode, and serialize a typed record 5,000 times. |
| [HTTP benchmark](http-benchmark/index.md) | Serve the typed JSON endpoint used in the throughput measurements. |

## Native libraries

| Project | What it demonstrates |
| --- | --- |
| [GPU workers](native-gpu/index.md) | Create Metal buffers inside isolated workers, add vectors on the GPU, and return copied results. Requires the August 0.22 preview, Apple Silicon, and macOS 14 or later with an available Metal GPU. |

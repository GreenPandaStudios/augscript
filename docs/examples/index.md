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

Browse complete August projects here in the wiki. Each source file includes formatted code in **Indentation** and **Braces** styles and its actual compiled specification. Dependency links open the matching version’s source and explanation in this wiki.

Start with [Hello world with dependencies](hello/index.md), then try [a small tested application](developer-workflow/index.md). The [OpenID Connect application](oidc-login/index.md) shows a larger project with server-rendered pages and HTTP handlers.

## Start here

- [Hello world with dependencies](hello/index.md) — A greeter, a logger, narrow folder exports, and explicit application bindings.
- [Labeled calls and injection](new-syntax/index.md) — Constructor injection, named inputs, ordinary functions, and same-file tests.
- [A small tested application](developer-workflow/index.md) — A calculator module with logging, fixtures, groups, and parameterized tests.
- [Command-line arguments](cli-args/index.md) — Read arguments, inspect collections, and return a process exit status.

## Values and errors

- [Lists, tuples, sets, and maps](collections/index.md) — Create typed collections and update them through checked mutable access.
- [Generic contracts](generics/index.md) — Write reusable records, interfaces, classes, and functions with type parameters.
- [Generic dependency injection](generic-di/index.md) — Bind a generic interface and resolve a class that uses it.
- [Checked failures](errors/index.md) — Declare errors with unless, catch them, and run cleanup.

## State and lifetime

- [Read access and mutable borrows](ownership/index.md) — Share a reference for reading and grant explicit access for mutation.
- [Move ownership](ownership-transfer/index.md) — Transfer an owned resource between labeled calls.
- [Resource cleanup](drop/index.md) — Release an owned resource when its lifetime ends.
- [Private state and helpers](visibility/index.md) — Keep underscore-prefixed implementation details inside their scope.

## Modules and packages

- [Modules and composition](approved-design/index.md) — Combine domain modules, generic values, explicit capabilities, and scoped providers.
- [Function and constructor middleware](interceptors/index.md) — Layer interceptors, map inputs, and keep logging dependencies explicit.
- [Create a package](packages-math/index.md) — Publish a small arithmetic library through export.aug and test its public surface.
- [Use a package](packages-app/index.md) — Install the neighboring arithmetic package and import it through a local alias.

## Native applications

- [A native C boundary](ffi/index.md) — Declare a C operation and call it inside an unsafe block.
- [A finite benchmark](benchmark/index.md) — Measure a deterministic arithmetic workload with aug bench.

## Web applications

- [OpenID Connect login application](oidc-login/index.md) — A login page, provider, client, session JWT, and logout flow in one August project.

## Measured programs

- [Startup benchmark](startup-benchmark/index.md) — The small program used to measure process startup.
- [CPU benchmark](cpu-benchmark/index.md) — Two million dependent integer steps with a checked result.
- [Map and Set benchmark](collections-benchmark/index.md) — Insert, find, and iterate over 20,000 collection entries.
- [JSON benchmark](json-benchmark/index.md) — Parse, decode, and serialize a typed record 5,000 times.
- [HTTP benchmark](http-benchmark/index.md) — Serve the typed JSON endpoint used in the throughput measurements.

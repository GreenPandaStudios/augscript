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

Read a complete program, follow its dependencies, and compare the source with its compiled explanation. Every file has highlighted **Indentation** and **Braces** views and the actual output of `aug spec`. Dependency links open the exact version used by the project. Each project has a download you can run with the published npm CLI.

Start with [Hello world with dependencies](hello/index.md) to trace a greeting through two folder boundaries. Then [review a change to the tested calculator](../guides/change-a-module.md). For a larger application, the [OpenID Connect example](oidc-login/index.md) combines pages, provider and client endpoints, and a session JWT. It is a development demonstration with documented limits.

If you are learning the language for the first time, use [the book](../learn/index.md). The gallery is for exploring whole projects and looking at the code behind a specific feature or measurement.

## Start here

| Project | What it demonstrates |
| --- | --- |
| [Hello world with dependencies](hello/index.md) | The application prints a greeting through an injected logger. Its entry point selects the providers, and each folder exposes a small public surface. |
| [Labeled calls and injection](new-syntax/index.md) | Constructor injection, named inputs, ordinary functions, and same-file tests. |
| [A small tested application](developer-workflow/index.md) | A calculator logs each addition. Its nearby tests replace the logger and verify both labeled inputs and fresh setup. |
| [Command-line arguments](cli-args/index.md) | Read arguments, inspect collections, and return a process exit status. |

## Values and errors

| Project | What it demonstrates |
| --- | --- |
| [Lists, tuples, sets, and maps](collections/index.md) | Create typed collections and update them through checked mutable access. |
| [Generic contracts](generics/index.md) | Write reusable records, interfaces, classes, and functions with type parameters. |
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
| [Modules and composition](approved-design/index.md) | Startup combines narrow domain exports with a scoped counter provider. Records and validation keep data and checked failures visible. |
| [Function and constructor middleware](interceptors/index.md) | Layer interceptors, map inputs, and keep logging dependencies explicit. |
| [Create a package](packages-math/index.md) | Publish a small arithmetic library through export.aug and test its public surface. |
| [Use a package](packages-app/index.md) | Install the neighboring arithmetic package and import it through a local alias. |

## Native applications

| Project | What it demonstrates |
| --- | --- |
| [A native C boundary](ffi/index.md) | Declare a C operation and call it inside an unsafe block. |
| [A finite benchmark](benchmark/index.md) | Measure a deterministic arithmetic workload with aug bench. |

## Web applications

| Project | What it demonstrates |
| --- | --- |
| [OpenID Connect login application](oidc-login/index.md) | One executable hosts a login page, an OpenID Connect provider and client, session JWTs, and logout. Accounts, keys, and sessions are held in memory for this development demonstration. |

## Measured programs

| Project | What it demonstrates |
| --- | --- |
| [Startup benchmark](startup-benchmark/index.md) | The small program used to measure process startup. |
| [CPU benchmark](cpu-benchmark/index.md) | Two million dependent integer steps with a checked result. |
| [Map and Set benchmark](collections-benchmark/index.md) | Insert, find, and iterate over 20,000 collection entries. |
| [JSON benchmark](json-benchmark/index.md) | Parse, decode, and serialize a typed record 5,000 times. |
| [HTTP benchmark](http-benchmark/index.md) | Serve the typed JSON endpoint used in the throughput measurements. |

# Web and crypto library limits

August provides typed endpoints, server-rendered pages, streams, and native HTTP and cryptographic adapters. This page records the limits that matter when building a service. The OpenID Connect example is a development application, not a production identity provider.

## HTTP transport

Socket tests cover HTTP/1.1, TLS peer verification, HTTP/2, and an HTTP/3-only QUIC client. Outbound requests suspend their task, so a service can call its own endpoints. Independent protocol testing and broader HTTP conformance remain open.

Compiler/runtime packs include the HTTP and crypto libraries for macOS ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. The CLI downloads them automatically. Windows, musl, and cross-compilation are unsupported.

## Requests and responses

The login example uses typed JSON and form inputs, repeated headers, cookies, redirects, and explicit OAuth error bodies. Strict parsing preserves signed 64-bit values. Optional fields contain a value or null; omitted fields become null. Frozen collections can be shared for reading.

Tests cover duplicate scalar query, header, cookie, and form inputs without process failure, bounded response statuses, large integer action captures, and complex or `Json`-valued forms. Multipart forms, inbound request streams, and wider input/protocol coverage remain open. Transport limits return HTTP Problem Details even when an endpoint uses OAuth errors.

## Pages and actions

Typed components escape markup. Deferred `handle` actions submit POST, PATCH, PUT, and DELETE requests through generated same-origin browser transport. Browser tests exercise provider sign-in and application logout while preserving the example's Origin and CSRF checks. August does not compile application code for the browser in this version.

## Streams and policies

SSE, `Bytes`, and `Html` streams pass socket tests. One pending item is limited to 64 KiB and sent under backpressure. Errors before output become responses; errors after headers terminate output. Disconnect tests check `always` cleanup, request logging, and server survival under managed collection pressure.

Authentication runs before decoding. Permission checks, rate limits, exact-origin CORS and preflight, gzip, and streaming deadlines pass native socket tests. HTTP policies precede custom parameter interceptors. Header dispatch, lazy body reception, configurable absolute reception deadlines and bounded drain now have HTTP/1.1 socket regressions. HTTP/2 and HTTP/3 reception/backpressure qualification, inbound streams and broader compression negotiation remain open.

Streaming HEAD preserves headers and status when stopping the producer. A cleanup failure before headers returns 500. HEAD completes at its headers on HTTP/1.1 and HTTP/2; the prepared response survives session cleanup. Tests also cover empty streams and endpoint-test failures after a yield.

## Tests and OpenAPI

OpenAPI 3.2.1 generation and the served API explorer describe selected routes, input sources, schemas, response variants, and policies. Same-file endpoint tests exercise native routing, dependency injection, decoding, serialization, and bounded stream collection. Each case starts with fresh process state.

Endpoint tests do not exercise socket parsing or TLS negotiation. Those need live transport tests. Editor help and context reports include route details, wire sources, policy options, and test cases.

## Task and resource lifetimes

HTTP transport uses cooperative tasks. August 0.23.0 includes multicore worker tasks with private heaps and copied inputs/results; worker functions cannot access parent bindings or transport objects. Channels and broadcasts are not implemented. `ExpiringStore<T>` uses a bounded `Shared<Map<...>>` with atomic removal for authorization transactions and codes.

Tests cover scope joining, cancellation, inherited deadlines, lock progress, owned resource lifetime, and sibling/grouped cleanup errors. The compiler tracks task captures through injected dependencies as well as explicit arguments and receivers. Dropping an owned `Shared<T>` releases its transferred payload before later locals. Broader ownership and cancellation coverage remains on the language roadmap.

Locally scheduled errors follow task aliases, collections, waits, exception paths, and implicit joins. A helper receiving `Task<T>` must handle or declare `Error`. A public type for a narrower delayed-error set is not yet available.

## Cryptography

The injectable GnuTLS adapter provides secure randomness, SHA-256/PKCE, RSA JWK import/export, fixed-algorithm and token-type JOSE handling, Ed25519 verification and a trusted issuer/audience/type/time/subject identity verifier, PBKDF2, and constant-time content comparison. The login example uses these operations, and Node independently verifies the provider's signature. General secret-buffer zeroization and key lifecycle APIs remain open.

## OpenID Connect

The same application hosts the provider and relying party. Tests cover exact client and redirect checks, S256 PKCE, state and nonce, one-use codes, ID-token validation, protected access, and logout revocation. They reject wrong PKCE, replayed codes, tampered JWTs, and substitution of provider tokens for application sessions.

Accounts, signing keys, and sessions live in memory. Persistent account management, broader provider profiles, federation, key rotation, distributed revocation, and certification are not implemented. The example still performs the protocol checks required by its supported authorization-code flow.

## Scope boundaries

Use the example to study the supported flow and build local experiments. Review the gaps above before extending it into an identity service. Core language conformance and runtime reliability are tracked in the [roadmap](roadmap.md); wider HTTP and identity-provider support are library work.

## Native ingestion qualification

The [service boundary guide](native-service-boundaries.md) records the current ingestion gap work. Strict JSON remains unchanged; `parseCompatible` provides a bounded legacy boundary parser. Binary/text operations have independent byte, BigInt, UTF-16 and float32 comparisons. PostgreSQL is an ordinary native package with worker-local pool and lease ownership; its disposable-database tests cover transactions, savepoints, bytea, SQLSTATE, timeouts, cancellation and cleanup.

The [0.23.0 worker/runtime release](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.23.0) and [public Linux ARM64 cold-install check](./public/qualification/0.23.0/native-ingestion-linux-arm64.json) passed their release gates. These socket, crypto and database checks do not qualify the production ingestion service. Its authorization order, retry conservation, lost-response behavior, database recovery, TLS deployment and load/failure tests must still run against the selected public artifacts. No production routes or databases were changed by this work.

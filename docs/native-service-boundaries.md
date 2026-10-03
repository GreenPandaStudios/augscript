# Native service boundaries

This guide describes ingestion support in the published [August 0.23.0 preview](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.23.0). A [clean Linux ARM64 install](./public/qualification/0.23.0/native-ingestion-linux-arm64.json) downloaded the public compiler and native package, compiled these operations through LLVM, and checked their results and cleanup. See [library limits](web-library-gaps.md) for remaining transport and deployment work.

## Authenticate before reading the upload

Bind `HttpRequest request from request` when a protocol needs its own error body. Its headers are available immediately. Verify the identity, account and operation before reading `request.body`. Early rejection returns without asking the sender to upload, including for `Expect: 100-continue`. An accepted body read waits for the complete bounded upload. Typed JSON and form inputs use the same reception operation after the HTTP policies and media checks.

`verifyIdentityToken` in the crypto source package accepts only Ed25519 signatures with `alg=EdDSA`. Supply a trusted PEM public key, issuer, audience, token type, current epoch seconds and maximum age. It requires `sub`, `iat` and `exp`; verifies the signature before exposing claims; checks a string or array audience; rejects future issue times, expired tokens and excess lifetime; and applies JavaScript-safe integer and UTF-16 subject/token bounds. It never follows a token's key URL. `IdentityVerifier` and `Ed25519IdentityVerifier` provide an injectable interface for this profile. A caller selects trusted configuration and supplies time; invalid tokens raise `JwtError`.

## Preserve the wire contract

The strict JSON `parse` still rejects duplicate fields, integers outside int64 and nesting beyond 64 levels. Use the separately exported `parseCompatible` only for a legacy boundary that needs JSON.parse-style duplicate handling and binary64 numbers. Later duplicate values replace earlier ones. Ignored oversized numbers and nested fields can be accepted up to 4096 container levels. Invalid JSON, malformed Unicode and lone UTF-16 surrogate escapes remain errors. This is bounded parsing, not a complete JavaScript object model. Typed decoding remains strict.

Keep the original JSON text when a receipt hashes the client's bytes. Parsing and reserializing changes whitespace, duplicate fields and number spelling. `Json.has(name)` distinguishes a missing field from a present JSON null; `get` still returns null for either. Ordinary optional record fields intentionally do not preserve that distinction.

`Bytes.slice(start, end)` copies a half-open range and raises `IndexError` unless `0 <= start <= end <= length`. `hex()` includes every byte, including zero. Hashing then calling `hex()` gives a lowercase SHA-256 representation. Strings provide `utf16Length`, ECMAScript `trim`, `isDecimal` and `compareDecimal`. Keep unsigned IDs and range numbers as decimal strings; compare against the decimal u128 maximum without converting to int or float. `float.float32()` rounds to binary32 and rejects nonfinite input or overflow with `ConversionError`; `isFinite()` tests binary64 values.

## Keep PostgreSQL on its worker

The separate [PostgreSQL package repository](https://github.com/GreenPandaStudios/aug-postgres) uses real libpq 18.6 with OpenSSL 3.5.9. Its [v0.1.0 release](https://github.com/GreenPandaStudios/aug-postgres/releases/tag/v0.1.0) is qualified on macOS ARM64 and Debian 12 ARM64 and x86-64. The public Linux ARM64 check starts with empty caches and no native development tools. Create its pool, lease and results inside the worker that uses them. Return copied August data to the handler. A pool has at most 64 sessions and rejects a full lease request immediately. One lease stays on its creating OS thread, so BEGIN, SAVEPOINT, account-filtered SQL and advisory locks use the same connection. Text parameters use PostgreSQL placeholders and explicit casts; bytea parameters use `"\\x" + bytes.hex()`, and bytea results are copied into Bytes. Never concatenate user values into SQL.

Query time, copied rows and copied result bytes are explicit call inputs. Cancellation and timeout initiate bounded libpq cancellation and discard the connection. Cancelling a query is not proof that the server completed it. An unfinished transaction is rolled back before pool reuse; cleanup failures discard it. Server errors retain SQLSTATE, while messages omit connection strings, parameters and server text. The result-copy budget does not cap libpq's internal wire buffer for a single large field. SQL NULL is checked separately from empty data.

Use one numeric host, a Unix socket or numeric hostaddr; comma-separated host lists are rejected to avoid synchronous DNS outside the connection deadline. For remote TLS, provide sslmode=verify-full, host and an explicit sslrootcert. Pool construction copies connection configuration into native memory; disposal clears that copy. General secret-buffer zeroization in August remains a separate gap.

## Admission, drain and acceptance

Set web reception and admission limits before serving. Worker admission independently bounds unfinished jobs and copied input memory; a full bound raises checked `ConcurrencyError` at `start worker`. Catch it and choose a protocol response or an application-owned retry policy. See [workers](workers.md) for defaults and environment settings.

Stop HTTP admission, allow the selected network grace period, then join request cleanup before disposing services. Native query deadlines and cancellation must fit that shutdown budget. Qualify normal completion, disconnects, failed commits, abandoned transactions, cancellation and lost-response retries against disposable infrastructure. Passing compiler checks or a native adapter test is not evidence that an application's authorization order or retry rules are correct.

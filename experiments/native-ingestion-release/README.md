# Public 0.23 native ingestion qualification

The retained report is `docs/public/qualification/0.23.0/native-ingestion-linux-arm64.json`. It records a successful run on October 3, 2026 with empty source, artifact and npm caches. The runner uses public npm, repository and release URLs. No compiler source, local runtime pack or candidate artifact replaces a public download. The compiler release is frozen at `c47626dc75f3822cc78391b1e7697f87022ae2b9`; PostgreSQL v0.1.0 resolves to `302f953b881522342e29a08584ece5b5b4459c61`. The report retains exact runtime, compiler archive, native archive, npm and fixture hashes.

The installed CLI depends on the matching core standard library. Optional web, crypto and JSON libraries are imported from their public source folders. An initial runner incorrectly expected npm to install web and crypto alongside the CLI. That assertion failed before compiler or database checks. The corrected runner was copied into a new container with empty caches; its hash is in the successful report.

## Replay

Build the canonical `Dockerfile.native-consumer` image for Linux ARM64. Start a disposable PostgreSQL 18.6 server on a private Docker network. Create a fresh consumer from that image and copy only `qualify.mjs`, `tests` and `http-tests` into `/consumer`. Do not copy node_modules, locks or caches. Set `AUG_POSTGRES_TEST_CONFIGURATION` to that disposable server connection configuration and run `node /consumer/qualify.mjs`. The runner rejects a used cache or installed native development tools. It writes `/consumer/public-023-qualification.json` even on failure. Retain that file and stdout before removing the containers.

The checks run real libpq calls, copied worker results, bytea round trips, SQLSTATE, transaction rollback and savepoints, deadlines, reconnects, pool bounds and zero native-resource counters. They also check public LLVM compilation, frozen/offline lock reuse, deployment relocation, independently signed Ed25519 tokens, bounded compatible JSON, byte/text/hash helpers, HTTP header rejection and Expect handling, reception limits, and shutdown of a database-confirmed active query.

These are finite boundary checks. They do not qualify a production service’s authorization order, retry conservation, lost-response handling, database recovery, TLS deployment or workload. Separate release producer/consumer jobs qualify the other supported hosts and PostgreSQL TLS behavior.

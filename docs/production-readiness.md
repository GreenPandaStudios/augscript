# Production readiness and dependencies

August 0.19 is experimental. The compiler, CLI, packages, standard declarations, and editor can be tried today; the project does not claim general production readiness. Use the [getting-started guide](getting-started.md) for a first application, [the roadmap](roadmap.md) for release gates, and [the compatibility page](compatibility.md) for the proposed 1.0 support contract.

## What is measured and verified

The repository checks compiler types, native execution, language examples, generated specs, package installation outside the checkout, and the VS Code extension in CI. [Performance measurements](performance.md) compare specific programs and HTTP loads on named hardware. A benchmark is evidence for that program and environment, not a general speed guarantee.

The same-app [OpenID Connect example](examples/oidc-login/index.md) proves integration paths; it stores accounts, signing keys, and sessions in memory. It is a development demonstration, not a production identity service.

## Dependencies and licenses

The npm CLI and three August library packages have **no npm production dependencies outside their matching August packages**. The VS Code extension's npm audit currently reports zero advisories. The wiki build uses VitePress and a pinned Vite override; run `npm audit` before each release. npm audit only covers npm packages and cannot certify native code or deployment configuration.

| Dependency | Role | License from upstream | Distribution consideration |
| --- | --- | --- | --- |
| minicoro | Portable task runtime source | Public domain or MIT No Attribution | Source is fetched with a checked SHA-256. |
| yyjson | JSON source | MIT | Source is fetched with a checked SHA-256. |
| libwebsockets | Native HTTP library | MIT core; bundled portions have their own notices | Static link in a full native build; preserve applicable notices. |
| GnuTLS | TLS and cryptography | LGPL 2.1 or later core | Shared library; preserve notices and satisfy LGPL distribution terms. |
| Bundled libtasn1 and libunistring | GnuTLS's configured included dependencies | LGPL 2.1 or later for libtasn1; LGPL 3 or later or GPL 2 or later for libunistring | Inspect the exact GnuTLS source bundle and preserve applicable terms. |
| Nettle | Cryptographic primitives | LGPL 3 or later or GPL 2 or later | Shared library; choose and comply with a permitted license route. |
| GMP | Big integer arithmetic | LGPL 3 or later or GPL 2 or later | Shared library; choose and comply with a permitted license route. |
| zlib | Host compression library | zlib | Include applicable notice when redistributing it. |
| CMake, pkgconf | Native build tools | See upstream license files | Build tools are not included in the current source/npm/VSIX release artifacts. |

The exact versions, archive URLs, and SHA-256 values are in [`native-dependencies.lock.json`](../scripts/native-dependencies.lock.json). See [native dependency notices](../THIRD_PARTY_NOTICES.md) and the upstream [GMP copying terms](https://gmplib.org/manual/Copying), [GnuTLS security advisories](https://gnutls.org/security-new.html), [libwebsockets security policy](https://github.com/warmcat/libwebsockets/security), [libtasn1 terms](https://www.gnu.org/software/libtasn1/), and [libunistring terms](https://www.gnu.org/software/libunistring/manual/html_node/Licenses.html). A redistributor of a compiled app must review its actual linked libraries, notices, source obligations, and target environment. The repository's audit is a starting inventory, not legal advice or a vulnerability certification. The pinned libwebsockets commit is not automatically updated when upstream fixes arrive; review upstream's security notes before shipping it.

## Release gates still open

- **Platform support:** the full pinned web/crypto bootstrap passes on macOS ARM and Linux ARM. [Docker build/run bases](docker.md) run core, web, and crypto programs on Linux. Linux x86-64 runs in CI; other platforms remain unverified.
- **Concurrency and ownership:** tasks use one OS thread. The [conformance suite](language-conformance.md) exercises injected captures, mutation after a child starts inside `borrow`, owned `Shared<T>` cleanup, cancellation, and the public `Task<T>` error contract. Wider control-flow and platform conformance remain before a 1.0 support claim.
- **Security and reliability:** HTTP and OIDC need broad protocol conformance, durable credentials and keys, rotation, long-running load tests, and deployment guidance. The [gap ledger](web-library-gaps.md) records the precise work.
- **Package and ABI stability:** published npm identities, reproducible releases, compatibility policy, and native adapter ABI need stable release gates.
- **Operational behavior:** failure handling, cancellation, instrumentation, platform builds, and resource ceilings need repeated CI and field testing.

For a trial deployment, pin the compiler and native lock, run the project's tests and `aug spec --check`, review the generated C/native linker inputs, and validate the executable under your own load and failure conditions. Track the [gap ledger](web-library-gaps.md) before promising production service levels.

# Production readiness and dependencies

August 0.23.0 is experimental. The compiler, CLI, packages, standard declarations, and editor can be tried today; the project does not claim general production readiness. Use the [getting-started guide](getting-started.md) for a first application, [the roadmap](roadmap.md) for release gates, and [the compatibility page](compatibility.md) for the proposed 1.0 support contract.

## What is measured and verified

The repository checks compiler types, native execution, language examples, generated specs, package installation in isolated projects, and the VS Code extension in CI. [Performance measurements](performance.md) compare specific programs and HTTP loads on named hardware. A benchmark is evidence for that program and environment, not a general speed guarantee.

The [robustness tests](../tests/robustness.test.mjs) mutate 5,000 source files through the parser and 1,000 through project checking, then compare generated native integer, Map, and Set programs in debug and release modes with independent JavaScript oracles. CI also runs [core native stress programs](../scripts/sanitize-core.mjs) for collections, task joining, and owned `Shared<T>` transfer with AddressSanitizer and UBSan on macOS and Linux. Run them locally with `npm run test:sanitizers`. This catches specific crashes, wrong results, and memory errors in the exercised paths; it does not prove the compiler, HTTP/crypto libraries, or all programs safe. Leak detection is disabled for this gate because the macOS AddressSanitizer runtime does not support it.

The preview includes [runtime reliability qualification](runtime-reliability.md). It repeats allocation, cancellation, nested waits, and owned cleanup with exact core allocation counts, resource counters, and resident-memory observations. Release candidates require a 30-minute circuit on each supported target; shorter pull-request runs catch regressions.

The [OpenID Connect example](examples/oidc-login/index.md) exercises a provider and client in one application. It stores accounts, signing keys, and sessions in memory. It is a development demonstration, not a production identity service.

The [safety gyms](safety-gyms.md) generate LLVM cases, check rejected operations, and test whether deliberately faulty programs are detected. [The results](qualification-results.md) record what ran and what was skipped. They also include eight more C performance comparisons.

## Dependencies and licenses

The CLI uses its matching core August library and `tar` 7.5.22 for registry archive extraction. The extension bundles that parser and its JavaScript dependencies. Audit the exact extension dependencies for the version you deploy. The wiki build uses VitePress and a pinned Vite override; run `npm audit` before each release. npm audit only covers npm packages and cannot certify native code or deployment configuration.

| Dependency | Role | License from upstream | Distribution consideration |
| --- | --- | --- | --- |
| tar, chownr, yallist, minipass, minizlib, @isaacs/fs-minipass | Archive extraction in the CLI and extension | ISC, MIT, or BlueOak-1.0.0, as recorded in each package | Preserve the bundled license files and review npm audit before release. |
| minicoro | Portable task runtime source | Public domain or MIT No Attribution | Source is fetched with a checked SHA-256. |
| yyjson | JSON source | MIT | Source is fetched with a checked SHA-256. |
| libwebsockets | Native HTTP library | MIT core; bundled portions have their own notices | Static link in a full native build; preserve applicable notices. |
| GnuTLS | TLS and cryptography | LGPL 2.1 or later core | Shared library; preserve notices and satisfy LGPL distribution terms. |
| Bundled libtasn1 and libunistring | GnuTLS's configured included dependencies | LGPL 2.1 or later for libtasn1; LGPL 3 or later or GPL 2 or later for libunistring | Inspect the exact GnuTLS source bundle and preserve applicable terms. |
| Nettle | Cryptographic primitives | LGPL 3 or later or GPL 2 or later | Shared library; choose and comply with a permitted license route. |
| GMP | Big integer arithmetic | LGPL 3 or later or GPL 2 or later | Shared library; choose and comply with a permitted license route. |
| zlib | Host compression library | zlib | Include applicable notice when redistributing it. |
| CMake, pkgconf | Native build tools | See upstream license files | Build tools are not included in the current source/npm/VSIX release artifacts. |

The exact versions, archive URLs, and SHA-256 values are in [`native-dependencies.lock.json`](../scripts/native-dependencies.lock.json). See [native dependency notices](../THIRD_PARTY_NOTICES.md) and the upstream [GMP copying terms](https://gmplib.org/manual/Copying), [GnuTLS security advisories](https://gnutls.org/security-new.html), [libwebsockets security policy](https://github.com/warmcat/libwebsockets/security), [libtasn1 terms](https://www.gnu.org/software/libtasn1/), and [libunistring terms](https://www.gnu.org/software/libunistring/manual/html_node/Licenses.html). A redistributor of a compiled app must review its actual linked libraries, notices, source obligations, and target environment. This inventory does not replace a review of the libraries in your deployed bundle. The pinned libwebsockets commit is not automatically updated when upstream fixes arrive; review upstream's security notes before shipping it.

## Release gates still open

The LLVM compiler, runtime, and public native packages work on macOS ARM64 and GNU/Linux x86-64/ARM64. Installed-package tests cover public downloads, locked and offline builds, relocated executables, and resource cleanup without native development tools. Windows, musl, and cross-compilation remain unsupported.

Before 1.0, the project needs broader language conformance tests, repeated runtime stress tests, stable ABI and package formats, and repeatable releases. Isolated multicore workers have platform conformance and sanitizer gates that each release must repeat. The [roadmap](roadmap.md) gives the order and acceptance criteria.

HTTP and identity services need additional protocol testing, durable credentials and keys, rotation, and long-running load tests. Those requirements are listed in [web and crypto limits](web-library-gaps.md).

For a trial deployment, pin the compiler and native lock, run the project's tests and `aug spec --check`, review its native artifact and deployment inputs, and validate the executable under your own load and failure conditions. Track the [gap ledger](web-library-gaps.md) before promising production service levels.

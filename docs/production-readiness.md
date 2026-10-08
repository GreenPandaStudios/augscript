# Production readiness and dependencies

August 1.0 is a stable release of the core language, CLI, package formats and public native ABI on its supported hosts. That compatibility promise does not establish the readiness of every library or application. Use [the compatibility contract](compatibility.md) for the supported scope and this page to assess a deployment.

## What is measured and verified

The experimental AUG-0001 protocol adds checked source transactions, forwarding, and bounded behavioral evidence. Its regressions exercise exact rename occurrences, stale revisions, rollback, process-death recovery, independent native checks, and deliberate interaction mutations. The [guide](checked-changes.md) distinguishes finite checks from formal proof, engineer review, and the unperformed comparative AI evaluation. Cooperating source writers are serialized; arbitrary external editor writes are not filesystem-isolated.

The repository checks compiler types, native execution, language examples, generated specs, package installation in isolated projects, and the VS Code extension in CI. [Performance measurements](performance.md) compare specific programs and HTTP loads on named hardware. A benchmark is evidence for that program and environment, not a general speed guarantee.

The [robustness tests](../tests/robustness.test.mjs) mutate 5,000 source files through the parser and 1,000 through project checking, then compare generated native integer, Map, and Set programs in debug and release modes with independent JavaScript oracles. CI also runs [core native stress programs](../scripts/sanitize-core.mjs) for collections, task joining, and owned `Shared<T>` transfer with AddressSanitizer and UBSan on macOS and Linux. Run them locally with `npm run test:sanitizers`.

The [generated C audit](../scripts/audit-generated-c.mjs) builds adversarial programs for collections, checked errors, tasks, ownership, JSON, cryptography, and HTTP/HTML. It runs Clang static analysis on every August-generated C file and copied August runtime unit in each build, then executes the programs with AddressSanitizer and UBSan. It also analyzes the full [OpenID Connect example](examples/oidc-login/index.md), including its web and crypto runtime units. Run `npm run test:safety` after the full native bootstrap. The audit found and fixed an HTML buffer-size overflow risk. This gate covers the specific compiled programs and paths exercised; static analysis and sanitizers cannot prove every August program or external native dependency safe. Leak detection is disabled because the macOS AddressSanitizer runtime does not support it.

The release includes [runtime reliability qualification](runtime-reliability.md). It repeats allocation, cancellation, nested waits, and owned cleanup with exact core allocation counts, resource counters, and resident-memory observations. Release candidates require a 30-minute circuit on each supported target; shorter pull-request runs catch regressions.

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

## Release requirements and library limits {#release-gates-still-open}

The LLVM compiler, runtime, and public native packages work on macOS ARM64 and GNU/Linux x86-64/ARM64. Installed-package tests cover public downloads, locked and offline builds, relocated executables, and resource cleanup without native development tools. Windows, musl, and cross-compilation remain unsupported.

The [1.0.0 release](https://github.com/GreenPandaStudios/augscript/releases/tag/v1.0.0) passed its language conformance, runtime lifecycle, native ABI, package and distribution gates on all three supported hosts. [Tagged qualification](https://github.com/GreenPandaStudios/augscript/actions/runs/37800823512) identifies the exact source, tested artifacts and results. Isolated multicore workers have platform conformance and sanitizer gates that each release must repeat. The [release process](releasing.md) defines the required checks and publication order.

HTTP and identity services need additional protocol testing, durable credentials and keys, rotation, and long-running load tests. Those requirements are listed in [web and crypto limits](web-library-gaps.md).

For a deployment, pin the compiler and native lock, run the project's tests and `aug spec --check`, review its native artifact and deployment inputs, and validate the executable under your own load and failure conditions. Track the [gap ledger](web-library-gaps.md) before promising production service levels.

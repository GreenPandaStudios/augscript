# August 1.0 dependency review

Reviewed **6 October 2026** against the 1.0.0 candidate in `v1-release-qualification`. This is a dated maintainer assessment of exact inputs, supported bindings, and redistribution materials. It does not certify arbitrary native code, prove freedom from vulnerabilities, or replace final target qualification. No dependency versions, runtime sources, package code, or workflows were changed by this review.

## Remediation status — 6 October 2026

The observations below record the **pre-repair baseline**, including its exact affected archive pins. They are retained as the reason for the repairs, not as the status of the selected package candidate. LibTorch now selects [reviewed source e2b74b1](https://github.com/GreenPandaStudios/aug-pytorch/tree/e2b74b1968fb11972e260ef3796a1cd849c1f702): complete closure notices, unchanged upstream binaries, corresponding GNU sources, and the aligned-allocation backport passed the [three-target candidate run](https://github.com/GreenPandaStudios/aug-pytorch/actions/runs/37532031075). The subsequent source/pin checkpoint also passed [run 37533868559](https://github.com/GreenPandaStudios/aug-pytorch/actions/runs/37533868559). The measured final archives and attribution limits are recorded in [the LibTorch review](v1-libtorch-redistribution.md).

The compiler source includes the same GCC backport and expanded distribution notices. Its ARM64 cold/warm pilot preserved all 5,974 original dynamic exports and passed allocation/thread regressions with a controlled compiler environment. **Fresh compiler pack qualification on all three targets remains required**; the old Linux archive pins below are not the repaired release artifacts. Local qualification uses patched Node 24.21.0. Final container versions, excluded-path Linux symbol checks, and deployed notices remain explicit gates.

## Pre-repair baseline: required actions

**Resolve the Linux GCC runtime finding.** Both reviewed Linux compiler packs contain the aligned-allocation implementation affected by **CVE-2026-95619**. The x64 LLVM tools actually import aligned `operator new`. Patch or replace the pinned compatible runtime, retain corresponding sources and modification notices, refresh artifact identities, and qualify the resulting packs. An alternative requires a reviewed argument establishing bounds on every relevant caller; a passing finite suite alone cannot establish that exclusion. No hostile August input triggering the overflow was demonstrated. [Debian advisory](https://security-tracker.debian.org/tracker/CVE-2026-95619), [GCC fix](https://github.com/gcc-mirror/gcc/commit/59d235ffa5a69231eb42e5290d52dc8c90d28b7a).

**Complete the LibTorch redistribution review.** The package's own notice inventory remains `redistribution-review-incomplete`. Reconcile the final binary closure, hashes, modifications, deployment notices, and embedded-header/compiler-runtime attribution before describing that review as complete. The inventory contains substantial notice evidence; this review did not establish a particular missing mandatory notice. [Exact package inventory](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/licenses/README.md).

**Use a patched Node host for final qualification.** The local executable reported **24.18.0**. The July security release is **24.18.1**; the official site currently identifies **24.21.0** as the latest Node 24 LTS. August's `>=24` engine range admits older patch releases. Use the current patched LTS and record the actual Node version inside each pinned Docker image. The image digest alone does not document that version. The maintainer subsequently verified Node **24.21.0** inside the pinned native-maintainer image; the consumer/build image's actual version remains to be recorded. [Node security release](https://nodejs.org/en/blog/vulnerability/july-2026-security-releases).

**Expand the distribution notices.** [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) omits the bundled GCC runtimes and compiler-only ICU/XZ, and describes zlib only as a host dependency. Add their scopes and source/license locations. The measured packs already retain these materials; this is an incomplete notice overview, not evidence that their license files are missing.

At the baseline checkpoint, the GCC12 backport was pending and outside the reviewed pins below. The remediation status above records its subsequent source and library qualification.

## Exact input inventory

The canonical evidence is [the runtime source lock](../../scripts/native-dependencies.lock.json), [LLVM inputs](../../native/llvm-inputs.json), [Linux runtime lock](../../native/linux-runtimes.lock.json), [compiler pack descriptors](../../native/compiler-packs.json), [root npm lock](../../package-lock.json), [editor npm lock](../../vscode/package-lock.json), and [third-party notices](../../THIRD_PARTY_NOTICES.md). Archives and selected binaries have content hashes; versions alone are insufficient identities.

| Scope | Pinned input |
| --- | --- |
| Distributed compiler tools | LLVM **23.1.2**, revision `85ac560262434c9ccfc0c183ec22d4138ed647fb`; `llc`, `opt`, `lld`, plus macOS `dsymutil`. Ordinary consumers do not receive Clang. |
| Crypto/TLS runtime | GMP **6.3.0**, Nettle **3.10.2**, GnuTLS **3.8.13**; GnuTLS uses bundled minitasn1 and a gnulib unistring subset. The minitasn1 header reports **4.20.0**; no independent libunistring release version was established for that source subset. |
| HTTP runtime | libwebsockets **5.0-stable**, exact revision `a842936f881921b6462b3328cce8e700b7a7ecd2`. |
| Core runtime | yyjson **0.12.0**; minicoro **0.1.3**, revision `8673ca62ed938c0b436bc2a548f172865f65bf1d`; Unicode **18.0.0** data. |
| Maintainer utilities | CMake **4.1.1** on macOS; pkgconf **2.3.0**. These are build inputs, not ordinary consumer compiler tools. |
| Linux redistributable closure | Debian GCC runtimes **12.2.0-14+deb12u1**, zlib **1.2.13.dfsg-1**. LLVM tools additionally retain ICU **70.1-2ubuntu1** and XZ/liblzma **5.4.1-1+deb12u2**. Optional Fortran closure is ARM64 only. |
| Platform libraries | GNU libc **2.36 minimum**, supplied by the host; no exact host glibc patch version is pinned or bundled. macOS uses system libSystem/frameworks, minimum macOS **14 ARM64**. |

LLVM's official release identifies the pinned revision. Its tools are not generally hardened against malicious compiler input; the absence of published LLVM advisories is not evidence that compiling hostile source or objects is a sandbox. [LLVM 23.1.2 announcement](https://discourse.llvm.org/t/llvm-23-1-2-released/91895), [LLVM security policy](https://llvm.org/docs/Security.html#what-is-considered-a-security-issue).

The shipping CLI archive closure is **tar 7.5.22**, **minizlib 3.1.0**, **chownr 3.0.0**, **minipass 7.1.3**, **yallist 5.0.0**, and **@isaacs/fs-minipass 4.0.1**. The VSIX copies that closure. Root lockfile `dev` flags do not describe the independently assembled CLI distribution; [its manifest](../../packages/cli/package.json) and [editor preparation](../../vscode/prepare.mjs) do.

Reviewed wiki/build inputs include Mermaid **12.1.0**, DOMPurify **3.4.16**, Vite **6.4.3**, VitePress **1.6.4**, Rollup **4.63.5**, KaTeX **0.18.2**, TypeScript **7.0.2**, and jsdom **26.1.0**. Editor publishing/artwork inputs include @vscode/vsce **4.0.1-1**, sharp **0.35.5**, semver **7.8.5**, minimatch **10.2.6**, brace-expansion **5.0.12**, yauzl **3.4.0**, yazl **2.5.1**, jsonwebtoken **9.0.3**, and jws **4.0.1**. These have distinct build, website, and publisher surfaces; they are not all dependencies of a deployed August application.

### Optional native packages

All six catalog candidates declare package **0.2.0** and compiler **1.0.0**. Some reuse previously qualified native archives, so the package version and native artifact release tag intentionally differ. Exact source and artifact identities are in [the catalog](../../native/library-catalog.json); a manifest version is not release qualification.

| Package / reviewed repository commit | Native inputs and supported surface |
| --- | --- |
| PyTorch / `e87f57af25ac17662c6299224815d3fd1464ad3e` | CPU LibTorch **2.14.1**; float64 tensor creation, add, sum, values. Linux ARM64 adds OpenBLAS **0.3.34**, Arm Compute **53.2.0**, revision `7b256bb7965f2fd99cdee790a4b0e56dab438a8c`, Debian zlib **1.2.13.dfsg-1**, and GCC runtimes. macOS OpenMP provenance identifies **21.1.8-h4a912ad_0**. |
| SQLite / `43d8c33289b6b9310199f8c65fb83d48cd9dc310` | SQLite amalgamation **3.53.4**, statically embedded in the adapter. |
| zlib / `fce52e3bf536a304fab82d1d4b95ae425c027be1` | zlib **1.3.2**, static `compress2` / `inflate` binding. |
| BLAKE3 / `e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e` | Rust **1.98.1**, BLAKE3 **1.8.7**, `std,pure`, unwinding panic contained at the C boundary. |
| GPU / `4a7ce9d4c74de8b355b49926d100d7e185923f2c` | Adapter **0.1.0**, system Metal/Foundation; macOS 14 ARM64 only. Frameworks are not redistributed; CUDA is absent. |
| PostgreSQL / `59c00c51cc6a4be21e87feb35f95618803a43995` | PostgreSQL **libpq 18.6**, statically linked OpenSSL **3.5.9**. This is the client library, not PostgreSQL server or contrib tools. |

BLAKE3's exact Cargo closure is **arrayvec 0.7.8; blake3 1.8.7; cc 1.5.1; cfg-if 1.0.5; constant_time_eq 0.4.2; cpufeatures 0.3.1; find-msvc-tools 0.1.14; libc 0.2.189; shlex 2.0.1**. Cargo.lock SHA-256 is `a514c6f97adec4760efdfb3f344af82dc8a49cf3c906d7a560b6e870aa5536a2`. SQLite/BLAKE3 lock fields named `sourceRevision` hold archive/crate content digests, not authenticated upstream commit IDs. SQLite's official 3.53.4 source ID is `bf7c7f30031888f4e796e429ab3978879485813aaca6f641c7b33e4e09459bcc`; BLAKE3's 1.8.7 release points to `f3149ec`. [SQLite release history](https://sqlite.org/changes.html), [BLAKE3 release](https://github.com/BLAKE3-team/BLAKE3/releases/tag/1.8.7).

## Advisory findings and applicability

### Open dependency finding: aligned allocation

Debian marks GCC **12.2.0-14+deb12u1** vulnerable to **CVE-2026-95619**. Inspection of the exact Linux pack `libstdc++.so.6` showed unchecked `(size + alignment - 1) & -alignment` followed by `aligned_alloc`, matching the code changed by GCC's fix. This is not the unaffected `posix_memalign` branch. Both architectures retain it; x64 `llc`, `opt`, and `lld` import `_ZnwmSt11align_val_tRKSt9nothrow_t`.

The inspected pack hashes are x64 `c8fdeb11f43c3048e64eb78fac3f8607887fa449c539395857a19142efadac30` and ARM64 `3d946ce5b640ad3034e4ca45ed7865130bb062771ca4e83a8bf13b107d18bf0c`. They match the candidate descriptors. Disassembly inspected `_ZnwmSt11align_val_t`: x64 function at `0xa9600`, ARM64 at `0xa2d70`. The relevant byte-inspection command is:

```sh
tar -xOzf PACK lib/libstdc++.so.6 |
  llvm-objdump -d --disassemble-symbols=_ZnwmSt11align_val_t -
```

This establishes affected runtime code and linked callers, not an exploit through August source. Recheck optional C++ packages retaining this GCC runtime when replacing it. **CVE-2026-102010** concerns PBDS template code; the shipped runtime DSO alone does not establish that header implementation is present in an application. [GCC allocation fix](https://github.com/gcc-mirror/gcc/commit/59d235ffa5a69231eb42e5290d52dc8c90d28b7a), [Debian allocation record](https://security-tracker.debian.org/tracker/CVE-2026-95619), [PBDS record](https://security-tracker.debian.org/tracker/CVE-2026-102010).

### Retained source with excluded or unresolved paths

**libtasn1 CVE-2025-13151** affects `asn1_expand_octet_string`; upstream **4.21.0** fixes it. GnuTLS's bundled **4.20.0** helper retains the affected name buffer. No GnuTLS call site was found, and the measured macOS GnuTLS library does not export the helper. The trigger requires caller-supplied ASN.1 definition names. Record the source advisory and inspect Linux symbols/callers before claiming exclusion on those binaries. No reachable August trigger was established. [GNU libtasn1 release](https://lists.gnu.org/archive/html/info-gnu/2026-01/msg00003.html).

**zlib CVE-2026-85091** includes the pinned **1.3.2** source, but concerns nonblocking `gzwrite`/`gzprintf` and `gz_vacate`. The August adapter exposes only compression/inflation; the measured macOS adapter has no `gz*` symbols. The same Linux static-link recipe supports exclusion, but Linux symbol inspection remains necessary to make the same binary-level claim. **CVE-2026-27171**, negative lengths passed to `crc32_combine64`/`crc32_combine_gen64`, is fixed in **1.3.2**. Debian **1.2.13.dfsg-1** remains affected; the tensor adapter does not expose these combine functions. Keep this distinct from aug-zlib's newer implementation. [85091 record](https://security-tracker.debian.org/tracker/CVE-2026-85091), [upstream fix](https://github.com/madler/zlib/commit/df84af25dc1942490e1d1c899a07619152a46148), [27171 record](https://security-tracker.debian.org/tracker/CVE-2026-27171).

**SQLite's FULL JOIN column-authorizer bypass** is fixed only on trunk for the upcoming **3.54.0**. August's adapter permits every `SQLITE_READ`; it implements no column restriction for this defect to bypass. It separately rejects ATTACH/DETACH/PRAGMA and disallowed statement actions. Do not market that authorizer as column-level authorization. [SQLite maintainer explanation](https://sqlite.org/bugs/info/a72f9c9f1c028ef2e1db3ae87c22cdd7bdef0bea0583b004154f714b787ce938).

### Fixes already included in the pins

| Component | Reviewed advisory result |
| --- | --- |
| GnuTLS **3.8.13** | Includes the official April 2026 TLS/certificate fixes, including CVE-2026-33845/33846, CVE-2026-42011/42012/42013 and CVE-2026-3833. [GnuTLS advisories](https://www.gnutls.org/security-new.html). |
| libwebsockets exact revision | Source contains the HTTP/2 HPACK bounds fix for **CVE-2026-19773** and the CBOR buffer/reset changes for **CVE-2026-78161**. [HPACK upstream fix](https://github.com/warmcat/libwebsockets/commit/824151862f37bc72f46d9a3e01d5b9408d313a0b), [CBOR upstream fix](https://github.com/warmcat/libwebsockets/commit/1d44554a1bb262db63ff4e240152a9deecd99054). |
| libpq **18.6** | Includes **CVE-2025-12818**, fixed in 18.1, and **CVE-2026-6477**, fixed in 18.4. The latter's large-object/PQfn API is also absent from the adapter. [12818](https://www.postgresql.org/support/security/CVE-2025-12818/), [6477](https://www.postgresql.org/support/security/CVE-2026-6477/). |
| OpenSSL **3.5.9** | Includes relevant X.509 CRL allocation fix **CVE-2026-35189**. **CVE-2026-84783** affects 4.0, not 3.5; DTLS/QUIC findings have a different surface from libpq TLS over TCP. [September advisory](https://openssl-library.org/news/secadv/20260929.txt). |
| SQLite **3.53.4** | Includes FTS5 fixes **CVE-2026-11822/11824**, shipped in 3.53.2. [Official SQLite CVE table](https://sqlite.org/cves.html). |
| LibTorch **2.14.1** | Beyond checkpoint fixes in 2.6/2.10, FlatBuffer fix in 2.1, and TensorPipe fix in 2.9. The adapter exposes none of these loaders/distributed APIs. [Checkpoint](https://github.com/pytorch/pytorch/security/advisories/GHSA-63cw-57p8-fm3p), [FlatBuffer](https://github.com/pytorch/pytorch/security/advisories/GHSA-g6v3-crfc-cggj), [TensorPipe](https://github.com/pytorch/pytorch/security/advisories/GHSA-2rj9-7h5r-q4h8). |
| BLAKE3 **1.8.7** / Rust **1.98.1** | The malicious arrayref **0.3.10** is absent: BLAKE3 removed arrayref. Rust 1.98.1 fixes the 1.98.0 vtable miscompilation. Shlex **2.0.1** is beyond its quoted-string advisory's 1.3.0 fix. [BLAKE3 release](https://github.com/BLAKE3-team/BLAKE3/releases/tag/1.8.7), [Rust incident](https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/), [Rust patch](https://blog.rust-lang.org/2026/09/03/Rust-1.98.1/), [shlex advisory](https://github.com/comex/rust-shlex/security/advisories/GHSA-r7qv-8r2h-pg27). |
| tar **7.5.22** | Beyond recursive-selection DoS fix **7.5.21**, decompression/parse DoS fix **7.5.19**, and hardlink escape fix **7.5.7**. Archive integrity/member guards remain independent requirements. [Recursive selection](https://github.com/isaacs/node-tar/security/advisories/GHSA-r292-9mhp-454m), [parse DoS](https://github.com/isaacs/node-tar/security/advisories/GHSA-23hp-3jrh-7fpw), [hardlinks](https://github.com/isaacs/node-tar/security/advisories/GHSA-34x7-hfp2-rc4v). |
| Website inputs | DOMPurify **3.4.16** includes its September IN_PLACE fixes; KaTeX **0.18.2** includes the inherited-options fix; Mermaid **12.1.0** is beyond the affected 11.x prototype-pollution range. [DOMPurify](https://github.com/cure53/DOMPurify/security/advisories/GHSA-p98j-92pf-mc4p), [second IN_PLACE fix](https://github.com/cure53/DOMPurify/security/advisories/GHSA-6688-9rhm-gjv2), [KaTeX](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7), [Mermaid](https://github.com/mermaid-js/mermaid/security/advisories/GHSA-3rrr-jr9j-h3q3). |
| Maintainer tools | Vite **6.4.3** includes Windows dev-server path fix **CVE-2026-53571**; sharp **0.35.5** prebuilts include librsvg **2.63.2** fixing **CVE-2026-96889**. A globally selected librsvg requires its own version check. [Vite](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff), [sharp](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w). |

**Compiler-only ICU/XZ:** ICU **70.1-2ubuntu1** still matches **CVE-2025-5222**, but the affected \`genrb\` tool is absent; the pack retains only three ICU libraries. XZ **5.4.1-1+deb12u2** includes Debian's fixes for **CVE-2025-31115**, **CVE-2026-34743**, and decoder reinitialization issue **TEMP-1147318-639065**. Do not classify the Debian backport by upstream 5.4.1 alone. [Ubuntu ICU record](https://ubuntu.com/security/CVE-2025-5222), [Debian XZ 31115](https://security-tracker.debian.org/tracker/CVE-2025-31115), [34743](https://security-tracker.debian.org/tracker/CVE-2026-34743), [reinitialization record](https://security-tracker.debian.org/tracker/TEMP-1147318-639065).

No applicable advisory was identified in the reviewed GMP **6.3.0** and Nettle **3.10.2** release/source records. This is a scoped search result, not a proof of absence. LWS HTTP3 enables async DNS in the generated configuration, so a nominal CMake option set to OFF cannot justify excluding its DNS parser. [GMP release](https://gmplib.org/gmp6.3), [Nettle release notes](https://github.com/gnutls/nettle/blob/master/NEWS).

The Node July advisory covers HTTP/2, permission-model, TLS-agent, DNS, SQLite and zlib issues. August's native HTTP server and SQLite adapter do not use Node's HTTP/2 server or `node:sqlite`; this distinction does not excuse using an outdated Node executable for the CLI.

## Redistribution and deployment obligations

The implementation preserves concrete materials: [LLVM preparation](../../scripts/prepare-llvm-tools.mjs) copies LLVM/LLD/component licenses; [pack assembly](../../scripts/build-llvm-pack.mjs) verifies tools and runtime members; [Linux preparation](../../scripts/prepare-linux-runtimes.mjs) includes exact source archives, Debian patches, copyright texts, GPL/LGPL texts and GCC Runtime Library Exception. Runtime search-path changes are documented. [Runtime components](../../scripts/runtime-components.mjs) retain native sources, adapter sources and rebuild recipes. Deployment copies selected libraries and their sources/notices under `share/august-native/`.

| Component | Obligation and present evidence |
| --- | --- |
| LLVM tools | Preserve Apache 2.0 with LLVM exceptions and applicable legacy/component notices. Automatically embedded-code exceptions are not blanket permission to omit notices from redistributed tools. License collection is implemented. [LLVM policy](https://llvm.org/docs/DeveloperPolicy.html#license). |
| GnuTLS/minitasn1; Nettle/GMP/bundled unistring | GMP/Nettle's LGPL 3-or-later route governs those shared libraries, beyond GnuTLS core's LGPL 2.1-or-later designation; retain the applicable file-level terms. Dynamic replaceable libraries, corresponding sources, notices and rebuild instructions are present. Preserve them in deployments and respect replacement/reverse-engineering rights; selecting a dual GPL option would change obligations. [GnuTLS license](https://www.gnutls.org/manual/html_node/License.html), [GMP copying](https://gmplib.org/manual/Copying), [Nettle](https://www.lysator.liu.se/~nisse/nettle/), [GNU LGPL](https://www.gnu.org/licenses/lgpl-3.0.html). |
| GCC runtimes | The Runtime Library Exception permits eligible compiled-code combinations; it does not waive obligations when redistributing the runtime itself. Exact source/patch/license materials accompany the DSOs. New patches require updated corresponding-source and modification records. [GCC library license](https://gcc.gnu.org/onlinedocs/libstdc++/manual/license.html). |
| PostgreSQL/OpenSSL | Preserve PostgreSQL copyright/permission text and OpenSSL Apache 2.0 terms, applicable NOTICE and modification notices. The reviewed macOS archive contains COPYRIGHT and Apache text; no upstream OpenSSL NOTICE file was found in its pinned source. Repeat material/member verification on final Linux artifacts. [PostgreSQL license](https://www.postgresql.org/about/licence/), [Apache terms](https://www.apache.org/licenses/LICENSE-2.0). |
| LibTorch/OpenBLAS/Arm Compute/OpenMP | Collected component notices are retained; ARM64 recipes retain exact OpenBLAS/Arm Compute source inputs. PyTorch's BSD text alone does not cover its embedded closure. Final inventory reconciliation remains open as described above. [OpenBLAS license](https://raw.githubusercontent.com/OpenMathLib/OpenBLAS/v0.3.34/LICENSE), [Arm Compute release](https://github.com/ARM-software/ComputeLibrary/blob/v53.2.0/README.md). |
| BLAKE3/Rust | License copies for all nine locked crates and Rust std are present in the measured macOS notice tree. Preserve the selected CC0/MIT/Apache terms and any LLVM exception texts that apply. [Exact crate/release](https://github.com/BLAKE3-team/BLAKE3/releases/tag/1.8.7). |
| SQLite/zlib/GPU | SQLite core is public domain; zlib retains its license and requires altered source to be identified. Metal/Foundation remain host dependencies rather than shipped framework copies. [SQLite dedication](https://www.sqlite.org/copyright.html), [zlib license](https://zlib.net/zlib_license.html). |
| JavaScript and website | CLI/VSIX archive dependency licenses are retained; wiki dependencies have MIT, Apache, or dual MPL/Apache terms. Preserve required notices for browser-distributed code, choosing the applicable permitted license. The final website bundle's complete notice set was not separately audited here. |

Host glibc/macOS/framework security updates remain application deployment requirements. A glibc ABI floor of 2.36 is not a statement that an unpatched 2.36 installation is acceptable. Maintainer Apple SDK terms, system frameworks and shipped August/LLVM binaries have different distribution scopes.

## Compiler qualification record still required

After any remediation, freeze the new candidate and run existing producer/consumer/package/editor/native-library gates on all supported targets. Retain exact versions, SHA-256 values, compiler provenance, ABI/closure checks and notice/member evidence. Verify Linux excluded zlib/minitasn1 paths, actual container Node/glibc patch versions, and final deployment notices. Treat PyTorch's pending redistribution review separately from compiler/library behavioral tests.

This was a targeted primary-source review of the declared inputs and selected concrete advisories. It did not exhaustively correlate every npm transitive package, statically embedded LibTorch component, host OS package or unpublished vulnerability. No npm audit result was used as a claim of broad safety. Compiler acceptance, finite runtime tests, advisory applicability and license review remain separate evidence.

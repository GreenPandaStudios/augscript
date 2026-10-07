# LibTorch redistribution audit for the 1.0 candidate

Reviewed on 2026-10-06. This is a bounded engineering audit of the CPU native package. It records actual archive contents, source identities, known attribution gaps, and a proposed release gate. It is neither legal clearance nor an exhaustive inventory of code statically incorporated by upstream.

## Current status — 6 October 2026

The package now selects [source e2b74b1](https://github.com/GreenPandaStudios/aug-pytorch/tree/e2b74b1968fb11972e260ef3796a1cd849c1f702). Its source identity includes retained notices and rebuild materials. Source-owned closure reconciliation and paired tamper controls passed on all three real archives in [run 37532031075](https://github.com/GreenPandaStudios/aug-pytorch/actions/runs/37532031075); [the final pin checkpoint](https://github.com/GreenPandaStudios/aug-pytorch/actions/runs/37533868559) also passed. Linux includes the GCC aligned-allocation backport with its sources, licenses, patch and reproducible recipe. Every shipped upstream LibTorch DSO remains byte-identical to the selected official distribution.

The retained archives are macOS ARM64 `f345b9d52c2614abdd02ca3dd60c7a2c1fe530b7a36c84da1f7399fd0a107a0a`, Linux x64 `3907dcab58256f216016f0fa4ed0e56f9884c99605ce9597eefe5c46bfa72077`, and Linux ARM64 `b5991acfad3ab45adffac749dd3dda2bea746835b83335914ee0cfff1c3d6d60`. Publication and ordinary-import checks against the final compiler remain separate gates. This reconciliation is not an exhaustive binary SBOM or legal clearance.

**The investigation below is the pre-repair baseline.** Its missing-notice and source-identity observations explain the changes and must not be read as the current candidate status.

## Scope and result

The package source baseline is [aug-pytorch `e87f57af25ac17662c6299224815d3fd1464ad3e`](https://github.com/GreenPandaStudios/aug-pytorch/tree/e87f57af25ac17662c6299224815d3fd1464ad3e). Its `aug-package.json` declares package 0.2.0, compiler 1.0.0, and three CPU artifacts retained from v0.1.4. Those archives are interim evidence: the Linux GNU runtime is being rebuilt separately, and no result below qualifies the replacement archives.

The three existing archives pass their complete archive digests and every regular file indexed by `files.json`. All 43 files named by the collected component-notice inventory match their recorded hashes in the source tree and in each archive. That establishes integrity of the collected materials; it does not establish that the collection covers each platform.

The remaining gap is real. The notice inventory explicitly describes macOS ARM64. Linux x64 enables MKL and oneDNN and incorporates FBGEMM/assembler surfaces that require additional materials. Linux ARM64 carries more notices from its official wheel, but that wheel's filename glob omits some nested notices. Keep `redistribution-review-incomplete` until those gaps and the final rebuilt closure are reconciled.

Baseline sources: [manifest](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/aug-package.json), [notice scope](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/licenses/README.md), and [per-file provenance](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/licenses/provenance.json).

## Authenticated package archives

| Target | Public artifact | SHA-256 | Bytes | Indexed files checked |
| --- | --- | --- | ---: | ---: |
| macOS ARM64 | [v0.1.4 archive](https://github.com/GreenPandaStudios/aug-pytorch/releases/download/v0.1.4/native-macos-arm64.tar.gz) | `a130f4a67b574456e5eb0538dc099cb99e5356fdb47ebd4926da6f9b65ccb1e1` | 92,487,957 | 56 |
| Linux x64 | [v0.1.4 archive](https://github.com/GreenPandaStudios/aug-pytorch/releases/download/v0.1.4/native-linux-x64.tar.gz) | `e39d75858c158af03bae161d54b3a267b4fcf3dc4568be6467df72e472793f7b` | 207,516,626 | 69 |
| Linux ARM64 | [v0.1.4 archive](https://github.com/GreenPandaStudios/aug-pytorch/releases/download/v0.1.4/native-linux-arm64.tar.gz) | `8eb7c5e30635949228548208bda1ac0a7c42801d2299a90ea4d4c2064e700573` | 205,707,311 | 166 |

Each archive also contains `files.json` itself. The macOS archive came from the local verified cache; the two Linux archives were fetched from these public release URLs and inspected in memory. No signed redirect URL was recorded.

All three record build checkout `178e1c59369ef26ba699a2bd639c37eb934632a6`, build-input digest `9753a09be77a32af3c20a975bdefaf0c37e54be43e1ac80e0411ed45afbfd163`, and adapter source digest `c89f74e1c5686d5bf8efbd990972c619c3cc399c4306f27b580974f12f69fdf1`. These historical identities must remain distinct from the reviewed 0.2.0 source and the eventual rebuilt candidate.

The inspected baseline notice inventory has SHA-256 `e0e3975a7a8ab257dba57e93a6224c79211f76073fa9fb30b2453867253fbeea`; its README has `43707e8efe6804d6101298f5a04556fc118fb906fcf4a99c219caad67c33e954`.

## Upstream inputs and original loader contracts

PyTorch identifies upstream revision `5c4886908584029761b579af026dcfb627c84070`. Both inspected Linux wheels' `torch/version.py` identify that revision. The Linux inputs below were independently downloaded and checked against their exact SHA-256 before inspecting their binaries. The macOS input/wheel correspondence is an existing recorded investigation; this audit rechecked the resulting artifact and notices, without independently repeating the macOS upstream download or conda normalization.

| Input | SHA-256 | Verification in this audit |
| --- | --- | --- |
| [macOS LibTorch ZIP](https://download.pytorch.org/libtorch/cpu/libtorch-macos-arm64-2.14.1.zip) | `6ab4e92bed813981cb26434db0ea12aaae7ce7c548d031a5b25032a286de1b58` | Recorded lock; download not repeated |
| [associated macOS wheel](https://download-r2.pytorch.org/whl/cpu/torch-2.14.1-cp312-cp312-macosx_14_0_arm64.whl) | `9cf3082d25560efb1eef921871595227c0cf305abb7761ca45b6b988ef6cdd45` | Existing recorded correspondence |
| [Linux x64 LibTorch ZIP](https://download.pytorch.org/libtorch/cpu/libtorch-shared-with-deps-2.14.1%2Bcpu.zip) | `0f02329a5266153cffa9dc12926ff2221fa626207b894d40bd61905cc2079821` | Download, hash, original ELF inspection |
| [associated Linux x64 CPU wheel](https://download-r2.pytorch.org/whl/cpu/torch-2.14.1%2Bcpu-cp311-cp311-manylinux_2_28_x86_64.whl) | `5e38154c8896d426a5df58bf2276b603e82184dfae4f54d77dbb212f36e34f37` | Download, published-index hash, notices/configuration |
| [Linux ARM64 CPU wheel](https://download-r2.pytorch.org/whl/cpu/torch-2.14.1%2Bcpu-cp311-cp311-manylinux_2_28_aarch64.whl) | `36a03a3f87ec875ca39c8e29eccbaf0fc704605f78a3f7f179f157048c3c395e` | Download, hash, original ELF inspection |

Source locks: [macOS input](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/sources.lock.json), [Linux inputs](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/linux-libtorch.lock.json), and [official wheel index](https://download.pytorch.org/whl/cpu/torch/).

The original x64 ZIP already has `DT_RPATH=$ORIGIN`, no `DT_RUNPATH`, and ordinary `libgomp.so.1` dependencies. The original ARM64 wheel has `DT_RUNPATH=$ORIGIN`, no `DT_RPATH`; its CPU, c10, OpenBLAS and Arm Compute libraries already use that layout. These upstream DSOs can be copied without an August loader rewrite.

| Original upstream DSO | SHA-256 |
| --- | --- |
| x64 `libc10.so` | `34e3830d7529dcf4d6072ae9930f5b95ee08edb60b410d471cf5e629de686fb8` |
| x64 `libtorch_cpu.so` | `5fe351a59d2ede41a4c203a4474577321a4c135dd7206c25ec97bad813580999` |
| ARM64 `libc10.so` | `a6b9e6a5a070196e975d6d71bfb0459b7a86b85fd78a9d54e2b884e9d7a990b1` |
| ARM64 `libtorch_cpu.so` | `2befcd2b97a282fb2f2cc0ce069f9943dd12c67cf88ab41c17824966f750e14d` |
| ARM64 `libarm_compute.so` | `0ced99eae0b50433b3dc62146a915a64cdf41e8f760114899b62a244ac9f2c82` |
| ARM64 `libarm_compute_graph.so` | `52d09a8bd651415cb93e68b66759201288b5ae323643aef5bdf4c00f310d4334` |
| ARM64 `libopenblas.so.0` | `55da8b468e2734b2704725480c2d93c7e2b90fb91812ec91e0935316a6769756` |

The x64 CPU DSO requires `libc10.so`, `libgomp.so.1`, `libstdc++.so.6`, `libgcc_s.so.1`, `librt.so.1`, `libdl.so.2`, `libpthread.so.0`, `libm.so.6`, `libc.so.6`, and `ld-linux-x86-64.so.2`. ARM64 requires the corresponding ordinary system/loader names plus `libopenblas.so.0`, `libarm_compute.so`, and `libarm_compute_graph.so`; its loader is `ld-linux-aarch64.so.1`.

The x64 wheel and LibTorch ZIP are associated upstream distributions, not interchangeable byte identities. For example, wheel c10 is `9c142dbe5f1c5291e57605586bf22eaa07cd27da720825b1cf02fc2f6eb8047e` and wheel CPU is `ba36052e5eb1e47a9bc99a190e5b89381a9ebc581f03209c6caa3fad155199da`. The official [extraction recipe](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/.ci/libtorch/extract_libtorch_from_wheel.py) changes Linux loader metadata. The final package must compare against its declared ZIP or wheel input, not a different distribution's DSO hash.

## Runtime closure and platform constraints

The inspected macOS archive bundles the adapter, c10, CPU tensor library, and LLVM OpenMP. Its recorded loader dependencies use system libc++, libSystem, Accelerate and Apple frameworks. Some framework loads are weak Metal-related loads in upstream; August's declared binding feature remains CPU. These Apple libraries are supplied by macOS, not redistributed in the package. The manifest floor is macOS 14 on ARM64.

Linux x64 bundles six DSOs: adapter, c10, CPU tensor library, libstdc++, libgcc and libgomp. Linux ARM64 bundles eleven, adding Arm Compute and its graph DSO, OpenBLAS, libgfortran and zlib. Both declare glibc 2.36 or later and an ordinary architecture baseline. Musl, Windows, older macOS/glibc and GPU execution are outside this reviewed profile.

The existing Linux archives contain GCC 12.2.0-14+deb12u1 source inputs, Debian patches, copyright files, GPL/LGPL texts, the GCC Runtime Library Exception and build instructions. The ARM64 GNU redistribution record matches every referenced file. The x64 record also describes a prepared `libz.so.1` that is intentionally absent from its final runtime closure. Its other referenced files match. A final receipt must distinguish prepared inputs from shipped files; an unused input is not a missing deployment dependency.

The retained GCC source archive is `b8298be16aeeb96a889c6afed0a8e2241b47452e89cc81fe65ea849d5c740fcb`; Debian patches are `59f7f7763a0c355e3f27ff9e7ac80d06382b29939361a87e7b139226bfe7402e`. The new runtime backport needs its own patch hash, corresponding-source materials, reproducible build instructions and final DSO identities. This audit does not qualify that replacement.

ARM64 also retains the exact Arm Compute 53.2.0 source, revision `7b256bb7965f2fd99cdee790a4b0e56dab438a8c`, archive SHA `6006a52b3ef375a728af688a743cddf8d031acab9e8a2b1076308116365c5eee`; and OpenBLAS 0.3.34 archive SHA `cd7e129868320cc2d033afa920e31202dfe0b8066a5b66661900ccc0f197dfed`. Those actual archived source hashes and copied notices pass. Sources: [GNU input lock](https://github.com/GreenPandaStudios/aug-pytorch/blob/e87f57af25ac17662c6299224815d3fd1464ad3e/native/linux-runtimes.lock.json), [Arm Compute source](https://github.com/ARM-software/ComputeLibrary/tree/7b256bb7965f2fd99cdee790a4b0e56dab438a8c), and [OpenBLAS license](https://raw.githubusercontent.com/OpenMathLib/OpenBLAS/v0.3.34/LICENSE).

## Concrete missing materials

The x64 ZIP configuration enables MKL and oneDNN. ARM64 enables oneDNN with Arm Compute and disables MKL. Both disable Eigen sparse support. Binary name probes also find FBGEMM, assembler and Eigen references, but a name alone does not establish that a particular implementation or source file is linked. Reconcile those observations with compiled configuration and the pinned build recipes. In particular, do not carry the macOS inventory's Eigen exclusion into Linux without evidence.

Linux x64 currently lacks the following component texts. ARM64 already retains the FBGEMM, ideep and oneDNN root texts through `licenses/libtorch-wheel`, but lacks the separately named assembler/nested notices. Exact upstream source-tree queries resolved PyTorch's submodule identities before fetching these texts.

| Component and required reconciliation | Exact official source | Notice SHA-256 |
| --- | --- | --- |
| FBGEMM root license | [`bf6dce360a4fe133bc779e2fd036277678509f95/LICENSE`](https://raw.githubusercontent.com/pytorch/FBGEMM/bf6dce360a4fe133bc779e2fd036277678509f95/LICENSE) | `12c2370ec32e78115dcd71ba22cdcb1297320fdc4ade81f798136d42357c58b8` |
| Nested asmjit, omitted by the wheel's LICENSE glob | [`a3199e8857792cd10b7589ff5d58343d2c9008ea/LICENSE.md`](https://raw.githubusercontent.com/asmjit/asmjit/a3199e8857792cd10b7589ff5d58343d2c9008ea/LICENSE.md) | `8fc74133788bc8a7aa94168e9913a2d0b0e3f0a6064a0e72a0f1206d5ce9189e` |
| ideep header attribution | [`e087b6e4b32a7ba684db82231d1558123968ac1d/LICENSE`](https://raw.githubusercontent.com/intel/ideep/e087b6e4b32a7ba684db82231d1558123968ac1d/LICENSE) | `a26add03107a53a605a89711b9b7dbd4f5dd668ae193a912e01a879366a23b0e` |
| oneDNN root license | [`80afa71049cd69a3df32adcccb623b12cd7baa22/LICENSE`](https://raw.githubusercontent.com/uxlfoundation/oneDNN/80afa71049cd69a3df32adcccb623b12cd7baa22/LICENSE) | `e9fc874fc09801b9acf3411ba72394098473704d832d713404b6c4861a086318` |
| oneDNN Xbyak CPU assembler attribution; review per architecture | [same revision, `third_party/xbyak/COPYRIGHT`](https://raw.githubusercontent.com/uxlfoundation/oneDNN/80afa71049cd69a3df32adcccb623b12cd7baa22/third_party/xbyak/COPYRIGHT) | `f8ddc1b38c2ba3d472abe83d66bd5bad6206e9fe50ac33ea3872069056beb8e2` |
| oneDNN ITT instrumentation; review actual build selection | [same revision, `third_party/ittnotify/LICENSE.BSD`](https://raw.githubusercontent.com/uxlfoundation/oneDNN/80afa71049cd69a3df32adcccb623b12cd7baa22/third_party/ittnotify/LICENSE.BSD) | `51e80f0261cdc1962e9b9a1c80f9aa6a7adf0b05f0f217caf59141f59b2ad1c1` |
| Intel MKL binary redistribution license, x64 | `mkl_static-2024.2.0.dist-info/LICENSE.txt` in the verified Intel wheel below | `7721633d0ddff43fae25ebfd405f8166a0ce730cbcec44f2f3ad9d5eb8ac9a6f` |

These text hashes were independently checked against official upstream responses. No component files were added to the package by this audit. Keep nested/header notices conservatively where the relevant CPU build incorporates them, and record any exclusions with actual configuration evidence. The wheel's copied development/GPU/test texts are additional supplied materials, not evidence that those components belong to the CPU runtime.

### ARM64 assembler notices and retained audit materials

The pinned oneDNN tree also vendors `third_party/xbyak_aarch64`. Its complete source/header copyright blocks name Fujitsu and use Apache 2.0; the official wheel's license-filename glob does not retain these blocks. The ARM64 package therefore needs this attribution in addition to oneDNN's root license. The audit inspected all 22 `.h`/`.cpp` files in that subtree against their exact Git blob identities, collected four distinct complete notice blocks from 21 files, and recorded the version-constant header's absence of a license comment. Example primary sources: [implementation header](https://raw.githubusercontent.com/uxlfoundation/oneDNN/80afa71049cd69a3df32adcccb623b12cd7baa22/third_party/xbyak_aarch64/src/xbyak_aarch64_impl.cpp) and [public header](https://raw.githubusercontent.com/uxlfoundation/oneDNN/80afa71049cd69a3df32adcccb623b12cd7baa22/third_party/xbyak_aarch64/xbyak_aarch64/xbyak_aarch64.h).

Authenticated texts are retained locally under `.aug-build/libtorch-redistribution-audit` in the root August worktree. This ignored directory is research input, not a published package asset. Copy the reviewed materials into maintained package sources and regenerate their inventory before release.

| Retained relative path | Receipt |
| --- | --- |
| `fbgemm/LICENSE`, `asmjit/LICENSE.md`, `ideep/LICENSE` | `upstream-notices.json` |
| `onednn/LICENSE`, `onednn/xbyak/COPYRIGHT`, `onednn/ittnotify/LICENSE.BSD` | `upstream-notices.json` |
| `onednn/xbyak-aarch64-NOTICES.txt` | `onednn/xbyak-aarch64-provenance.json` |
| `mkl-static-2024.2.0/LICENSE.txt` | `mkl-static-2024.2.0/provenance.json` |

The ARM64 aggregate SHA-256 is `d8d96b70e6ec55a941c5bacaed035da17f7d88317ee4ab032e903febaf8d1280`. Its receipt records each source SHA-256 and Git blob SHA-1, complete comment extraction, deduplication, and the one explicit omission. No implementation is copied into this aggregate. The other retained text hashes appear in the preceding table and were rechecked after writing the local copies.

### Intel MKL boundary

The pinned [PyTorch installation recipe](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/.ci/docker/common/install_mkl.sh) selects `mkl-static 2024.2.0` and matching headers. Its recipe SHA is `438368adc8934f2f65219af639d911eace2b6e9e42b19c204b4acd0faca1132d`.

The [Intel-published wheel](https://files.pythonhosted.org/packages/c1/44/42ea3ad7bbaa65acb54c977961118d7b24ea687e7c3d64aba0a019cbfa19/mkl_static-2024.2.0-py2.py3-none-manylinux1_x86_64.whl) was downloaded in full: 212,863,789 bytes, SHA-256 `8c2a6c6a144c5619f1df75fd550b32730f3e0632b55a15a42a95516e142ccf47`, matching its [published package metadata](https://pypi.org/pypi/mkl-static/2024.2.0/json). It contains the October 2022 Intel Simplified Software License. That text permits binary redistribution subject to reproduction of its notices and terms, and restricts modification and reverse engineering. Use the bundled license; Intel's [license index](https://www.intel.com/content/www/us/en/developer/articles/license/end-user-license-agreement.html) explains why a generic current license is not a substitute.

The existing August Linux recipe runs `patchelf` on upstream DSOs. Preserve the declared upstream LibTorch DSO bytes in the replacement build and supply their already ordinary runtime names. Record separately that the upstream LibTorch extraction itself altered ELF loader metadata. This removes August's additional modification; it does not establish the entire upstream licensing chain or the legality of arbitrary consumer redistribution. The exact MKL-linked build identity and copied attribution remain required review facts.

## Existing protections and the final reconciliation gate

The existing package already hashes source/header/descriptor/recipe inputs, inspects loader dependencies, records final DSO hashes, hashes archived files, and supplies notice/source directories. August's `src/native-artifacts.ts` verifies declared archive files and passes every non-library indexed member into deployment metadata; `src/llvm-native.ts` copies it beneath `share/august-native/<artifact digest>`. Reuse those paths.

Add a package-specific, deterministic reconciliation record and checker before release assembly:

1. Pin the reviewed package source, compiler qualification identity, upstream archives, component revisions and collected-notice inventory. Record a separate sorted digest for notice and corresponding-source materials: the current `native/source-identity.mjs` excludes `licenses`, and extension filtering omits some text inputs.
2. Enumerate each target's final bundled DSOs and permitted system dependencies from actual ELF/Mach-O inspection. Compare this set with the manifest's runtime list. Check platform floors and relative loader resolution; fail on an unexplained dependency.
3. For every copied upstream DSO, record the input archive/member, original SHA, final SHA, and either an unchanged result or an explicit transformation. Require unchanged upstream LibTorch bytes for this replacement profile. Treat generated adapters and the patched GNU runtime as separate build products.
4. Map known shared, static and header components to exact notice paths/hashes and source evidence. Resolve the listed Linux gaps before accepting the receipt. Unknown or omitted scope must be explicit and prevent a broad completeness claim.
5. Record GNU prepared inputs separately from deployed runtime members. Include actual backport patches and corresponding-source/build materials. Check all material hashes against the final archive, rather than relying on a preparation record from a previous build.
6. Verify the final archive SHA, its complete file manifest, all mapped notices/source materials, and the reconciliation record using the existing verifier. Check this again after a fresh install and after relocating a complete application bundle; compare retained metadata hashes, not only directory existence.
7. Tie the receipt to the exact new three-target qualification records and immutable publication plan. Changing a DSO, notice, patch, input lock or deployment selection invalidates it.

Use failure controls that remove one required notice, replace a source archive, mutate an upstream DSO, omit a runtime dependency, or alter a backport patch. Each must reject before publication. Keep actual tensor-operation and resource-cleanup qualification separate from attribution evidence.

## Completed and pending

Completed here: three authenticated interim package archives; all indexed file hashes; all 43 collected notice hashes; original Linux input hashes, ELF loader contracts and configurations; retained GNU/source-material reconciliation; exact additional notice identities; exact MKL package/license identity; and a concrete gate design.

Pending: add and reconcile the missing Linux component materials; settle remaining architecture-specific static/header observations; produce and inspect the replacement GNU runtime and archives; prove unchanged declared upstream DSO bytes; generate the proposed reconciliation receipt; and verify complete notice/source preservation in the final installed and relocated packages. A passing bounded gate can report its exact reviewed closure and known component inventory. It must retain its exclusions and avoid claiming legal clearance or an exhaustive SBOM.

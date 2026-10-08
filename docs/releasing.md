# Releasing August

Release the compiler and first-party npm packages together. Full compiler releases also update the extension; editor-only patches can retain the released compiler. npm manifests live in `packages`; canonical code remains in `src` and `runtime`.

## Verify and create artifacts

```sh
node scripts/version.mjs 1.0.0
npm ci
npm --prefix vscode ci
node scripts/bootstrap-native.mjs
node scripts/prepare-llvm-tools.mjs
node scripts/prepare-llvm-maintainer.mjs
node scripts/build-runtime-pack.mjs
node scripts/build-llvm-pack.mjs
node scripts/prepare-qualified-test-tools.mjs --local-compiler
export AUG_LLVM_HOME="$PWD/.aug-build/qualified-test-tools"
export AUG_RUNTIME_PACK="$PWD/.aug-native/llvm/runtime"
npm run version:check
npm run check
npm test
npm run test:reliability -- --profile soak
npm run docs:check
npm run docs:build
node scripts/merge-compiler-packs.mjs .aug-build/release-packs
npm run package:packages
npm run test:packages -- --native
npm run package:extension
npm run test:editor
npm run test:upgrade -- --local-compiler
node scripts/release-artifacts.mjs
node scripts/publish-release.mjs dist/release --verify-only
node scripts/publish-extension.mjs dist/release --verify-only
```

Choose the reviewed release version before running these maintainer commands. `1.0.0` is shown as an example; choose the next reviewed version for a new release. Running these commands does not publish it or establish stability. The merge step requires the exact qualified producer archives and manifests for all three hosts under `.aug-build/release-packs`; `release.yml` obtains them before packaging. Update both changelogs and relevant guides, and commit regenerated docs. The final artifact step combines four installable npm tarballs, a VSIX, compiler packs, offline documentation, package metadata and SHA-256 checksums under `dist/release`. It excludes native caches, private credentials and application build output.

Before a full release tag, the exact main commit runs the 30-minute lifecycle profile on macOS and both Linux architectures. Producer jobs allow 150 minutes for the full regression, sanitizer, performance and soak gates. Assembly receives the same execution budget for its regression suite, packaging and native consumer checks. A timeout is incomplete qualification. Public native consumer checks import the exact reviewed repository commits from `native/library-qualification.json`; an unpublished package tag is not substituted for a source identity. The ordinary installer still verifies the source manifest, artifact and lock.

Before cache tests, maintainers build the current host’s sealed compiler archive and run `prepare-qualified-test-tools.mjs --local-compiler`. That explicit transport checks the archive against the source-owned SHA-256 even when a verified cache already exists. The normal installer then checks the complete file manifest and tool identities. A missing, modified, oversized or linked archive fails; the command does not fall back to a public download. Omit the flag to check the published compiler transport. CI and release preparation use the local transport while the candidate remains unpublished.

## Installed CLI and editor gates

The distribution gates qualify the actual install archives. `npm run test:editor` installs the candidate VSIX in an empty profile, then in another profile containing the checksum-pinned published preview. Both runs use a real VS Code extension host and exercise language recognition, labeled completion, Javadoc hover, import navigation, unsaved diagnostics, applied quick fixes, inferred hints, test discovery, formatting, and setup recovery. They activate the installed extension, not the source development extension.

`editor-qualification.yml` repeats these checks on macOS 14 ARM64 and Linux x86-64/ARM64, using VS Code 1.90.0 and the pinned current editor in `scripts/distribution-inputs.json`. Keep that current pin reviewed and aligned with the workflow matrix. Linux uses a virtual display. Full and editor-only release preparation feed their exact reviewed VSIX into this matrix; a failed editor job blocks the draft. Retained-compiler patches check the older compiler's actual features and report an unavailable doctor command rather than claiming it ran.

`npm run test:upgrade` installs the public preview CLI into a temporary npm prefix, creates and runs a project through LLVM, then replaces the CLI and its packages with the candidate archives. It checks source preservation, lock migration, tests, generated specs, setup, source diagnostics, and a frozen offline run. Native tools and SDK paths are unavailable to its CLI processes. Use `--local-compiler` before publication to substitute the exact unpublished compiler archive through the installed verifier; the report records that transport. Omit it after publication to verify the public download.

The minimum-platform consumer jobs run this CLI gate with Xcode removed or in a Linux image without Git, compilers, and headers. Reports retain archive hashes, compiler/editor versions, host, and individual checks as workflow artifacts. A same-version candidate is recorded as a reinstall check; a release-version increase is needed for upgrade evidence. These finite checks do not qualify every VS Code configuration. Existing producer gates separately require source-level LLVM debugger checks; the editor gate does not claim full variable-view debugging.

## GitHub release

After the reviewed main commit passes all required workflows, dispatch **Create qualified release tag** with the numeric version tag and that full commit SHA. The workflow verifies those facts before creating a tag; see [the tag checks](#create-a-qualified-version-tag). Then dispatch **Prepare release** with the same tag and commit.

`release.yml` validates the tag against every manifest, runs compiler/native/docs/package gates, and uploads artifacts to a **draft release**. Preview versions (`0.x`) are marked as prereleases; a complete version starting at `1.0.0` uses the stable channel. Full compiler releases use numeric `major.minor.patch` versions. RC suffixes are not supported by this path because the extension shares the release version and Marketplace [requires a numeric version](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#prerelease-extensions). A separate RC/editor version policy is deferred. The draft is never published automatically. All producer, clean-consumer and installed-editor gates remain required for either channel. Review the draft and publish it in GitHub Releases. Publishing starts **Publish npm packages** and **Publish VS Code extension** automatically. Each workflow deploys the archives attached to that release. Changing an asset after review invalidates its checksum.

If release preparation fails, **Prepare release** also accepts a manual retry on `main`. Supply the existing version tag and its reviewed full commit SHA. The controller rejects a moved tag or mismatched package, compiler, dependency or root lock version before starting producers. Every build checks out that same commit and repeats the full language, sanitizer, performance, gym and consumer gates; it does not move the tag or reuse unqualified binaries.

The draft job checks the source again before uploading and reads its changelog from the release commit. The retry uses the existing release source and the corrected pipeline.

Native producer jobs use the job's short-lived, read-only GitHub token for public package reads, including tests inside the Linux maintainer container. An unauthenticated shared runner can exhaust GitHub's API quota during the documentation and application suites; a 403 still fails the gate rather than being treated as a successful test.

`ci.yml` checks pushes and pull requests. Linux CI builds the pinned full native stack, runs the native suite, and executes core and crypto apps in the matching runtime image. macOS CI runs the same native suite with its private bootstrap.

A release tag retains its original workflows. A retry must preserve the reviewed source and compare the exact release archives with any existing publication. If a published extension differs from the reviewed VSIX, publish a new version rather than bypassing the comparison.

## npm publication

The release builds official pinned LLVM tools and the August runtime
on macOS ARM64, Linux x86-64 and Linux ARM64 before packaging. Linux producers
use the pinned Debian 12 maintainer image. `scripts/merge-compiler-packs.mjs`
rejects missing, duplicate, stale or modified platform inputs, then records all
exact compiler archive hashes in the CLI and bundled editor compiler. The GitHub
release includes every selected archive.
Maintainers build the runtime. Consumers download it with the reviewed LLVM pack. CI runs the
LLVM execution tests with its prepared toolchain; unsupported platforms produce an error. See [native packages](native-packages.md).
Producer jobs require source breakpoint/variable inspection, actual LLVM ASan
instrumentation with a failing negative control, runtime UBSan, and the frozen
paired C/LLVM performance limits. Each producer also requires the [runtime reliability soak](runtime-reliability.md): a 30-minute optimized lifecycle circuit, exact core allocation and owned-resource balance, burst sanitizer circuits, and independent LLVM results. Consumer jobs exercise an ordinary default
LLVM starter and all four public native repositories without native tools,
including frozen/offline locks, cleanup and relocated deployment bundles.

The packages use the `@greenpandastudios` npm scope. Verify ownership and each package's trusted publisher before a release. GitHub tarballs can also be installed directly.

Configure a trusted publisher for each of the four npm packages:

- Owner: `GreenPandaStudios`
- Repository: `augscript`
- Workflow filename: `publish-npm.yml`
- Environment: `npm`
- Allowed action: `npm publish` (new configurations default to stage publishing)

Use npm CLI 11.5.1+ and GitHub-hosted runners. The workflow grants `id-token: write` for OIDC and needs no stored npm publishing token. Match package repository URLs to this repository. See [npm's trusted publisher instructions](https://docs.npmjs.com/trusted-publishers/).

The job downloads the four reviewed tarballs, `packages.json` and `SHA256SUMS`. It checks every archive's SHA-256 and SHA-512 integrity, exact version and complete manifest against the tagged source before publishing anything.

It checks all existing registry versions, then publishes standard library, web, crypto and CLI in that order with public access. Preview versions use `next`; stable versions starting at `1.0.0` use `latest`. The download gate rejects a GitHub prerelease flag that disagrees with the reviewed compiler version. Lifecycle scripts are disabled. No rebuild or dependency installation runs in the npm deployment job.

Retries skip a version only when its registry integrity matches the release archive. A registry failure or a different published archive stops deployment. Each new publication is checked against the registry before proceeding.

npm may accept an upload several minutes before its public metadata becomes available. The publisher on main checks visibility at five-second intervals for about five minutes per package; it retries only missing-version responses and uploads each archive once. If that wait expires, let npm finish processing before retrying the same release.

The CLI is published last because its dependencies use exact matching versions. An interrupted run can leave some libraries published; retry the same release to finish. Retries leave already-published versions and their dist tags alone. The pipeline derives the channel from the reviewed version before any registry access. It rejects empty or mixed-version package sets. Retries do not move existing dist tags; if a previously published version needs promotion, review and perform that registry change separately.

## Create a qualified version tag

The workflow **Create qualified release tag** accepts a numeric tag and the reviewed full main commit SHA. It verifies the checkout and all full-release package versions. The latest push runs of CI, GNU/Linux qualification and installed-editor qualification must succeed for that SHA. Main push qualification includes the three-host 30-minute soak; truncated or missing evidence rejects the request.

Immediately before creating or accepting a tag, the workflow checks main again. It creates one lightweight tag and verifies its identity. Retries retain a matching tag and reject a different one. It never moves a tag or publishes a release.

GitHub has no atomic comparison of main and tag creation. A simultaneous push can leave the tag on the reviewed qualified source while main advances. The tag still identifies that exact source; release preparation does not follow a moving branch.

GitHub does not start another workflow from a tag written with its workflow token. After the tag succeeds, dispatch **Prepare release** with the same tag and commit. Its producer, consumer and exact-release editor gates remain required before draft creation. Review the draft archives and reports before publication.

## Stable release review

A `1.0.0` version is an intended compatibility promise, not qualification evidence. Before tagging, complete the [required release checks](#verify-and-create-artifacts), update the support and compatibility pages, review dependency notices and advisories, and obtain independent review of the final source. The release pipeline repeats language conformance, the 30-minute runtime soak, worker sanitizers, source debugger checks, safety gyms, performance limits, public native imports, relocation, installed CLI upgrades and both supported editor versions on all three targets. A failed job stops draft creation.

Review the exact compiler, npm, VSIX and documentation archives and retained qualification reports before publishing the draft.

Assembly also publishes the exact `compiler-packs.json` catalog under `SHA256SUMS`. Extension publication verifies this release catalog against the compiler and platform contracts, then requires the bundled catalog to match it exactly. Fresh producer hashes can differ from the immutable source checkout; they must match the assembled release. An editor-only patch derives the catalog from its verified public compiler archive.

The manual **Extract release review files** workflow accepts a successful Prepare release run, its immutable tag and the same full source SHA. It checks the run identity and tag, downloads the existing combined artifact, and runs both publication verifiers before copying its npm archives, VSIX, offline wiki, catalogs and checksums into a compact review artifact. This supports review tools with bounded downloads. The compiler archives remain in the original qualified artifact and release; their checksums remain in the copied manifest.

Publishing a stable draft starts verified npm publication to `latest`; publishing a preview draft starts publication to `next`. Keep the original tag and artifacts for retries. Compiler and runtime source changes require a new version and another qualification run. GitHub's latest-release designation is a separate review choice; preparation does not move it.

## Editor-only patches

Choose an unused extension patch version. For a patch retaining compiler 1.0.0, use `node scripts/version.mjs --extension 1.0.1`; the compiler version stays in `augustCompilerVersion`. Update its changelog, run the contributor checks, and commit the change. Create an `extension-v1.0.1` tag at that reviewed commit and push it. **Prepare extension patch** rejects changes to compiler, runtime, CLI manifest, or bootstrap inputs compared with the retained compiler tag.

The workflow downloads the published compiler's reviewed npm archives and verifies their checksums and manifests. It bundles that exact CLI archive, its matching public standard-library archive, and locked JavaScript dependencies. It compares every compiler file in the VSIX with those verified inputs. It checks editor regressions, documentation, installed npm packages and both installed-VSIX workflows on all three hosts, then creates a draft containing the VSIX, checksums, and `extension-release.json`. The report records both versions, both source commits, and the compiler and VSIX hashes. It builds no native compiler or library artifacts.

Review and publish this draft. **Publish VS Code extension** accepts both full compiler tags and extension tags. **Publish npm packages** ignores extension releases. A manual preparation retry takes the existing extension tag and reviewed full SHA; a publication retry must select that extension tag as its workflow ref. Existing published versions remain immutable.

## VS Code Marketplace

The extension identity is `augscript.augscript`. The workflow uses locked VSCE 4.0.1-1 with `vsce publish --oidc`, requesting a short-lived credential without a stored PAT. [VSCE documents the repository/workflow trust configuration](https://github.com/microsoft/vscode-vsce#trusted-publishing), but the actual Marketplace service rejected the 0.21.0 and 0.23.0 exchanges with “Trusted Publishing is not supported.” The owner published the verified 0.23.0 VSIX through the publisher's Update action; its public contents match the retained GitHub release archive. Automatic uploads remain blocked until Marketplace supports and enables that policy for the publisher. The workflow can verify an already published matching version, and GitHub Releases also provides direct installation.

The preparation job downloads the reviewed VSIX, verifies its checksum, complete manifest, logo and bundled compiler, and installs the locked publishing tool with lifecycle scripts disabled. It passes these files to a separate `marketplace` job with OIDC permission. That job rechecks the VSIX and publishes it with `--packagePath`, so publication does not build another extension or run `vscode:prepublish`.

For retries, the publisher downloads an existing Marketplace version and compares all files under `extension/` with the reviewed VSIX. Marketplace signature metadata outside that directory may differ. A changed, missing or additional extension file stops the retry.

After uploading, the job downloads and verifies the published version, allowing roughly a minute for indexing. If confirmation still fails after an upload, wait for the version to become available and retry. VSIX files remain available from GitHub for direct installation.

The packaging script supplies the repository's `vscode` directory as the HTTPS
base for README images. Verify those URLs are public before Marketplace
publication; a private or not-yet-created repository cannot serve them to other
users. The extension logo and **AugScript: Open Welcome** images are bundled
locally and do not depend on that image host. To update artwork, run
`npm --prefix vscode run artwork` and commit the rendered PNGs.

## Deployment protection and retries

Configure GitHub environments named `npm` and `marketplace`. Allow tags matching `v*` in the npm environment and both `v*` and `extension-v*` in the marketplace environment; use required reviewers if your release process needs another approval. Keep the npm environment name identical to each package's trusted publisher configuration, and the Marketplace policy aligned with its workflow and environment. See [GitHub's environment protection guide](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment). Restrict who can create or move release tags through repository rules.

Both workflows also accept a manual retry. Open the appropriate workflow in Actions, select the release tag as the workflow ref, and enter the same tag in the `tag` input.

A branch ref, mismatched version, draft release or tag moved since the run began is rejected before publication. The tag must contain these publishing workflows and scripts. Re-running the failed job on its original run also retains the exact tagged source. npm and Marketplace have separate concurrency groups and deployment environments, so a failure at one destination can be retried independently.

Release creation uses the repository's `GITHUB_TOKEN` to create a draft. A maintainer must publish that draft through GitHub Releases or their own authorized GitHub CLI session. Events produced only by `GITHUB_TOKEN` do not start another workflow; do not replace this review step with a token-authenticated automatic publish unless you also add an explicit deployment handoff. See [GitHub's workflow trigger rules](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#triggering-a-workflow-from-a-workflow).

If npm reports an authentication failure, check all four package connections, their exact workflow/environment spelling, permission for direct `npm publish`, and OIDC permission. For a Marketplace failure, check the publisher policy and `marketplace` environment. Do not place credentials in workflow files or release assets. The scripts distinguish missing versions from authorization and service errors; investigate the reported error before retrying.

## Documentation deployment

Enable GitHub Pages with **GitHub Actions** as its publishing source. `docs.yml` checks generated pages, builds the same Markdown and deploys through the `github-pages` environment after successful CI on main. Docs remain readable in the repo and offline artifact when Pages is unavailable. See [GitHub's workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Current limits

The supported hosts are macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+; other platforms remain unsupported. Every full release requires the gates described above. User libraries use ordinary public Git repositories, local folders or npm archives, and native library repositories publish prebuilt artifacts. The [native ABI](native-abi.md) defines the supported adapter contract. Marketplace OIDC previously failed at the service boundary; verify its current response and use a reviewed manual upload when necessary. See [release evidence](release-review.md), [library limits](web-library-gaps.md) and [performance](performance.md).

## Native package qualification {#native-preview-qualification}

Before publishing a compiler with native package support, build its LLVM pack
before the npm archives and extension. `scripts/release-artifacts.mjs` checks
that both shipped manifests pin that exact compiler archive. The release job
runs `scripts/qualify-native-consumers.mjs --local-compiler`: it installs the npm
archives, fetches the four native libraries from their public repositories and
release URLs, then runs LLVM programs through URL imports and named aliases.
Git, native compilers, and SDK paths are unavailable to those CLI processes.
Frozen offline runs must preserve the locks and produce the same results.

The release consumer jobs repeat this check on macOS 14 ARM64 and each Linux
architecture. The macOS runner removes Xcode and Command Line Tools. Linux uses
the pinned Node/Debian slim image with no compiler, Git or development headers.
A draft is created only after all consumer jobs pass. A local result on a
newer OS does not qualify the minimum OS. After release publication, omit
`--local-compiler` to verify the compiler download too. Keep the resulting JSON
report with release evidence; never commit artifact caches or generated binaries.

Before library artifacts are public, contributors can pass
`--candidate-libraries DIRECTORY --local-compiler` to the qualification script.
`DIRECTORY` contains the four `aug-*` repository folders and their measured native
archives. This mode installs the same CLI archives and checks each native file
through the installed verifier, but reports local transport and does not claim
repository URL/download acceptance. Public release gates omit this option.
On a small test VM, `--discard-builds` removes verified deployment copies after
their checks while keeping the source, locks, compiler outputs and JSON evidence.

Each library candidate records the build commit and a complete input fingerprint:
August source, the ABI descriptor, headers, native code, dependency locks and
build recipes. Before adding release artifact pins, run
`node native/verify-candidate.mjs PATH_TO_CANDIDATE_JSON` in the library repository.
Run it again after updating the manifest. Only artifact metadata may change;
changed binding or build inputs require a new candidate. Publish the exact tested
archives without rebuilding them. `native/library-qualification.json` records
the reviewed package tag, source commit and archive hash for each consumer host.
A platform without reviewed pins fails qualification before any library download.

The four library repositories keep a `release-candidates.json` record for the
reviewed build run and source commit. Their tag workflow uses the shared release
template under `native/templates` and the canonical assembly/publication scripts
under `scripts`. It downloads that successful run, checks all three platform
archives against the tagged manifest and source identity, then verifies the
uploaded bytes before publishing. Retries accept an existing file only when its
bytes match; they do not overwrite release assets. Keep the scripts in those
repositories aligned when this maintainer protocol changes.

To retry a library release after a publishing-tool correction, run its workflow
on main and enter the existing version tag. The job checks out that immutable tag
for source and manifest verification and uses the current maintainer publisher.
It validates the tagged commit again before creating or changing a release.
Partial uploads remain draft until the complete archive set passes byte checks.

## Container bases

`containers.yml` publishes `ghcr.io/greenpandastudios/aug-build:VERSION` and `ghcr.io/greenpandastudios/aug-runtime:VERSION` after npm publication. It also runs on container-recipe changes to main and can be dispatched manually from main. The version must match the released CLI; preparation checks its public release and npm integrity before building. Pull requests test both architectures without publishing.

The workflow builds on native Linux ARM64 and x86-64 runners. It checks offline compilation, tests/specs, non-root execution, complete deployment bundles, crypto, a real HTTP request and a public SQLite package with owned resource cleanup. Publication loads those exact tested images, uploads each architecture and creates the two architecture-selecting tags. It does not rebuild the compiler or run contributor toolchains. Qualification reports and tested-image archives remain workflow artifacts.

On first publication, set both container packages to **Public** in their GitHub package settings, then retry the publication job. Its final step pulls both architectures without signing in. Their source label links them to this public repository. Subsequent publishing uses the scoped workflow token with packages write access; it does not need a personal token. Versioned tags select a compiler release. Retain the reported image digest for exact deployment identity when a base is rebuilt for runtime updates.

For local verification:

```sh
docker build -f docker/Dockerfile.build -t augscript/build:local .
docker build -f docker/Dockerfile.run -t augscript/run:local .
npm run test:docker
```

These local names are contributor test inputs. Applications use the two published bases in the [Docker guide](docker.md).

A documentation-only correction before publication can rebuild the offline wiki from a separately reviewed documentation revision. Record the immutable compiler tag and full documentation commit in `docs-provenance.json`, then update the wiki archive checksum in `SHA256SUMS`. Keep the reviewed compiler, npm and VSIX bytes. Review the corrected wiki routes, notices and archive before replacing the draft attachments. The live wiki follows its own current main revision.

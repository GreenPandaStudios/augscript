# Releasing August

All first-party packages and the extension use one compiler-compatible version. npm manifests live in `packages`; canonical code remains in `src` and `runtime`.

## Verify and create artifacts

```sh
node scripts/version.mjs 0.20.1
npm ci
npm --prefix vscode ci
node scripts/bootstrap-native.mjs
npm run version:check
npm run check
npm test
npm run docs:check
npm run docs:build
npm run package:packages
npm run test:packages -- --native
npm run package:extension
node scripts/release-artifacts.mjs
node scripts/publish-release.mjs dist/release --verify-only
node scripts/publish-extension.mjs dist/release --verify-only
```

Update both changelogs and relevant guides, and commit regenerated docs. The final artifact step combines four installable npm tarballs, a VSIX, offline documentation, package metadata and SHA-256 checksums under `dist/release`. It excludes native caches, private credentials and application build output.

## GitHub release

After verification and committing, create and push the version tag:

```sh
git tag v0.20.1
git push origin main v0.20.1
```

`release.yml` validates the tag against every manifest, runs compiler/native/docs/package gates, and uploads artifacts to a **draft prerelease**. Review the draft and publish it in GitHub Releases. Publishing starts **Publish npm packages** and **Publish VS Code extension** automatically. Each workflow deploys the archives attached to that release. Changing an asset after review invalidates its checksum.

`ci.yml` checks pushes and pull requests. Linux CI builds the pinned full native stack, runs the native suite, and executes core and crypto apps in the matching runtime image. macOS CI runs the same native suite with its private bootstrap.

The automatic publishers are included starting with `v0.20.1`. Existing tags keep their original workflows; the `v0.20.0` draft does not contain these scripts.

The manually published Marketplace `0.19.0` contains files that differ from the VSIX attached to the `v0.19.0` GitHub release. It is not a matching deployment of that archive. Use a new version for the first automated extension release; do not bypass the content comparison to skip an older mismatch.

## npm publication

The packages use the `@greenpandastudios` npm scope. Verify ownership and each package's trusted publisher before a release. GitHub tarballs can also be installed directly.

Configure a trusted publisher for each of the four npm packages:

- Owner: `GreenPandaStudios`
- Repository: `augscript`
- Workflow filename: `publish-npm.yml`
- Environment: `npm`
- Allowed action: `npm publish` (new configurations default to stage publishing)

Use npm CLI 11.5.1+ and GitHub-hosted runners. The workflow grants `id-token: write` for OIDC and needs no stored npm publishing token. Match package repository URLs to this repository. See [npm's trusted publisher instructions](https://docs.npmjs.com/trusted-publishers/).

The job downloads the four reviewed tarballs, `packages.json` and `SHA256SUMS`. It checks every archive's SHA-256 and SHA-512 integrity, exact version and complete manifest against the tagged source before publishing anything. It checks all existing registry versions, then publishes standard library, web, crypto and CLI in that order with public access and the `next` dist tag. Lifecycle scripts are disabled. No rebuild or dependency installation runs in the npm deployment job.

Retries skip a version only when its registry integrity matches the release archive. A registry failure or a different published archive stops deployment. Each new publication is checked against the registry before proceeding. npm may accept an upload several minutes before its public metadata becomes available. The publisher on main checks visibility at five-second intervals for about five minutes per package; it retries only missing-version responses and uploads each archive once. If that wait expires, let npm finish processing before retrying the same release. The `v0.20.1` publisher checks visibility immediately and may need a retry after each accepted upload; the bounded wait applies to future tags.

The CLI is published last because its dependencies use exact matching versions. An interrupted run can leave some libraries published; retry the same release to finish. Retries leave already-published versions and their dist tags alone. This pipeline publishes preview packages to `next`; promoting a release to `latest` remains a separate maintainer decision.

## VS Code Marketplace

The extension identity is `augscript.augscript`. An owner of the `augscript` publisher must configure a Marketplace trusted publishing policy for `GreenPandaStudios/augscript`, workflow `publish-extension.yml` and the `marketplace` deployment environment. VSCE 4.0.0 supports `vsce publish --oidc` on GitHub Actions; the workflow requests a short-lived credential and does not use a stored PAT or an Azure subscription. See [the shipping VSCE trusted publishing instructions](https://github.com/microsoft/vscode-vsce/blob/v4.0.0/README.md#trusted-publishing). Account-side trust must be configured before the first deployment; adding a workflow does not grant publisher access.

The preparation job downloads the reviewed VSIX, verifies its checksum, complete manifest, logo and bundled compiler, and installs the locked publishing tool with lifecycle scripts disabled. It passes these files to a separate `marketplace` job with OIDC permission. That job rechecks the VSIX and publishes it with `--packagePath`, so publication does not build another extension or run `vscode:prepublish`.

For retries, the publisher downloads an existing Marketplace version and compares all files under `extension/` with the reviewed VSIX. Marketplace signature metadata outside that directory may differ. A changed, missing or additional extension file stops the retry. After uploading, the job downloads and verifies the published version, allowing roughly a minute for indexing. If confirmation still fails after an upload, wait for the version to become available and retry. VSIX files remain available from GitHub for direct installation.

The packaging script supplies the repository's `vscode` directory as the HTTPS
base for README images. Verify those URLs are public before Marketplace
publication; a private or not-yet-created repository cannot serve them to other
users. The extension logo and **AugScript: Open Welcome** images are bundled
locally and do not depend on that image host. To update artwork, run
`npm --prefix vscode run artwork` and commit the rendered PNGs.

## Deployment protection and retries

Configure GitHub environments named `npm` and `marketplace`. Allow only tags matching `v*`; use required reviewers if your release process needs another approval. Keep the npm environment name identical to each package's trusted publisher configuration, and the Marketplace policy aligned with its workflow and environment. See [GitHub's environment protection guide](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment). Restrict who can create or move release tags through repository rules.

Both workflows also accept a manual retry. Open the appropriate workflow in Actions, select the release tag as the workflow ref, and enter the same tag in the `tag` input. A branch ref, mismatched version, draft release or tag moved since the run began is rejected before publication. The tag must contain these publishing workflows and scripts. Re-running the failed job on its original run also retains the exact tagged source. npm and Marketplace have separate concurrency groups and deployment environments, so a failure at one destination can be retried independently.

Release creation uses the repository's `GITHUB_TOKEN` to create a draft. A maintainer must publish that draft through GitHub Releases or their own authorized GitHub CLI session. Events produced only by `GITHUB_TOKEN` do not start another workflow; do not replace this review step with a token-authenticated automatic publish unless you also add an explicit deployment handoff. See [GitHub's workflow trigger rules](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#triggering-a-workflow-from-a-workflow).

If npm reports an authentication failure, check all four package connections, their exact workflow/environment spelling, permission for direct `npm publish`, and OIDC permission. For a Marketplace failure, check the publisher policy and `marketplace` environment. Do not place credentials in workflow files or release assets. The scripts distinguish missing versions from authorization and service errors; investigate the reported error before retrying.

## Documentation deployment

Enable GitHub Pages with **GitHub Actions** as its publishing source. `docs.yml` checks generated pages, builds the same Markdown and deploys through the `github-pages` environment after successful CI on main. Private repositories need an eligible GitHub plan for Pages. Docs remain readable in the repo and offline artifact when Pages is unavailable. See [GitHub's workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Current limits

August is experimental. Native web/crypto bootstrap supports macOS and Linux; other platforms are unverified. npm and Marketplace deployment require owner-configured trust. The first `v0.20.1` Marketplace attempt failed during the VSCE 4.0.0 OIDC token exchange with an API-version error; automated Marketplace publication remains unverified, and the checked VSIX is available from GitHub Releases. User libraries can use public Git repositories, local folders, or npm archives. Prebuilt native dependency releases and a stable external native adapter ABI remain future work. See [the gap ledger](web-library-gaps.md) and [performance assessment](performance.md).

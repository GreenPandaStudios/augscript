# Releasing August

All first-party packages and the extension use one compiler-compatible version. npm manifests live in `packages`; canonical code remains in `src` and `runtime`.

## Verify and create artifacts

```sh
node scripts/version.mjs 0.19.0
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
```

Update both changelogs and relevant guides, and commit regenerated docs. The final artifact step combines four installable npm tarballs, a VSIX, offline documentation, package metadata and SHA-256 checksums under `dist/release`. It excludes native caches, private credentials and application build output.

## GitHub release

After verification and committing, create and push the version tag:

```sh
git tag v0.19.0
git push origin main v0.19.0
```

`release.yml` validates the tag against every manifest, runs compiler/native/docs/package gates, and uploads artifacts to a **draft prerelease**. Review the draft and publish it in GitHub Releases. `ci.yml` checks pushes and pull requests. Linux CI builds the pinned full native stack, runs the native suite, and executes core and crypto apps in the matching runtime image. macOS CI runs the same native suite with its private bootstrap.

## npm publication

The npm scope is `@greenpandastudios`; all four 0.19.0 packages have been published with the owner’s authenticated npm account. All four packages now have the trusted publisher connection below configured for future automated releases. The exact `npx @greenpandastudios/aug-cli@next init hello-august` command has been verified from a fresh temporary directory. GitHub tarballs remain available for offline installation.

Configure a trusted publisher for each of the four npm packages:

- Owner: `GreenPandaStudios`
- Repository: `augscript`
- Workflow filename: `publish-npm.yml`
- Environment: `npm`
- Allowed action: `npm publish` (new configurations default to stage publishing)

Use npm CLI 11.5.1+ and GitHub-hosted runners. The workflow grants `id-token: write` for OIDC and needs no stored npm publishing token. Match package repository URLs to this repository. See [npm's trusted publisher instructions](https://docs.npmjs.com/trusted-publishers/).

Publishing a reviewed GitHub release automatically runs **Publish npm packages**. To retry, dispatch that workflow with the existing verified version tag. It checks out the workflow run’s commit, requires its package versions to match the release tag, and downloads the four archives already checked by the release pipeline. Before any publication, it verifies every SHA-256 checksum, SHA-512 integrity, package identity, exact version and dependency manifest, then publishes in dependency order with lifecycle scripts disabled and the `next` dist tag. No build or dependency install runs in the npm job with publishing credentials. The `npm` environment permits only tags matching `v*`. For manual retries, select a protected `v*` workflow ref containing the publishing implementation and matching package version, and supply the published release tag as the tag input; branch refs cannot publish through this environment. Retries skip a published version only when its registry integrity matches the reviewed archive. Mismatched versions and registry failures other than a missing version fail closed. Already-published versions do not have their dist tags moved by a retry.

## VS Code Marketplace

Extension updates are manual. The release pipeline builds a version-matched VSIX and includes it with the GitHub release artifacts. Upload the reviewed `augscript-VERSION.vsix` through [Manage Extensions](https://marketplace.visualstudio.com/manage/publishers/augscript) when an editor update is needed. Check its SHA-256 against the release's `SHA256SUMS` before uploading. npm publication does not update the Marketplace extension.

The `augscript` publisher profile belongs to August Miller and links to https://augustmiller.info. Version 0.19.0 is public as [AugScript](https://marketplace.visualstudio.com/items?itemName=augscript.augscript). No Marketplace publishing credentials or Entra identity are needed in GitHub Actions.

The packaging script supplies the repository's `vscode` directory as the HTTPS
base for README images. Verify those URLs are public before Marketplace
publication; a private or not-yet-created repository cannot serve them to other
users. The extension logo and **AugScript: Open Welcome** images are bundled
locally and do not depend on that image host. To update artwork, run
`npm --prefix vscode run artwork` and commit the rendered PNGs.

## Documentation deployment

Enable GitHub Pages with **GitHub Actions** as its publishing source. `docs.yml` checks generated pages, builds the same Markdown and deploys through the `github-pages` environment after successful CI on main. Private repositories need an eligible GitHub plan for Pages. Docs remain readable in the repo and offline artifact when Pages is unavailable. See [GitHub's workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Current limits

August is experimental. Native web/crypto bootstrap supports macOS and Linux; other platforms are unverified. Marketplace uploads require the publisher owner’s account. User-authored source packages are supported through npm transport; prebuilt native dependency releases and a stable external native adapter ABI remain future work. See [the gap ledger](web-library-gaps.md) and [performance assessment](performance.md).

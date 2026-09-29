# Releasing August

All first-party packages and the extension use one compiler-compatible version. npm manifests live in `packages`; canonical code remains in `src` and `runtime`.

## Verify and create artifacts

```sh
node scripts/version.mjs 0.18.0
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
git tag v0.18.0
git push origin main v0.18.0
```

`release.yml` validates the tag against every manifest, runs compiler/native/docs/package gates, and uploads artifacts to a **draft prerelease**. Review the draft and publish it in GitHub Releases. `ci.yml` checks pushes and pull requests. Linux verifies installed core programs with the portable task/JSON sources and checks web/crypto imports and editor support. Full native web/crypto gates run on macOS with the pinned native bootstrap.

## npm publication

The intended scope is `@greenpandastudios`. Claim this npm identity or choose an owned scope consistently before the first registry release. Create the initial packages with the owner's authenticated npm account. GitHub tarballs work independently of registry setup.

Configure a trusted publisher for each of the four npm packages:

- Owner: `GreenPandaStudios`
- Repository: `augscript`
- Workflow filename: `publish-npm.yml`
- Environment: `npm`
- Allowed action: `npm publish` (new configurations default to stage publishing)

Use npm CLI 11.5.1+ and GitHub-hosted runners. The workflow grants `id-token: write` for OIDC and needs no stored npm publishing token. Match package repository URLs to this repository. See [npm's trusted publisher instructions](https://docs.npmjs.com/trusted-publishers/).

Run **Publish npm packages** with an existing verified version tag. It checks out that tag, checks types/docs/installed artifacts, then publishes standard library, web, crypto and CLI in dependency order with public access and the `next` dist tag. The `npm` environment can hold owner-configured release protection. Existing versions cannot be overwritten; inspect partial runs before retrying.

## VS Code Marketplace

Confirm ownership of the `augscript` Marketplace publisher. VSIX files can be installed directly. For Marketplace publication, follow [Microsoft's publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) and configure the publisher's Microsoft Entra identity/federation. Publish the verified VSIX with `vsce publish --packagePath ... --azure-credential` using that identity.

The packaging script supplies the repository's `vscode` directory as the HTTPS
base for README images. Verify those URLs are public before Marketplace
publication; a private or not-yet-created repository cannot serve them to other
users. The extension logo and **AugScript: Open Welcome** images are bundled
locally and do not depend on that image host. To update artwork, run
`npm --prefix vscode run artwork` and commit the rendered PNGs.

Global Azure DevOps PATs retire on December 1, 2026; this project does not introduce a new long-lived Marketplace PAT. Marketplace identity setup is an external owner prerequisite.

## Documentation deployment

Enable GitHub Pages with **GitHub Actions** as its publishing source. `docs.yml` checks generated pages, builds the same Markdown and deploys through the `github-pages` environment after successful CI on main. Private repositories need an eligible GitHub plan for Pages. Docs remain readable in the repo and offline artifact when Pages is unavailable. See [GitHub's workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Current limits

August is experimental. Native web/crypto bootstrap currently targets macOS; other platforms are unverified. Registry and Marketplace identities require owner configuration. User-authored source packages are supported through npm transport; prebuilt native dependency releases and a stable external native adapter ABI remain future work. See [the gap ledger](web-library-gaps.md) and [performance assessment](performance.md).

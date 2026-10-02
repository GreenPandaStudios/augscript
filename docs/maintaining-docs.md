# Keeping documentation current

Documentation is part of a language change. Edit the canonical wiki in `docs` and review it with the compiler change. GitHub Pages renders those files.

For writing and navigation, use [the editorial guide](writing-docs.md). The repository's `.agents/skills/maintain-august-wiki/SKILL.md` routes agents through that guide and this workflow. `AGENTS.md` requires it for documentation and behavior changes. The [research note](research/wiki-editorial-design.md) explains the source material and the decisions applied here.

## Where to make a change

| Change | Update in the same commit |
| --- | --- |
| Syntax, type/effect/ownership/DI rules | `docs/reference.md`, relevant grammar/testing/web guide and `src/help.ts` |
| Public library signature or behavior | Javadoc beside its declaration in `src/stdlib`, the relevant guide and gap ledger |
| Diagnostic or editor behavior | `src/help.ts`, diagnostics/tooling guide and VS Code changelog |
| CLI, packages, configuration or supported platform | Tooling/packages/releasing guide, Docker and Dev Container recipes, and package metadata |
| Completed or deferred feature | Implementation map, gap ledger and changelog |

Public comments should explain observable behavior, named inputs, errors, side effects, and limits. Keep dependencies explicit in examples. Record incomplete capabilities in the gap ledger; do not imply that an unimplemented proposal is usable.

Container guides install the published CLI and obtain its pinned LLVM/runtime and package artifacts. Keep the CLI version, supported targets, writable cache paths and complete deployment bundle aligned with the release. Maintainer build images have a separate explicit toolchain. Verify the HTTP application image and run the starter's check/run/test/spec workflow as the Dev Container's non-root user. State any verification mount substitutions: a Docker engine that cannot share local folders can test execution in an isolated volume, but that does not verify the default VS Code bind mount or editor port forwarding.

For dependency-setup changes, run `npm run test:setup-cold` after preparing the pinned downloads. It builds crypto and HTTP through an aliased empty cache, runs a digest, and serves a real HTTP response. The fast first-run suite covers JSON/tasks, downloads, offline reuse, packages, and cache concurrency. Verify the installed package too; source execution alone does not prove that setup helpers ship in the npm archive.

The installed-package gate uses an isolated npm cache. Its first installation fetches production dependencies; its later global installation runs offline from that cache. This checks both first use and reuse without relying on packages cached by the contributor's machine.

## Generated reference

The gallery generator also creates deterministic project archives in `docs/public/downloads`. Each archive includes source, configuration, and generated specs, with neighboring source packages when required. It excludes build state, installed dependencies, locks with temporary host paths, and credentials. Gallery tests extract every archive and check it as an independent project. Public guides use these downloads and the npm CLI; source-workspace commands belong in contributor documentation.

```sh
npm run docs:generate
npm run docs:check
npm run docs:build
```

The API generator reads each `export.aug`, resolves the actual public declaration, and uses the same Javadoc/inherited documentation path as hover. It includes public methods and excludes private native helpers. The language constructs page comes from editor help and collection operation contracts. Commit generated Markdown so GitHub readers and package users can read it without building a site. CI rejects stale generated pages.

Performance charts use native HTML and CSS. `docs:generate` derives their small `benchmark-data.json` summary from the recorded reports, and `docs:check` rejects stale values. Keep the reports unchanged when editing presentation. `::: benchmark-chart NAME` inserts a registered chart without enabling arbitrary Markdown HTML; unknown names fail the site build. Verify implementation filters, observed-range controls, keyboard operation, light/dark themes and narrow layouts when changing `BenchmarkChart.vue`.

The generator also runs the deterministic spec compiler for every standard-library source file. Commit these adjacent `src/stdlib/**/*.aug.md` files and their managed `// aug-spec:` source pointers. Unlike public API pages, full source specs include private helpers and all local behavior. The generator builds explicit behavioral relations, plans sentences within their scopes, checks statement provenance, and lays out connected paragraphs. Keep author comments and dependency links concise instead of repeating signatures or Javadoc sections. For application or third-party package source changes, run `aug spec PROJECT` and verify `aug spec PROJECT --check`. See [the user workflow](specifications.md) and [the research rationale](research/code-to-natural-language.md).

## Repository example gallery

`docs/example-projects.json` lists the complete projects shown in [the example gallery](examples/index.md), including the measured benchmark programs. `docs:generate` checks each application and its same-file tests, formats each file in indentation and braces styles, and runs the spec compiler. It publishes code and specs side by side under `docs/examples`, with dependency links that stay in the wiki. Long code lines wrap visually without changing copied source. It also refreshes adjacent example specs, managed source pointers, and offline dependency copies. Generation uses temporary project copies. It installs dependencies declared by imports and configuration, preserving committed revision locks. Git sources must be cached or reachable during preparation; spec generation itself stays offline. It preserves the source program and handwritten comments, and does not create package locks in the source workspace.

Keep titles and descriptions in the catalog current when adding or changing an example. `docs:check` rejects source/spec drift. Gallery tests require every repository example and benchmark source to be represented, check both displayed syntax styles, and follow the wiki's generated links and declaration anchors. Readers can switch code style with a mouse or keyboard; their choice is kept between pages on the same browser.

## Executable examples

A neighboring configuration fence can use `yaml project=NAME file=main.yaml`. Each runnable `aug` fence declares `project=NAME file=PATH`. A guide may spread one project across several fences. Add expected output/test counts to `docs/examples.json`. The documentation test assembles, checks, runs or builds, tests, formats, and checks those projects again. API signatures use `text` fences because a declaration header is not a complete application.

The test discovers handwritten Markdown recursively, including the book and task guides. Generated API/gallery pages and hidden build folders have separate generation checks. Complete examples need expected output; identify fragments and intended failures in the prose. Maintain the chapter links and the public navigation when adding a lesson.

```sh
node --test tests/documentation.test.mjs
```

CI checks documentation on every push and pull request. Pull requests changing language/runtime/library/tooling behavior must update a handwritten guide or changelog; the policy check enforces that requirement. The Pages deployment publishes only the documented branch version, with search and source links. Use tags and GitHub history to read earlier releases.

## Homepage and current-state audit

`scripts/homepage-docs.mjs` generates the landing-page source and exact spec paragraph from `benchmarks/greetings`, and checks the matching report’s source and full sample count. `scripts/native-package-docs.mjs` generates the library example guide from the real native consumer projects. Update canonical programs and rerun their checks before changing their generated presentation.

When auditing the whole wiki, review handwritten pages, generator inputs, library comments, and generated outputs. Replace completed proposals with descriptions of implemented behavior. Remove obsolete benchmark comparisons and local delivery history from reader pages. Verify published CLI/extension versions separately; a GitHub VSIX does not imply the same version is available in the Marketplace. Keep remaining platform, protocol, ownership, and redistribution limits explicit.

A compiler version update also requires refreshing committed example and benchmark source locks with `aug install`. Native packages currently require an exact compiler version; publish matching source tags before changing their imports. Reusing an unchanged native archive is explicit in the package manifest and release notes. Run the complete example gallery after updating those locks.

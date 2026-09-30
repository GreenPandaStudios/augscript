# Keeping documentation current

Documentation is part of a language change. The canonical wiki is this repository's `docs` directory, reviewed and versioned with the compiler. GitHub Pages renders these same files; an independently edited GitHub Wiki would create a second source of truth.

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

Container guides install the published CLI and prepare its native dependencies. Keep their pinned CLI version, build tools, native library paths, and editor cache setting aligned with the release. Verify the HTTP application image and run the starter's check/run/test/spec workflow as the Dev Container's non-root user. State any verification mount substitutions: a Docker engine that cannot share local folders can test execution in an isolated volume, but that does not verify the default VS Code bind mount or editor port forwarding.

## Generated reference

The gallery generator also creates deterministic project archives in `docs/public/downloads`. Each archive includes source, configuration, and generated specs, with neighboring source packages when required. It excludes build state, installed dependencies, locks with temporary host paths, and credentials. Gallery tests extract every archive and check it as an independent project. Public guides use these downloads and the npm CLI; source-workspace commands belong in contributor documentation.

```sh
npm run docs:generate
npm run docs:check
npm run docs:build
```

The API generator reads each `export.aug`, resolves the actual public declaration, and uses the same Javadoc/inherited documentation path as hover. It includes public methods and excludes private native helpers. The language constructs page comes from editor help and collection operation contracts. Commit generated Markdown so GitHub readers and package users can read it without building a site. CI rejects stale generated pages.

The generator also runs the deterministic spec compiler for every standard-library source file. Commit these adjacent `src/stdlib/**/*.aug.md` files and their managed `// aug-spec:` source pointers. Unlike public API pages, full source specs include private helpers and all local behavior. The generator builds explicit behavioral relations, plans sentences within their scopes, checks statement provenance, and lays out connected paragraphs. Keep author comments and dependency links concise instead of repeating signatures or Javadoc sections. For application or third-party package source changes, run `aug spec PROJECT` and verify `aug spec PROJECT --check`. See [the user workflow](specifications.md) and [the research rationale](research/code-to-natural-language.md).

## Repository example gallery

`docs/example-projects.json` lists the complete projects shown in [the example gallery](examples/index.md), including the measured benchmark programs. `docs:generate` checks each application and its same-file tests, formats each file in indentation and braces styles, and runs the spec compiler. It publishes code and specs side by side under `docs/examples`, with dependency links that stay in the wiki. Long code lines wrap visually without changing copied source. It also refreshes adjacent example specs, managed source pointers, and offline dependency copies. Generation uses temporary project copies; the package-consumer example installs its local dependency offline there. It preserves the source program and handwritten comments, and does not create package locks in the source workspace.

Keep titles and descriptions in the catalog current when adding or changing an example. `docs:check` rejects source/spec drift. Gallery tests require every repository example and benchmark source to be represented, check both displayed syntax styles, and follow the wiki's generated links and declaration anchors. Readers can switch code style with a mouse or keyboard; their choice is kept between pages on the same browser.

## Executable examples

Each runnable `aug` fence declares `project=NAME file=PATH`. A guide may spread one project across several fences. Add expected output/test counts to `docs/examples.json`. The documentation test assembles, checks, runs or builds, tests, formats, and checks those projects again. API signatures use `text` fences because a declaration header is not a complete application.

The test discovers handwritten Markdown recursively, including the book and task guides. Generated API/gallery pages and hidden build folders have separate generation checks. Complete examples need expected output; identify fragments and intended failures in the prose. Maintain the chapter links and the public navigation when adding a lesson.

```sh
node --test tests/documentation.test.mjs
```

CI checks documentation on every push and pull request. Pull requests changing language/runtime/library/tooling behavior must update a handwritten guide or changelog; the policy check enforces that requirement. The Pages deployment publishes only the documented branch version, with search and source links. Use tags and GitHub history to read earlier releases.

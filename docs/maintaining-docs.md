# Keeping documentation current

Documentation is part of a language change. The canonical wiki is this repository's `docs` directory, reviewed and versioned with the compiler. GitHub Pages renders these same files; an independently edited GitHub Wiki would create a second source of truth.

## Where to make a change

| Change | Update in the same commit |
| --- | --- |
| Syntax, type/effect/ownership/DI rules | `docs/reference.md`, relevant grammar/testing/web guide and `src/help.ts` |
| Public library signature or behavior | Javadoc beside its declaration in `src/stdlib`, the relevant guide and gap ledger |
| Diagnostic or editor behavior | `src/help.ts`, diagnostics/tooling guide and VS Code changelog |
| CLI, packages, configuration or supported platform | Tooling/packages/releasing guide and package metadata |
| Completed or deferred feature | Implementation map, gap ledger and changelog |

Public comments should explain observable behavior, named inputs, errors, side effects, and limits. Keep dependencies explicit in examples. Record incomplete capabilities in the gap ledger; do not imply that an unimplemented proposal is usable.

## Generated reference

```sh
npm run docs:generate
npm run docs:check
npm run docs:build
```

The API generator reads each `export.aug`, resolves the actual public declaration, and uses the same Javadoc/inherited documentation path as hover. It includes public methods and excludes private native helpers. The language constructs page comes from editor help and collection operation contracts. Commit generated Markdown so GitHub readers and package users can read it without building a site. CI rejects stale generated pages.

The generator also runs the deterministic spec compiler for every standard-library source file. Commit these adjacent `src/stdlib/**/*.aug.md` files. Unlike public API pages, full source specs include private helpers and all local behavior. The generator builds a checked explanation tree before laying out Markdown; keep author comments and dependency links concise instead of repeating signatures or Javadoc sections. For application or third-party package source changes, run `aug spec PROJECT` and verify `aug spec PROJECT --check`. See [the user workflow](specifications.md).

## Repository example gallery

`docs/example-projects.json` lists the complete projects shown in [the example gallery](examples/index.md), including the measured benchmark programs. `docs:generate` checks each application and its same-file tests, formats each file in indentation and braces styles, and runs the spec compiler. It publishes code and specs side by side under `docs/examples`, with dependency links that stay in the wiki. Long code lines wrap visually without changing copied source. It also refreshes adjacent example specs and their offline dependency copies. Generation uses temporary project copies; the package-consumer example installs its local dependency offline there. It does not edit example source or create package locks in the checkout.

Keep titles and descriptions in the catalog current when adding or changing an example. `docs:check` rejects source/spec drift. Gallery tests require every repository example and benchmark source to be represented, check both displayed syntax styles, and follow the wiki's generated links and declaration anchors. Readers can switch code style with a mouse or keyboard; their choice is kept between pages on the same browser.

## Executable examples

Each runnable `aug` fence declares `project=NAME file=PATH`. A guide may spread one project across several fences. Add expected output/test counts to `docs/examples.json`. The documentation test assembles, checks, runs or builds, tests, formats, and checks those projects again. API signatures use `text` fences because a declaration header is not a complete application.

```sh
node --test tests/documentation.test.mjs
```

CI checks documentation on every push and pull request. Pull requests changing language/runtime/library/tooling behavior must update a handwritten guide or changelog; the policy check enforces that requirement. The Pages deployment publishes only the documented branch version, with search and source links. Use tags and GitHub history to read earlier releases.

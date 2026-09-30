---
name: maintain-august-wiki
description: Maintain August's public wiki when language, runtime, library, CLI, package, or editor behavior changes, or when revising lessons and guides. Keep prose, runnable examples, generated specs, navigation, and readiness claims consistent with the implemented language.
---

# Maintain the August wiki

Use the repository's `docs` as the canonical published documentation. Read `docs/writing-docs.md` for editorial decisions and `docs/maintaining-docs.md` for the source-to-guide mapping and generation workflow. Read `docs/research/wiki-editorial-design.md` when changing the information architecture or writing style.

Route by reader need: a sequential lesson in Learn, a task in Guides, a precise contract in Reference, rationale/evidence under About, or a repository process under Contribute. Preserve useful URLs and anchors. Write connected developer prose; use lists for actual sequences and tables for comparisons.

For a behavior change, identify the affected public contract from source and regression tests, then update its handwritten guide in the same change. Update Javadoc and `src/help.ts` when their observable contracts change. Keep readiness, roadmap, and gap claims tied to implemented and approved scope. Do not expand an ordinary docs change into language design or security-policy changes.

For lessons, state prerequisites, file locations, actions, and expected output. Complete `aug` fences need `project` and `file` metadata plus `docs/examples.json` expectations. Label fragments and intentional failures. Verify important failure demonstrations against the checker. Nested handwritten pages are included in the executable documentation test.

Start application onboarding with `npx @greenpandastudios/aug-cli@next init NAME`. Verify it against the published package. Reader workflows must use published tools and downloadable example projects; do not instruct users to clone or check out the language repository, or invoke its internal `bin/aug.mjs`. Keep source-workspace commands in contributor guides. State native preparation when execution needs it; do not claim that `init` prepares dependencies unless the released implementation does so. Recheck installation instructions against the actual release when another task changes distribution.

Keep Docker deployment and VS Code Dev Container recipes aligned with the published CLI version, native bootstrap, shared-library paths, and editor cache settings. Follow the container verification notes in `docs/maintaining-docs.md`; distinguish tested native execution from editor installation, forwarding, and host mount behavior.

Generated API, construct, gallery, and adjacent spec files belong to their generators. Edit declarations, Javadoc, help, catalog, or generator inputs; run `npm run docs:generate` and commit the resulting artifacts. Keep indentation/braces views and dependency links intact. Do not edit `dist` or `vscode/compiler`.

Before delivery, run `npm run check`, relevant regressions including `node --test tests/documentation.test.mjs`, `npm run docs:check`, and `npm run docs:build`. Run gallery regressions if its generation changes; run installed-package tests for distribution changes as required by `AGENTS.md`. Inspect a rendered page at narrow and wide sizes when changing layout or navigation. Report exact checks and remaining limits.

Source research from official documentation, source code, original papers, or standards. Cite factual claims nearby, distinguish synthesis from evidence, and avoid copying another site's prose. Benchmark and agent-productivity claims require reproducible, scoped evidence; do not turn design intentions into guarantees.

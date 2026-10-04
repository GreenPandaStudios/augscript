# August contributor instructions

The language tenets are simplicity and developer scalability for developers working with LLMs. Keep module dependencies, state changes, checked errors, and public behavior readable in context. Prefer explicit capabilities, bounded scopes, immutable values, and narrow public exports.

## Documentation is part of a change

Use the repository skill at `.agents/skills/maintain-august-wiki/SKILL.md` for documentation work and behavior changes. Its editorial contract is `docs/writing-docs.md`: keep the book, task guides, reference, rationale, and contributor notes distinct, and verify runnable examples and public claims against implemented behavior.

Maintain `docs` as the canonical language wiki. A language, runtime, library, CLI, configuration, or editor behavior change must update a relevant handwritten guide or changelog in the same change. Update Javadoc and `src/help.ts` when their observable contracts change. Run `npm run docs:generate` and commit generated API/construct pages. See `docs/maintaining-docs.md` for the mapping and executable fence format.

Keep `docs/web-library-gaps.md` honest. Pending approval work is not implemented scope. Do not silently change ownership, GC, worker/channel behavior or security policies that an earlier approval review blocked.

## Distribution

Canonical source is under `src`, `runtime` and `src/stdlib`. `packages` contains release manifests and package READMEs. Never edit generated `dist` or `vscode/compiler`. Compiler and first-party npm versions stay together with `node scripts/version.mjs VERSION`. An editor-only patch may use `node scripts/version.mjs --extension VERSION`; its `augustCompilerVersion` must remain pinned to the unchanged released compiler. Publish it through `prepare-extension.yml` with an `extension-vVERSION` tag. That path bundles the verified public CLI archive and rejects changes to compiler/runtime inputs. Verify both version contracts using `npm run version:check`.

Before delivery run type checking, relevant regression tests, documentation drift/site checks, and `npm run test:packages` for distribution changes. Packaged CLI JavaScript must work from `node_modules`; direct Node TypeScript stripping there is unsupported. Do not include contributor native caches, keys, credentials, or generated build directories in Git or release artifacts. The container build base deliberately installs the published CLI and its verified LLVM/runtime pack; its Dockerfile must not copy the repository or contributor caches.

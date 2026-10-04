# Contributing to August

August aims to be simple to read and safe to scale while working with LLMs. A module should state its dependencies, public exports, effects and errors. New language features need a readable example and clear limits.

```sh
npm ci
npm --prefix vscode ci
node scripts/bootstrap-native.mjs
node scripts/prepare-llvm-tools.mjs
node scripts/build-runtime-pack.mjs
npm run check
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm test
npm run docs:generate
npm run docs:check
npm run docs:build
npm run package:packages
npm run test:packages
npm run test:packages -- --native
npm run package:extension
```

Compiler development uses Node 24's TypeScript support; published CLI packages contain compiled JavaScript. Native web, crypto, JSON and task tests use the pinned private bootstrap. LLVM candidates target macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Keep unverified platforms explicit. Configure the local tool pack while testing an unpublished compiler; public consumers receive verified prebuilt packs.

The full suite runs two test files at a time. Native builds and debugger checks are expensive; bounded concurrency prevents unrelated process launches from exhausting a short test timeout. Preserve those timeout assertions when changing the runner.

Read [documentation maintenance](docs/maintaining-docs.md) before changing behavior, and [the release process](docs/releasing.md) before distributing artifacts. Run relevant tests during development and the full suite before a release. Each regression should verify user-visible behavior or a concrete runtime invariant.

Keep a feature's syntax, checker, execution IR, LLVM backend, C reference backend, runtime, editor help, tests, examples and docs consistent. Track gaps in [the library ledger](docs/web-library-gaps.md). Use small modules and explicit exports rather than ambient services or global mutable state.

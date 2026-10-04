# Compiler architecture

The compiler checks one August project, then uses the same resolved program for native code, editor tools, tests, and compiled specifications. This page maps those responsibilities to their canonical source modules. It is intended for compiler contributors; application developers can start with [the book](learn/index.md).

## From source to an executable

[`project.ts`](../src/project.ts) loads `main.aug`, configuration, modules, and installed packages. [`lexer.ts`](../src/lexer.ts) and [`parser.ts`](../src/parser.ts) produce the source AST for both indentation and braces. [`checker.ts`](../src/checker.ts) resolves declarations and checks types, labels, visibility, dependencies, effects, checked errors, and ownership. [`contracts.ts`](../src/contracts.ts) exposes effective callable contracts, including inferred results and failures.

[`ir.ts`](../src/ir.ts) lowers checked code into August execution IR. Its explicit operations, source locations, and root cells form the boundary between language semantics and code generation. [`llvm.ts`](../src/llvm.ts) lowers that representation to LLVM IR. [`llvm-native.ts`](../src/llvm-native.ts) verifies, optimizes, emits objects, links, and prepares executable bundles. LLVM 23.1.2 is pinned; [`compiler-packs.ts`](../src/compiler-packs.ts) selects and verifies the host compiler/runtime pack.

The explicit C backend remains a migration reference for contributor comparisons. It is not the default compilation path, and native ABI packages require LLVM. Backend parity tests compare results, checked failures, and cleanup.

## Runtime and native packages

[`runtime`](../runtime) supplies managed values, allocation, collections, task scopes, cleanup, checked failure transport, and selected I/O adapters. Native packages expose a reviewed C ABI through [`native-contracts.ts`](../src/native-contracts.ts), [`native-artifacts.ts`](../src/native-artifacts.ts), and the package manager. The [package compatibility contract](package-compatibility.md) and [native ABI reference](native-abi.md) record versioned public boundaries. The package manager stages immutable source generations and accepts consumer locks only after native verification; `package-locking.ts` serializes writers and recovers terminated owners. The runtime's tagged value layout is compiler-private; a public native package uses fixed-width values, copied buffers, or owned opaque resources.

[`package-manager.ts`](../src/package-manager.ts) resolves source dependencies, caches revisions, and maintains locks. Compiler and library downloads have separate identities. Consumer installation verifies prebuilt artifacts and executes no package build scripts. See [native compilation design](native-interop-llvm-plan.md) for the boundary and deployment contract.

## Reader and editor tools

[`spec.ts`](../src/spec.ts) compiles checked source into adjacent Markdown. [`semantic.ts`](../src/semantic.ts), [`documentation.ts`](../src/documentation.ts), and [`help.ts`](../src/help.ts) supply checked contracts and language help. [`formatter.ts`](../src/formatter.ts) reparses its output before returning an edit. The language server and VS Code extension use these compiler facts for hover, navigation, completion, fixes, and inferred hints.

[`scripts/generate-docs.mjs`](../scripts/generate-docs.mjs) builds the API, construct, and example pages from canonical sources. Handwritten guides explain use; generated pages report the program that is actually checked. Change their generators instead of editing generated prose.

## Verification boundaries

Language/runtime tests, backend comparisons, installed-package tests, documentation examples, and safety gyms check different parts of the implementation. The [release process](releasing.md) names the required gates. Keep a failing native case as an ordinary regression, and preserve concrete evidence for rejected candidates. Report type checking and executed tests separately; neither proves arbitrary program behavior.

# Checked contract evidence in diagnostics

October 5, 2026. This unreleased profile implements the diagnostic part of the [LLM engineering proposal](llm-engineering-proposal.md) through the existing CLI, embedding and LSP boundaries. It adds evidence, not a new annotation or permission system.

The comparison that accepts an interface implementation now returns its first differing fragment when it rejects one. It resolves inherited owner and method type parameters, input labels and defaults, ownership, result types, capability and mutation upper bounds, and effective checked errors. Expected and actual strings plus a related permitted declaration travel through the existing diagnostic fields. Inference remains visible in capability, mutation and error fragments.

This work reproduced three acceptance bugs: generic capability arguments were keyed by displayed names, so distinct same-named records could grant the same operation; an explicit method was checked against only the first inherited declaration, and a selected default could satisfy one interface while violating another. Capability keys now encode recursive resolved argument identities, including nullable and immutable type dimensions. Explicit and default methods check every required signature. Diagnostic fragments show substituted generic capability arguments and qualify colliding type, error and capability names with their module origins. The independent conformance cases reject incompatible string/int inputs and distinct nested generic capability arguments; a positive consumer runs compatible shared requirements and inherited defaults through C and LLVM.

Inference retains call witnesses under the exact resolved capability key. A breadth-first query finds a shortest static obligation path, terminates recursive traversal, and stops at a declared callee bound. A bound remains authoritative even when its current body is inert. Paths longer than seven locations retain their beginning and end and state the omitted count. An absent matching witness is not filled in by name search; generic substitution and interceptor boundaries can stop the path. The diagnostic describes potential obligations, never observed execution or complete foreign behavior.

Compiler acceptance and diagnostic rendering share one comparison. No fix adds authority, makes a value shared, broadens an error contract or supplies recovery behavior. The following ownership profile adds borrow/capture/move witnesses. Scoped-retention paths, interceptor layer derivations and rejected-candidate revision envelopes remain separate work. The context and checked-edit protocols already carry revisions; this profile does not pretend each bare diagnostic is independently revision-bearing.

Qualification is recorded in the ergonomics ledger. Eighteen direct cases, 228 neighboring checks, 41 LLVM conformance examples, type checking, documentation drift/site checks and installed JavaScript package consumers pass; the final full suite reports 917 passing cases, three opt-in/cold skips and one source-debugger timeout out of 921 tests. An independently compiled C executable also times out at LLDB run on this host. Debugger qualification remains open; no gate or host permission was changed. Both review axes report no remaining scoped findings after independent reproductions and repairs. Public regression seams are `aug check --json`, human CLI errors, native run, semantic snapshots and LSP Problems. Test assertions use independently specified fragments and source locations, including the interface that actually owns an inherited contract.


## Ownership source evidence

The next profile reuses active exclusive loans, outstanding task-capture sites
and checked transfer sites. Rejections expose a specific rule, required/actual
access fragments and related source locations through the existing diagnostic
boundary. Conditional aliases and branch transfers remain possible relationships;
a diagnostic does not assert that a branch executed or that two pointers are
identical. At most seven distinct sites are delivered in source order, with an
explicit omitted count. No automatic fix widens authority or shares state.

The profile covers conflicting reads and borrows, moves and call inputs, new
captures, captured mutations through methods and fields, and owned-local cleanup
before task joins. Isolated worker copies produce no shared loan. Reporting adds
no origin, grant, transfer, wait or runtime behavior. Scoped retention and deeper
heap-path reconstruction remain separate work. The public tests exercise CLI,
human source excerpts, immutable embedding snapshots and persistent unsaved LSP
Problems. Thirty-three focused checks pass. The frozen 1016-case suite passes
1012, skips three optional/cold cases and retains the independently reproduced
host LLDB launch timeout. Type checking, 608 documentation drift checks, the wiki
build, installed JavaScript C/LLVM consumers and version checks pass. Both review
axes are clear after repairing lost capture witnesses during deduplication. All
15 frozen file hashes stayed unchanged during the full run. Clean default
compiler downloads, installed-editor qualification and comparative model trials
remain unqualified.

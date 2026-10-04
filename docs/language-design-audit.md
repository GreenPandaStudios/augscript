# Language design principles

August aims for simplicity and developer scalability: a module should remain understandable to someone seeing it for the first time, including a coding agent with a limited context window. The source describes the work; the compiler supplies facts that need not be typed twice.

## Read the operation at its call site

Calls name their inputs, as in `total(price=7, quantity=3)`. The name explains the role of a value without requiring the reader to remember parameter order. When label and local name match, `save(update)` means `save(update=update)`. Conditions use `and`, `or`, and `not`. Assignment accepts `=` or `to`; both block styles are equivalent.

These choices make everyday code resemble pseudocode without removing exact rules. Types, visibility, ownership, and checked failures still constrain what a program can do. The [grammar](grammar.md) defines those rules; the [book](learn/index.md) teaches them through complete programs.

## Keep context close

Each file imports what it uses. `export.aug` chooses a folder's public declarations, and a leading underscore makes a name private to its scope. A dependency header shows injected capabilities; startup chooses their providers explicitly. Narrow exports and bounded module dependencies limit what a reader must follow.

Tests sit beside their declarations. Comments supply intent that cannot be recovered from execution alone. `aug spec` explains the program and links to the dependencies it uses. Open those links when you need the full dependency explanation.

## Infer facts, retain decisions

Executable bodies infer return types, capability operations, state changes, and escaping errors. Editor hints, hover, and compiled specs show those contracts. Interfaces without bodies state their promises explicitly. The author still chooses ownership transfer, mutable access, dependency providers, and error recovery.

Inference should reduce repetition without hiding a changed public promise. Before accepting a change, review its source, its effective contract, its generated explanation, and independent tests. The spec describes the current implementation. Write acceptance tests from the requirements so they can catch behavior that the source and spec both explain incorrectly.

## Bound state and effects

Reading shares values where the language permits it. Mutation needs `borrow`, ownership, or a checked shared-state lock. Scoped tasks retain their dependencies until joining. I/O crosses explicit capabilities or unsafe native adapters. These boundaries help developers see where a change can affect another part of an application.

The current scheduler is cooperative on one OS thread. Native code remains trusted foreign code even when a descriptor matches its header. [Conformance](language-conformance.md) and [safety gyms](safety-gyms.md) document exercised behavior; [compatibility](compatibility.md) states supported targets and preview limits.

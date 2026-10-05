# Internal folder contracts

Implementation profile agreed from the LLM engineering proposal. This feature is unreleased until the compiler and editor containing it ship.

An `internal Name from sibling` entry belongs in `export.aug`. It admits an explicitly imported sibling declaration under `strict_modules`, without admitting it through a folder or package import. The entry does not change `_` privacy. `internal` is contextual, so an ordinary function named `internal` stays legal. Internal folder entries are not supported.

A name occurs once in a folder surface, whether internal or exported. Entries name declarations defined in a public sibling source file, never imported aliases. External imports, wildcard imports, dotted paths and nested folder traversal see only exports. Internal entries remain useful with strict checking disabled; declaring one still keeps it out of the outward surface.

Folders using internal entries opt into outward contract validation. Their exported callable inputs/results/errors, public fields, construction inputs including injected inputs, implemented/inherited interfaces, choice alternatives and generic constraints must use externally accessible types. The check uses resolved identities and effective inferred contracts. Private implementation storage is not an outward promise. Exported compositions may retain internal provider provenance: consumers can include that explicit composition and use its exported service interface without constructing or importing the hidden implementation.

Existing folders without internal entries keep their current export behavior. No migration hides an export automatically. A declaration cannot be both internal and exported under the same folder name. Changing an export to internal is an explicit public removal in package comparisons.

Verify at the public compiler/CLI, formatter, semantic-query/editor, generated-spec and package-surface boundaries. Cases cover strict sibling imports, cross-folder/package/nested rejection, wildcard filtering, malformed/duplicate/private entries, resolved same-name types, inferred errors/results, constructor DI, private storage and an exported service backed by an internal repository through an explicit composition. The C and LLVM executions must match; the feature changes visibility, not runtime ownership or cleanup.

Qualification: real local-repository import/locking and offline native C/LLVM consumers pass, including hidden service providers. Forty focused cases cover outward leak and editor/type/name boundaries; 54 neighboring checks and all four executable-guide gates pass. Independent conformance passes 38 examples in 89 checks and detects both behavioral mutations. Both review axes verify repairs for nested folder visibility and contextual coloring. Generated docs, the wiki build and installed JavaScript consumers pass. This does not qualify clean default-LLVM distribution, installed VS Code or power-loss recovery.

The subsequent full run executed 910 tests: 905 passed, three opt-in/cold checks skipped and two failed. The legacy context-budget assertion was updated for the root-preserving protocol and passes in isolation. Source-debugger launch remains unqualified: LLDB resolves the August line breakpoint, then times out at run, including on an isolated retry. No breakpoint test was disabled.

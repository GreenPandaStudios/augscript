# AugScript for VS Code

Version 0.16 bundles the compiler, runtime, native bootstrap, and language guides.

## Editing

- Braced and colon-led blocks, tabs or spaces, optional semicolons, and canonical formatting.
- Syntax and semantic colors for declarations, capabilities, records, effects, generics, interceptors, tests, and collection literals.
- Persistent language server with versioned unsaved edits, cached import closures, and local checks while main composition is unfinished.
- Completion and signature help for public input labels, header dependencies, members, mappings, and built-ins.
- Hover help for language keywords/operators/punctuation, resolved contracts, Javadoc, errors, layer order, and main.yaml.
- Ctrl-click (Cmd-click on macOS) declarations, tags, mapping labels, from, and each dotted module path segment.
- Compiler diagnostics and fixes: imports, obsolete syntax, borrow/unsafe wrappers, error propagation/recovery, lifted DI dependencies, and named-import expansion.
- Endpoint routes, wire sources, literal policy options, streams, typed actions, scoped tasks and same-file endpoint cases appear in colors, help and context reports.

Ordinary callables are pure; mutation declares changes, and I/O receives capabilities with uses contracts. Public fields and managed references grant reading. DI lifetimes, scoped escape, generic constraints/variance, and checked runtime errors are validated by the bundled compiler.

## Commands

Open a .aug file, then use the Command Palette:

| Command | Action |
| --- | --- |
| AugScript: Build Project | Compile the complete project to native C. |
| AugScript: Run Project | Build and execute startup. |
| AugScript: Test Project | Run every test in a task terminal. |
| AugScript: Refresh Tests | Refresh class/function suites and parameter rows. |
| AugScript: Explain Current File | Show contracts, dependency provenance, effects, layers, and tests as JSON. |
| AugScript: Gather Context for Current File | Show bounded related source and checked contracts as JSON. |
| AugScript: Debug in LLDB Terminal | Build with source locations and launch lldb. |
| AugScript: Open Language Guide | Open the bundled reference. |
| AugScript: Open Testing Guide | Open testing and coverage documentation. |
| AugScript: Open Diagnostics Guide | Explain compiler errors and available fixes. |
| AugScript: Open Web and Crypto Guide | Open service examples, policies, endpoint testing and the login proof. |
| Format Document | Apply main.yaml block/indentation/assignment preferences. |

Formatting checks that the result parses to the same program before returning an edit. Configure format-on-save in ordinary VS Code settings if desired.

## Tests and debugging

Test Explorer groups same-file class, function and endpoint suites by project and when group. Endpoint cases use HttpTestClient through the native request pipeline. Each parameter row runs in a separate native process. Choose Native coverage for merged statement-line coverage on VS Code versions supporting its coverage API. Saving refreshes discovery.

The AugScript debugger builds the project, then uses LLVM lldb-dap. Install that adapter on PATH or configure augscript.lldbDapPath. An ordinary lldb terminal is also supported. Source breakpoints and native stacks are available; variables currently expose the tagged C runtime representation.

## Documentation and icons

Place /** Javadoc */ before a declaration. Parameter labels, return tags, and effective error tags are checked. Documentation follows imports and interface implementations. Supported tags include @param, @return, @throws, @see, and @deprecated.

Choose **Preferences: File Icon Theme → AugScript Icons** for the bundled SVG theme. main.aug has the startup icon, export.aug the public-surface icon, and main.yaml the configuration icon. Other .aug files and common source/folder types have their own icons.

## Requirements and settings

Node.js 24+ is required. Native commands additionally require a C11 compiler. Configure augscript.nodePath if Node is not on VS Code's PATH, or augscript.compilerPath for a custom CLI. The extension otherwise uses its bundled compiler.

For web/crypto/JSON/task programs, run `node scripts/bootstrap-native.mjs` in the compiler repository, then set `augscript.nativeHome` to its absolute `.aug-native` directory. The compiler and bootstrap also accept AUG_NATIVE_HOME. The extension includes compiler/scripts/bootstrap-native.mjs for a private dependency build; native binaries are not bundled. The pinned bootstrap currently targets macOS ARM.

Use the guide commands to read the bundled documentation. This is an experimental language with conservative ownership analysis, one-project builds, cooperative tasks on one OS thread, and no package resolver. Multicore workers, channels/broadcasts and inbound streaming remain documented gaps.

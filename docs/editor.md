# Write August in VS Code

Install the [AugScript extension](packages.md#vs-code), open the project folder, and start in `main.aug`. The editor checks unsaved code with the same compiler as the CLI. Install source dependencies with `aug run` or `aug install` so their declarations and documentation are available locally.

## Check setup

The unreleased extension adds **AugScript: Check Setup**. It runs `aug doctor` with the configured compiler and shows the report in the **August** output channel. The published 0.23.0 compiler does not provide that command; an editor-only patch that retains it reports this limit. Install a matching full release to use doctor.

The extension needs Node.js 24 or newer on the machine where its extension host runs. If Node cannot start, the diagnostic offers August settings and the output channel. Set `augscript.nodePath` to the Node executable. If you select a custom CLI, set `augscript.compilerPath` to its `bin/aug.mjs`; otherwise the extension uses its bundled compiler. Correcting either setting restarts the language server. Keep a custom CLI on the same compiler version as your project packages.

In a Dev Container, install Node and the extension in the container. A host Node path cannot start a process there. The [Docker guide](docker.md) uses the prepared August build image for that environment.

## Complete a call

Type part of a function or method name and choose a completion. The editor inserts its labeled inputs and places the cursor at the first value. Press Tab to move through the values. Injected `resolve` inputs are supplied by DI and do not appear as arguments you must fill in.

For a function such as `total(int price, int quantity)`, completion inserts a call shaped like `total(price=0, quantity=0)`. The numbers are editable placeholders. Signature help describes each input while you type. If a local value has the same name as its input, you can use August's labeled shorthand, such as `total(price, quantity)`.

Public declarations from nearby modules and installed packages also appear in completion. Choosing one can add its import. Imports follow `export.aug`; private names and unexported declarations stay out of the suggestions.

## Start a declaration or test

Type `record`, `interface`, `implementation`, or `method` for a declaration template. `test`, `testclass`, and `testendpoint` supply same-file tests. `endpointget`, `endpointpost`, `endpointpatch`, and `endpointdelete` supply route templates. Other templates cover imports, exports, conditions, errors, borrows, tasks, locks, interceptors, and comments.

The completion provider follows `block_style` and `indentation` in `main.yaml`. Templates are starting points: replace their names, values, and bodies before running the program. The extension also supplies VS Code snippets and enables Tab completion for August files.

## Read help and inferred types {#understand-a-contract}

Hover over a declaration, a call, a keyword, or a built-in operation. Help includes Javadoc when it is present. Ctrl-click, or Cmd-click on macOS, opens the declaration. In an import, clicking `from` opens the sibling file or the package's `export.aug`.

Hints beside a function or method show its inferred result, state changes, I/O, and possible errors. They stay out of saved source. Hover over a long hint to expand it. Set `augscript.inferredContractHints` to false to hide them. Bodyless interfaces and foreign declarations still state their contracts in code.

## Fix a diagnostic

Place the cursor on an error and open the lightbulb with Ctrl+. or Cmd+.. Available fixes include: importing a visible declaration, correcting a nearby name or input label, expanding a wildcard import, adding a required method, or containing a mutable or native operation.

Review the edit before accepting it. A suggested name can be plausible without being the name you intended. After a change, run `aug check`, your tests, and `aug spec` to refresh the neighboring explanation.

## Find the files and run tests

Run **AugScript: Enable File Icons** for the August icon theme. Source files use a burgundy open circle; `main.aug` uses a play symbol, `export.aug` an outward arrow, and `main.yaml` sliders. Each has a light and dark variant. **AugScript: Open Welcome** opens the bundled guide and icon legend.

Same-file cases appear in VS Code's Testing view. **AugScript: Refresh Tests** rebuilds the tree; command clients receive the discovered items and any discovery errors. Use that view to run a case or group, or run `aug test` in the terminal. [Tests](testing.md) explains fixtures and endpoint tests. [CLI and configuration](tooling.md) describes language-server integration, native cache settings, and command-line tools.

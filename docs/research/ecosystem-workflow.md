# Repository packages and editor design

This contributor note records the design basis for the current package and editor workflows. Reader instructions live in [packages](../packages.md), [the weather guide](../weather-api.md), and [VS Code](../editor.md).

## Share through a public repository

Go’s module model makes source location and release identity part of a dependency’s name. Its documentation distinguishes release tags, exact revisions, caches, and authentication. August adopts a public HTTPS repository workflow with direct imports or generated aliases, resolves revisions to exact commits, and retains digests in `aug.lock.json`. It does not implement Go’s public checksum database, and a local hash does not establish publisher identity. [Go module source](https://go.dev/doc/modules/managing-source), [versions](https://go.dev/ref/mod#versions), [module authentication](https://go.dev/ref/mod#authenticating).

August packages use source, `export.aug`, an optional August manifest, tests, and a license. npm is an additional archive transport. Optional standard libraries follow the same source-package path. Consumers install source snapshots without hooks, and native packages select verified prebuilt artifacts without executable installation recipes. Publish a new tag for a changed release rather than replacing its contents. [Go publishing guidance](https://go.dev/doc/modules/publishing).

## Complete code where the developer is typing

VS Code completion supports labeled snippets, replacement ranges, documentation, sorting, and additional import edits. Code actions identify the diagnostic and apply a bounded workspace edit. August uses checked visibility and effective contracts for those suggestions, and exercises unsaved/incomplete source in editor tests. These suggestions still require the developer to choose the intended name or behavior. [CompletionItem](https://code.visualstudio.com/api/references/vscode-api#CompletionItem), [CodeAction](https://code.visualstudio.com/api/references/vscode-api#CodeAction), [snippet support](https://code.visualstudio.com/docs/editing/userdefinedsnippets).

The starter establishes a runnable project and its checking/spec workflow before introducing options. The weather template uses deterministic simulated values, a typed route, nearby tests, OpenAPI, and agent instructions. Its reader guide explains the response and how to change it; template provenance belongs outside the tutorial.

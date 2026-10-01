# Project creation, Git packages, and editor help

Research checked September 30, 2026. This note separates behavior documented by the source projects from recommendations for August. Proposed commands and import forms below are design examples, not a claim that they are implemented.

## What to borrow from Go

Go lets an author distribute a module through its source repository. The module path identifies its location, and release tags identify versions. Consumers can discover dependencies from their imports and fetch the source into a cache. A repository can contain several modules, although one module at its root is the simpler authoring path. [Go: managing module source](https://go.dev/doc/modules/managing-source)

Go accepts revision queries such as a branch or commit at the command line, then records a canonical version. Its pseudo-versions preserve a particular revision when no release tag exists. Modules can live in repository subdirectories, with a corresponding tag prefix. Cached source is checked against hashes; Go also has a public checksum database. These are separate mechanisms: storing a hash locally does not establish the publisher's identity or reproduce that database's protections. [Go modules reference](https://go.dev/ref/mod#versions), [module subdirectories](https://go.dev/ref/mod#vcs-dir), [module authentication](https://go.dev/ref/mod#authenticating)

Publishing a Go release includes testing, creating a new version tag, and pushing it. Its documentation tells authors to publish a new version rather than change an existing release. [Go: publishing a module](https://go.dev/doc/modules/publishing)

**Recommendation for August:** make a public HTTPS Git repository enough to share a library. An author should need August source, `export.aug`, one August manifest, a license, and a release tag. Keep npm archives as an additional transport, without requiring an npm account or a duplicate npm manifest for Git packages. Teach one ordinary author-to-consumer path before explaining transport alternatives.

For consumers, put the location where the dependency is used. A quoted source such as `import add from "https://github.com/example/math#v0.1.0"` is one possible form. A short package alias can remain useful when many files import the same library; let a command generate its configuration instead of making the reader maintain the mapping by hand. Avoid spelling the same URL and version in both source and configuration unless they serve different purposes.

Resolve a tag or branch to an exact commit during installation, and retain that commit, the selected repository subdirectory, and a source digest in `aug.lock.json`. A matching lock should restore that snapshot rather than follow a moved branch. Make dependency updates explicit. Continue to keep ordinary checking read-only and let `aug run` prepare missing snapshots. Distinguish “available offline” from “first download verified against a previously trusted digest.”

Git can list a remote's references and object IDs without a working-tree checkout. Annotated tags have both tag and peeled-object entries, so the resolver must retain the commit target. [Git: ls-remote](https://git-scm.com/docs/git-ls-remote)

Use subprocess argument arrays, validate repository paths and revision selectors, and disable dependency hooks. Preserve August's source-boundary and symlink checks. These are implementation recommendations, not security guarantees supplied by Go.

Move optional August libraries through the same consumer path, using actual package directories in the existing public repository. Keep compiler/runtime primitives in the toolchain. The migration must retain native adapter compatibility and make the weather starter work from an installed CLI without a language-repository checkout.

## The familiar weather API

Microsoft's ASP.NET Core web API template provides `GET /weatherforecast`. Its minimal API implementation returns five forecasts with a date, Celsius temperature, summary, and computed Fahrenheit temperature. It generates simulated values, rather than calling a weather provider. Startup, the route, and the response record are visible in its generated `Program.cs`. OpenAPI registration and its development endpoint are included when enabled. [Microsoft's minimal API template source](https://github.com/dotnet/aspnetcore/blob/main/src/ProjectTemplates/Web.ProjectTemplates/content/WebApi-CSharp/Program.MinimalAPIs.WindowsOrNoAuth.cs)

Microsoft's onboarding creates a project, runs it, opens the forecast route, and inspects the returned JSON. The tutorial also explains the generated OpenAPI document. [Microsoft: create a web API](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0)

**Recommendation for August:** offer a weather template through the installed CLI and npx, then continue with `aug run`. Keep the recognizable route and response fields. Use deterministic sample forecasts so the guide, tests, and compiled explanation agree. Say plainly that the data is simulated. Put startup in `main.aug`, the typed response and forecast operation beside their tests, and the endpoint in a nearby file if separating it helps the lesson. Include an HTTP request file, the expected JSON, OpenAPI configuration, and `AGENTS.md` with the project's own checking/spec commands. Demonstrate one change and its test after the initial successful request.

## Completion and suggested fixes

VS Code completion items accept a `SnippetString`, explicit replacement ranges, documentation, and sorting/filtering text. Additional text edits can insert an import when a completion is accepted; they must not overlap the main edit or one another. Set sorting and insertion fields in the initial result, because resolving an item later must not change them. [VS Code API: CompletionItem](https://code.visualstudio.com/api/references/vscode-api#CompletionItem)

Code actions should apply to the requested range. A quick fix can carry its diagnostic, a workspace edit, and `isPreferred` when it resolves the underlying problem. Providers should declare their supported action kinds so VS Code can avoid unnecessary requests. [VS Code API: CodeAction](https://code.visualstudio.com/api/references/vscode-api#CodeAction), [CodeActionProvider](https://code.visualstudio.com/api/references/vscode-api#CodeActionProvider)

Snippets appear in IntelliSense and the snippet picker. `editor.tabCompletion` enables insertion from a typed prefix, and numbered placeholders allow navigation through editable fields. [VS Code: snippets](https://code.visualstudio.com/docs/editing/userdefinedsnippets)

**Recommendation for August:** rank visible locals and members first, offer named argument placeholders, complete import paths and public exports, and attach Javadoc to suggestions. Add context-specific snippets for records, interfaces, implementations, endpoints, tests, error handling, tasks, and ownership scopes in the project's chosen block style. Offer fixes for misspelled visible names, missing public imports, mislabeled arguments, and absent interface members. A fix must make the program more correct; an “Explain error” action is useful help but should not be presented as a repair. Exercise these workflows against unsaved and incomplete source, since that is where users invoke completion.

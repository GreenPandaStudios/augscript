# Read the compiled specification

`aug spec` writes an explanation beside each checked source file. Read it to follow the file's inputs, decisions, results, and dependencies. Generation does not run the application or send code to a model.

[See complete example projects](examples/index.md) with highlighted source in either indentation or braces style and the actual compiled spec for every file.

```sh
aug spec .
aug spec . --check
```

| Source | Explanation |
| --- | --- |
| `main.aug` | `main.aug.md`: providers and startup operations. |
| `orders.aug` | `orders.aug.md`: inputs, behavior, helpers, and tests. |
| `export.aug` | `export.aug.md`: the names other folders can import. |
| An installed dependency | A versioned explanation and source copy under `.aug-spec/`. |

After a source change, run `aug check .` and `aug test .`, regenerate with `aug spec .`, and review the source and spec diffs together. Use `aug spec . --check` in CI to detect drift without writing files. It fails if a document, source pointer, dependency copy, or manifest is missing or stale.

Successful `build`, `run`, and `bench` commands also refresh specs after native compilation. `aug pack` refreshes them before creating the source archive. [Change an unfamiliar module](guides/change-a-module.md) walks through this workflow.

Generation also adds one managed comment at the top of each project source file:

```text
// aug-spec: "orders.aug.md" explains this file. Read it before changes; refresh with aug spec.
```

The comment points readers and coding agents to the explanation before an edit. Generation updates it after a rename and preserves handwritten comments. Installed dependencies are left unchanged. `aug spec --check` reports missing or outdated pointers without adding them.

## Move from the overview to the code (unreleased)

`aug spec` also generates Mermaid diagrams from the checked program. Open `.aug-spec/diagrams/index.md` to see calls between its folders and HTTP APIs, with their inputs and returned data. Folders containing at least two implementation files get their own linked overview; export manifests do not count toward that threshold. Each module links to an adjacent `FILE.aug.diagrams.md` containing class interactions, API calls and operation sequences. The prose spec links to that page.

Start with the project overview when you are finding your way around. Open a module to see its relationships, then follow an API sequence to its called contracts. Read the compiled explanation for the complete behavior and open the linked source when you need to change it. The [greeting project](examples/hello/diagrams/index.md) shows the same path through a small application; the [login project](examples/oidc-login/diagrams/index.md) has HTTP handlers and native dependencies.

Graphs split after 18 nodes or 30 edges. Sequence views split after 12 participants or 24 call/note steps, retaining active branch and loop context. Repeated nodes connect the views; executable calls remain in the detailed sequences. Value-only helpers keep their explanation and source links without a separate one-note diagram. Long labels end with an ellipsis, and their full expressions remain in the spec and source. The overview opens one folder level at a time. Package calls are grouped separately, and a linked contract list preserves full types behind the shorter diagram labels. Record and error construction stay in that list rather than looking like service calls. Dense folder maps split into request flows that follow a handler and two levels of its called modules; remaining boundaries get separate views. Dotted overview arrows mark deferred callbacks or browser submissions.

Imported standalone operations share their defining module’s lifeline, with each call naming the operation. Calls on the same named receiver share a lifeline; different receivers stay separate. Interface lifelines describe the checked contract, whose concrete instance may change at runtime. Solid arrows show calls with their argument values; dotted replies show returned data and its receiving variable when known. Sequences describe possible control flow, including branches, loops, early exits, errors, recovery, explicit cleanup, task starts and waits. They stop at native and dynamically selected interface contracts. Creating a callback or browser handler does not mean it runs immediately. Applied HTTP policies and interceptors are named with a link to their effective explanation. These are static diagrams, not recorded request traces.

The wiki renders Mermaid as SVG. Long sequence labels wrap. Diagrams open at a readable size and scroll when they are wider than the page. Use **Fit** for an overview, **Readable** to restore the text size, or zoom and scroll to follow a sequence. **Mermaid source** shows the portable diagram text. The example's source still switches between indentation and braces. The downloadable project contains the diagrams too.

Diagram generation shares the spec's offline, deterministic generation and `--check` workflow. It protects handwritten diagram files, removes obsolete generated pages through the manifest, and adds no timestamps or machine paths. Commit the adjacent diagrams with the specs and `.aug-spec/` to keep their links usable.

## What the document explains

Each declaration gets a short introduction and paragraphs explaining what it does. Implementations keep their complete signatures, defaults, checked errors and capability contracts in an expandable **Checked interface** section. Open it when you need the exact call contract. Bodyless interfaces keep their promises visible because the contract is their behavior. Private helpers and same-file tests are included. For endpoints, the explanation covers routes, request inputs, policies, and HTTP responses.

For example, this complete program uses two source files:

```aug project=spec-guide file=main.aug
import total from prices
print(value=total(price=7, quantity=3))
```

```aug project=spec-guide file=prices.aug
total(int price, int quantity):
    if quantity > 0:
        return price * quantity
    return 0
```

Without any author comments, the generated explanation reads:

> It takes `price` and `quantity` as integers. It returns `price` times `quantity` if `quantity` is positive, or `0` otherwise.

The explanation follows decisions, loops, recovery, and cleanup. Owned assignments name the value and its type together, without repeating a separate ownership sentence. It groups consecutive checks and collection updates when they can be explained together. For literal records, it names the fields once and lists the rows in source order. Calls that calculate inputs are explained separately.

String construction appears as readable text such as `Hello, {name}!`. Braces mark inserted values; doubled braces represent literal braces. Parentheses preserve expression grouping when it changes the meaning. These are conventions in the explanation, not new August source syntax.

Javadoc, when present, becomes part of the explanation: its summary introduces the declaration, parameter notes sit beside their inputs, and return and error notes sit beside those outcomes. Use comments to explain intent that the code alone cannot reveal.

Optional contracts describe a value or null. Omitted inputs become null too. The [language reference](reference.md#null-matching-and-checked-failures) gives the matching and narrowing rules.

## Follow a dependency {#dependencies-stay-small-and-navigable}

The dependency section lists the types, operations, and fields this file uses. Follow a link to read the dependency's full explanation. Built-in types and operations link to the language reference.

`import everything` stays valid. The spec lists the names and operations actually used by the file. Adding an unused export does not expand that list. VS Code hover still shows all names available from the import.

The compiler creates offline dependency documents from the installed source versions. Package paths include the package name and exact version; standard-library paths include the compiler version. Documents use relative links and include source links. Each behavior paragraph links to the lines that contributed to it, after any managed source pointer. In the wiki, select **source** beside a paragraph to highlight the contributing code. The highlight follows your indentation or braces preference. Select the arrow beside a code line to return to its explanation. If several paragraphs explain that range, the arrow opens a list of them. These links use formatter source maps, so switching styles retains the original source range. The adjacent Markdown keeps exact source line links. Commit generated specs and `.aug-spec/` together when you want readers to follow those links without installing dependencies.

## Optional comments, checked when required

Javadoc is optional by default and is included when present. To require it:

```yaml
spec:
  require_comments: public
```

| Value | Requirement |
| --- | --- |
| `none` | Default. Include existing Javadoc. |
| `public` | Require Javadoc for public declarations and methods in this project. |
| `all` | Also require it for private declarations and methods. |

Implementation methods can inherit documentation from their interfaces. This setting governs your project; it does not require you to edit installed dependencies. Existing validation of `@param`, `@return`, and `@throws` tags still applies.

## Editor and package workflow

In VS Code, use **AugScript: Open Compiled Specification** to generate and preview the current file's document. Save sources first. **AugScript: Generate Specifications** generates the project's documents. Language diagnostics and migration actions use the same compiler as the CLI.

`aug pack` includes adjacent specs and their offline dependency documents in the archive. The unreleased diagram generator includes adjacent diagrams and the project overview too. Consumers import August declarations normally; Markdown files do not change the package's public exports or execute code. See [packages](packages.md).

## Determinism and limits

Generation is offline and deterministic for the same checked sources, configuration, installed dependencies, and compiler version. It adds no timestamps or machine paths. A hidden revision comment records the compiler, spec schema and SHA-256 of the source bytes that the explanation describes, including its managed pointer. The digest identifies that source unit; `--check` also checks configuration and dependency changes through the regenerated documents. Explanations include inferred result types, mutations, dependencies, and escaping errors even when their clauses are absent from source. Descriptions of dependency calls come from their checked declarations and documentation, not guesses based on function names.

The spec explains the implemented program. Compare that explanation with your requirements and test the behavior; compilation alone cannot establish that the program does what you intended. [Research and implementation notes](research/code-to-natural-language.md) explain the generation approach and its evaluation limits.

ASD-STE100 guides the wording. The output is best effort Simplified Technical English, without a claim of formal compliance. Native C boundaries are explained through their declared contracts and author documentation; the compiler does not infer a foreign implementation's internals. Shared numeric, ownership, and task rules link to the language reference.

The writer refuses to replace a handwritten neighboring `.aug.md` file. Rename that file before generation. Files marked as generated belong to the compiler; edit their August source or Javadoc and regenerate.


## Review an exported explanation (unreleased)

`aug package diff BEFORE AFTER` compares two checked local package revisions. It shows changes to their exported contracts and to the corresponding spec paragraphs without generating files. Source positions and interface disclosures are kept separate from the prose comparison. JSON includes source locations and revision identities; behavioral acceptance still requires independent tests. See [package reviews](packages.md#review-a-package-change-unreleased).

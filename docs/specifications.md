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

`aug pack` includes adjacent specs and their offline dependency documents in the archive. Consumers import August declarations normally; Markdown files do not change the package's public exports or execute code. See [packages](packages.md).

## Determinism and limits

Generation is offline and deterministic for the same checked sources, configuration, installed dependencies, and compiler version. It adds no timestamps or machine paths. A hidden revision comment records the compiler, spec schema and SHA-256 of the source bytes that the explanation describes, including its managed pointer. The digest identifies that source unit; `--check` also checks configuration and dependency changes through the regenerated documents. Explanations include inferred result types, mutations, dependencies, and escaping errors even when their clauses are absent from source. Descriptions of dependency calls come from their checked declarations and documentation, not guesses based on function names.

The spec explains the implemented program. Compare that explanation with your requirements and test the behavior; compilation alone cannot establish that the program does what you intended. [Research and implementation notes](research/code-to-natural-language.md) explain the generation approach and its evaluation limits.

ASD-STE100 guides the wording. The output is best effort Simplified Technical English, without a claim of formal compliance. Native C boundaries are explained through their declared contracts and author documentation; the compiler does not infer a foreign implementation's internals. Shared numeric, ownership, and task rules link to the language reference.

The writer refuses to replace a handwritten neighboring `.aug.md` file. Rename that file before generation. Files marked as generated belong to the compiler; edit their August source or Javadoc and regenerate.


## Review an exported explanation (unreleased)

`aug package diff BEFORE AFTER` compares two checked local package revisions. It shows changes to their exported contracts and to the corresponding spec paragraphs without generating files. Source positions and interface disclosures are kept separate from the prose comparison. JSON includes source locations and revision identities; behavioral acceptance still requires independent tests. See [package reviews](packages.md#review-a-package-change-unreleased).

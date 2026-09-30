# Read the compiled specification

August keeps explanations beside the code. `aug spec` compiles each checked source file into a neighboring Markdown file. It describes the code without running the application or sending it to a model.

[See complete example projects](examples/index.md) with highlighted source in either indentation or braces style and the actual compiled spec for every file.

```sh
aug spec .
aug spec . --check
```

| Source | Explanation |
| --- | --- |
| `main.aug` | `main.aug.md`: providers and startup operations. |
| `orders.aug` | `orders.aug.md`: contracts, local behavior, helpers, and tests. |
| `export.aug` | `export.aug.md`: the folder's public surface. |
| An installed dependency | A versioned explanation and source copy under `.aug-spec/`. |

After a source change, run `aug check .` and `aug test .`, regenerate with `aug spec .`, and review the source and spec diffs together. Use `aug spec . --check` in CI to detect drift without writing files. It fails if a document, source pointer, dependency copy, or manifest is missing or stale.

Successful `build`, `run`, and `bench` commands also refresh specs after native compilation. `aug pack` refreshes them before creating the source archive. [Change an unfamiliar module](guides/change-a-module.md) walks through this workflow.

Generation also adds one managed comment at the top of each project source file:

```text
// aug-spec: "orders.aug.md" explains this file. Read it before changes; refresh with aug spec.
```

This points readers and coding agents to the explanation before they edit the code. The compiler keeps the pointer current after a rename and preserves handwritten comments. It does not edit installed dependencies. Native builds add the pointer after checking and before C emission, so source maps use the correct lines. `aug spec --check` reports missing or outdated pointers without adding them.

## What the document explains

Read a spec as a developer's explanation of the file. Each declaration has a short introduction and ordinary paragraphs about its behavior. The text explains inputs, dependencies, decisions, changes, results, and failures. It includes private helpers and same-file tests. Endpoint explanations include their routes, request inputs, policies, and HTTP outcomes.

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

Related work is explained together. Validation describes the requirements and what happens at the first failed check. HTTP results describe responses. Collection updates describe the values added or stored. Decisions, repeated effects, recovery, and cleanup remain part of the explanation.

String construction appears as readable text such as `Hello, {name}!`. Braces mark inserted values; doubled braces represent literal braces. Parentheses preserve expression grouping when it changes the meaning. These are conventions in the explanation, not new August source syntax.

Javadoc, when present, becomes part of the explanation: its summary introduces the declaration, parameter notes sit beside their inputs, and return and error notes sit beside those outcomes. Comments can explain intent that a compiler cannot infer, but readers do not need them to follow the checked inputs, operations, and outcomes.

Optional contracts describe a value or null. Omitted inputs become null too. The [language reference](reference.md#null-matching-and-checked-failures) gives the matching and narrowing rules.

## Dependencies stay small and navigable

The document follows the file's declarations and startup work. A short dependency section names only the types, operations, and fields used here, grouped by module. Their links lead to complete explanations. It does not repeat dependency signatures or implementation bodies. Built-in contracts link to the language reference.

`import everything` stays valid. The spec lists the names and operations actually used by the file. Adding an unused export does not expand that list. VS Code hover still shows all names available from the import.

The compiler creates offline dependency documents from the installed source versions. Package paths include the package name and exact version; standard-library paths include the compiler version. Documents use relative links and include source links. Commit generated specs and `.aug-spec/` together when you want readers to follow those links without installing dependencies.

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

Generation is offline and deterministic for the same checked sources, configuration, installed dependencies, and compiler version. It adds no timestamps or machine paths. Explanations include inferred result types, mutations, dependencies, and escaping errors even when their clauses are absent from source. Explanations use checked contracts; the writer does not guess what an arbitrary function does from its name.

The spec describes the checked program; it is not a proof that the implementation meets your domain's requirements. Review the explanation for clarity and intent, and use tests for behavior. [Research and implementation notes](research/code-to-natural-language.md) explain the generation approach and its evaluation limits.

ASD-STE100 guides the wording. The output is best effort Simplified Technical English, without a claim of formal compliance. Native C boundaries are explained through their declared contracts and author documentation; the compiler does not infer a foreign implementation's internals. Shared numeric, ownership, and task rules link to the language reference.

The writer refuses to replace a handwritten neighboring `.aug.md` file. Rename that file before generation. Files marked as generated belong to the compiler; edit their August source or Javadoc and regenerate.

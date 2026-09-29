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

Successful `build`, `run`, and `bench` commands refresh these documents after native compilation. `aug pack` refreshes them before creating the source archive. `--check` writes nothing and exits with a failure if a document, dependency copy, or manifest is missing or stale. Use it in CI after `aug check`.

## What the document explains

The compiler describes labeled inputs, injected dependencies, return values, state changes, capabilities, and checked failures. It follows each local branch, loop, match, recovery path, and cleanup block. It includes private helpers and same-file tests. For endpoints, it describes routes, wire inputs, policies, middleware ordering, and configured HTTP behavior.

For example, this complete program uses two source files:

```aug project=spec-guide file=main.aug
import total from prices
print(value=total(price=7, quantity=3))
```

```aug project=spec-guide file=prices.aug
/** Calculate the total for an order.
 * @param price Price of one item.
 * @param quantity Number of items.
 * @return The total, or zero for a nonpositive quantity.
 */
total(int price, int quantity) returns int:
    if quantity > 0:
        return price * quantity
    return 0
```

Its generated behavior reads:

> If `quantity` is greater than `0`, return `price` times `quantity` and finish this operation. Otherwise, return `0` and finish this operation.

The generated document preserves the actual branch structure and labels the author's Javadoc separately. Comments can explain intent that a compiler cannot infer. The compiler's description remains derived from the checked program.

Optional contracts use `optional Type`. Specs describe two possible states: a value or null. Omitted inputs become null, so missing and explicit null follow the same branch. If an older program handles missing and null differently, combine those cases deliberately before using the syntax migration command.

## Dependencies stay small and navigable

Each file's document explains the dependency surface that it uses: inputs, results, fields, capabilities, and failures. It links to the full explanation of that dependency. Dependency implementation bodies belong in their own documents.

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

Generation is offline and deterministic for the same checked sources, configuration, installed dependency versions, and compiler version. It adds no timestamps or machine paths. It uses fixed templates and the compiler's semantic information.

ASD-STE100 guides the wording. The output is best effort Simplified Technical English, without a claim of formal compliance. Native C boundaries are explained through their declared contracts and author documentation; the compiler does not infer a foreign implementation's internals. Shared numeric, ownership, and task rules link to the language reference.

The writer refuses to replace a handwritten neighboring `.aug.md` file. Rename that file before generation. Files marked as generated belong to the compiler; edit their August source or Javadoc and regenerate.

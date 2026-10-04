# Diagnostics and fixes

Start with the diagnostic's file, line, and message. The code identifies the rule that failed; the tables below explain likely remedies. VS Code shows the same diagnostics while you edit, with hover help and lightbulb actions where the compiler can offer a precise change. Warnings do not prevent a build.

Terminal diagnostics include the source line, a pointer to the location, and a `help:` explanation. `aug check --json` preserves structured diagnostics for tooling. Fix the first dependency or configuration error before investigating follow-on name errors.

If `aug run` cannot prepare or start a program, its message identifies the failed stage. A missing or incompatible artifact names the required platform and version. A failed download identifies the library and URL; retry after checking the connection. An offline cache miss explains how to prepare it online. C reference builds report missing host tools separately. Changed installed source packages require an explicit `aug install` so a run does not hide unexpected edits. A program stopped by a signal reports that signal after its own runtime output.

When a fix changes a dependency, effect, error, or mutable input, review the caller's contract too. A suggested edit can satisfy a language rule without deciding the right recovery or design for your application. [The book](learn/index.md) includes deliberate mistakes you can check and repair yourself.

## Syntax and data

| Code | Meaning and remedy |
| --- | --- |
| LEX | Check quotes, escapes, comments, Unicode, and token spelling. Strings cannot contain NUL or invalid Unicode. |
| PARSE | Check delimiters and Type name order. Declarations omit class/function; error clauses use unless. Migration fixes remove the old keywords. A constructor body needs implements after it. |
| INDENT | A colon needs a newline and indented body. Keep prefixes consistent; align dedents with an open block. Use pass for an empty body. |
| NUMBER | int literals must fit signed 64 bits, including the exact negative minimum. Float literals must be finite. |
| TYPE | Check the expected type, nullable status, generic arguments, and input/return contract. User generics are invariant unless an interface declares checked variance. |
| CALL | Supply ordinary labels exactly once; resolve inputs are omitted from a call. Inference must be concrete and consistent. |
| COLLECTION | Empty literals need context. List/Set elements and Map keys/values must fit. Tuple indexes are compile-time constants. |
| RECORD | Data fields must be deeply immutable. Records cannot retain mutable collections, DI inputs, or ownership; validation cannot replace fields. |
| MATCH | Cover null/bool cases and add else for open type domains. Remove duplicate, incompatible, or unreachable cases. |
| PATTERN | Tuple destructuring needs matching arity and new names in the current scope. |
| ITERATION | Iterate List, Set, Map, or a homogeneous Tuple; destructure heterogeneous tuples explicitly. |
| MUTABILITY | Mark class storage mutable for later writes; a function receives borrow/own access rather than a mutable storage modifier. |

Both braces and indentation are accepted. The formatter uses main.yaml preferences and checks that its output parses to the same program before returning an edit.

## Modules and interfaces

| Code | Meaning and remedy |
| --- | --- |
| PROJECT / MAIN | Supply main.aug at the root. Keep declarations in other files and imports/bindings before startup. |
| SYNTAX | Use word booleans, initialize blocks, implement/with, and resolve/to. Preview `aug migrate PROJECT`, then use --write or the editor's verified migration fix. |
| IMPORT / EXPORT | Import each file's dependencies. Cross-folder access needs export.aug; only exports belong in that file. Wildcards import visible local declarations, never internal imports. |
| NAME | Correct spelling or import a visible declaration. Quick Fix offers an import when a unique accessible source exists. |
| PRIVATE | A leading _ confines a declaration/member/module to its scope. Private names cannot be imported or exported. Constructor labels can differ from private storage. |
| INTERFACE | Classes need implements and matching method types, labels, ownership, errors, and effects. Override conflicting defaults. Records are the immutable-data alternative. |
| MODULE | An import cycle or forbidden folder dependency violates the module contract. The message includes the cycle or allowed dependencies. |
| LINT | An optional architectural warning: wildcard imports, public helper growth, dependency fan-out, broad errors, discarded errors, or explicit shared state. |

**Expand to named imports** is available for wildcard imports even without a diagnostic. Configure warnings and strict sibling boundaries in [main.yaml](tooling.md#configuration).

## State, dependencies, and errors

### EFFECT

Executable bodies infer state changes, capability calls, and escaping checked errors. Bodyless interfaces state permitted changes and I/O with `changes` and `uses dependency.operation`. An explicit clause limits what the implementation and its interceptors may do. Receive I/O capabilities through `resolve` inputs in the declaration header.

Public fields and managed inputs grant reading. Mark local storage `mutable` when it needs writes after initialization. Constructors are pure; move startup effects into a named method. `drop` performs only local cleanup; interceptors cannot add effects or errors to it.

### DI

Put bindings in `main.aug`, an imported composition, or test setup. A provider must implement its key and have only `resolve` constructor inputs. The checker rejects missing bindings, duplicate keys, cycles, scoped references retained too long, and I/O during bound construction.

Stateful objects default to fresh. Shared state requires `shared mutable`; scoped state requires `scoped mutable`. Resolve scoped dependencies inside scope; keep their references there.

A helper's dependency belongs in its callable/class header. **Lift into the dependency header** replaces a precise body resolve and adds its typed resolve parameter. The application's missing binding remains a separate build error. Calls forward one compatible header dependency.

### OWN / BORROW

An own value moves into an own input/field/return. Do not copy it into managed storage or use it after a move. A mutable borrow is exclusive and cannot escape into a return or storage. Deep read-only values cannot be borrowed to bypass their contract.

Alias tracking includes nested references, call arguments/results, DI identities, branches, and loop re-entry. An exclusive argument cannot overlap another argument or receiver. Quick Fix can wrap a standalone managed mutation in a borrow block when its local access is otherwise legal.

### CONCURRENCY

A child task keeps its captured objects available until `wait for` or its scope join. Wait before changing a captured object through a collection method, a borrowed call, or a field assignment. An already-open `borrow` block does not let the parent mutate while the child uses the object. See the [conformance rules](language-conformance.md).

### THROWS

A checked error reaches main without a compatible catch, or exceeds an explicit unless bound. Bodies infer escaping errors when unless is omitted. The language uses `unless`; THROWS is the diagnostic identifier retained for tooling.

**Propagate with unless** adds the specific error to the enclosing contract. At composition statements, **Catch and report the failure** creates a visible recovery template. Fill in the recovery template with the handling your application needs.

Errors must implement Error. List.get can raise IndexError, dynamic division ArithmeticError, file operations FileError, and c_int conversion ConversionError. Annotated callable errors include every layer's unless clause. Bound constructors must handle their layer errors internally.

## Interceptors

### INTERCEPTOR

Declare an interceptor with one implemented around method. Constructor dependencies are managed resolve parameters; generic parameters belong on the interceptor. Apply a tag to an executable callable or constructor.

Selected labels match automatically. `[Name(y=x)]` maps target x to around y. Every selected input has a compatible source, and mappings are unique. Ownership, outputs, effects, and errors must fit the target and any implemented interface. Layer dependencies also appear in the target's dependency header.

Fixes can import a visible interceptor, inject a constructor dependency, add around to a braced declaration, or migrate an obsolete process entry point.

### NEXT

Next exists only inside around. `next()` forwards original inputs; `next(y=value)` replaces a mapped input. It cannot be stored, given generic arguments, or called from a helper. Each execution path calls it at most once; retries through loops/catches are rejected.

## Tests, configuration, and native C

| Code | Meaning and remedy |
| --- | --- |
| TEST | Put a class/function suite beside its declaration. Unique groups/cases; bindings before setup before cases. Check row arity/types and execute a bool assertion in each case. |
| DOC | @param labels, value-return tags, and error tags must match the effective signature. Unknown tags are errors. Missing public docs become warnings only when enabled. |
| CONFIG | main.yaml uses the supported keys and simple YAML lists. Unknown/duplicate keys and invalid values fail during check. |
| FFI | Use supported boundary types, matching C widths, labeled inputs, unsafe, and an inferred or declared C.function effect. |
| NATIVE | A native build or link failure mapped to source or an artifact requirement. Check the named boundary or artifact; use emit-llvm for compiler diagnostics, or emit-c for an explicit C reference build. |

See [testing](testing.md) and [native tooling](tooling.md) for executable examples and exact limits.

## INFERENCE: add a type anchor

The compiler cannot infer a result when recursive calls have no concrete return evidence, or when generic contracts keep expanding. State a finite `returns T`, `uses`, or `unless` contract at that boundary. Empty collections also need a contextual item type. Other executable bodies continue to infer these clauses.

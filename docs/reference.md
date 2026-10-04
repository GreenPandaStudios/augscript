# Language reference

Use this page to look up the implemented language rules. It covers syntax, types, visibility, effects, dependency injection, ownership, and checked failures. For a first introduction, read [the August book](learn/index.md). For the reasons behind the design, read [why August exists](about.md).

August is experimental; [compatibility](compatibility.md) describes its version policy. Examples marked with a project and filename are complete, tested applications. Short `text` blocks are syntax fragments.

## A complete project

`main.aug` contains imports, dependency bindings, and startup statements. Declarations live in other files. Every file has its own import scope.

```aug project=quickstart file=main.aug
import Console and SystemConsole from august.io
import Application from app

implement Console with SystemConsole
implement app with Application

resolve app to program
program.start()
```

```aug project=quickstart file=app.aug
import Console from august.io

/** The application's startup behavior. */
interface Runnable:
    start() uses Console.write

/** Construction receives dependencies and performs no I/O. */
Application(resolve Console console) implements Runnable:
    start():
        console.write(value="Hello, AugScript!")
```

Run `aug run PROJECT`, or choose **AugScript: Run Project** in VS Code. You need Node.js 24+ and a [supported host](compatibility.md). The CLI obtains its LLVM compiler/runtime pack and package artifacts automatically.

## Blocks and statement boundaries

Either spelling creates the same block:

```text
if ready {
    work()
}

if ready:
    work()
```

A colon must be followed by a newline and an indented body. Use a consistent spaces-only or tabs-only prefix within each indentation region. Nested regions must agree with their parent's prefix. Blank lines and comment-only lines do not create blocks. Misaligned dedents, extra indentation, and mixed prefixes are errors. Braced children can appear in an indented block.

Parentheses and collection literals allow continuation across lines; their indentation does not create a statement block. Literal `{1, 2}` and `{1: "apple"}` retain their meaning. `pass` is an empty statement, useful for empty interfaces and bodies.

A newline, a closing block brace, EOF, or an optional semicolon terminates a statement. Separate two statements on one line with a semicolon. An unfinished operator continues an expression; a leading operator or call parenthesis on a new line does not attach to the previous statement. Start a return value on the same line as `return`. See [the grammar](grammar.md).

Use `and`, `or`, and `not` for booleans. They short-circuit. Comparisons bind before `not`: `not count == 0` means `not (count == 0)`. The symbolic boolean operators are rejected; `!=` still compares for inequality.

## Imports and visibility

`import Name from sibling` imports only that sibling's own public declaration. Imports are explicit even within a folder. Names beginning with `_` are private to their declaring file, class, or interface, and cannot be imported or exported.

A folder's `export.aug` names the declarations other folders can import:

```text
export Logger from logger
export ConsoleLogger from console
export folder nested
```

Cross-folder access requires the export entry. A dotted path also requires each crossed child folder to be exposed by its parent. A folder with no export file exposes nothing across its boundary. `export.aug` accepts only exports. Private modules and folders cannot be exported.

`import Logger and ConsoleLogger from logging` combines imports. `import everything from logging` imports visible declarations and rejects collisions; it never exposes a module's internal imports. The formatter preserves it. Hover shows available names, **Expand to named imports** offers an explicit list, and the [compiled spec](specifications.md) explains dependencies actually used.

Import cycles are errors. Configure allowed module dependencies and export-count warnings in `main.yaml`. `strict_modules: true` also requires sibling imports to appear in the local export file. Ctrl-click `from` or a path segment to open its source file or export file, including `august.io`.

Project dependencies use aliases in `main.yaml`: `packages: math: "npm:@owner/aug-math@1.2.3"` as a nested YAML block. Run `aug install`, then write `import add from math`. A library exposes only its source folder's `export.aug`; internal modules and undeclared transitive dependencies are inaccessible. See [creating and using packages](packages.md#author-a-package).

## Types, labels, and generics

Built-in types include `int`, `c_int`, `float`, `bool`, `string`, `void`, `Error`, runtime error classes, `List<T>`, `Set<T>`, `Map<K,V>`, `Tuple<T1,...>`, Bytes, Json, Html, Task<T>, Shared<T>, HttpRequest, HttpResponse<T>, ServerEvent<T>, and opaque RSA key types. `optional T` allows a value of T or null. Omitted optional inputs and fields become null; there is no separate missing state. `Type?`, `optional Type?`, and the old missing keyword are rejected.

Write `Type name = expression`, `Type name to expression`, or an inferred assignment. Every ordinary input in a call has its public label: `add(right=2, left=1)`. Each label is supplied once. Inputs marked `resolve` are supplied through composition and cannot be passed explicitly.

User generics are invariant by default. Inference must produce a concrete, consistent type; repeated occurrences of a type parameter cannot disagree. Empty literals can infer from other labeled arguments. Explicit arguments remain available when inference has no evidence.

```aug project=generics-guide file=main.aug
import Item and describe and Holder and Named and Producer from types

print(value=describe(value=Item()))
Producer<Named> item = Holder(value=Item())
print(value=item.get().name())
```

```aug project=generics-guide file=types.aug
interface Named:
    name() returns string

Item() implements Named:
    name() returns string:
        return "item"

describe<T implements Named>(T value) returns string:
    return value.name()

interface Producer<out T>:
    get() returns T

Holder<T>(T value) implements Producer<T>:
    get() returns T:
        return value
```

Constraints name interfaces. Multiple constraints use `and`. Only interfaces declare `out T` or `in T`; the compiler checks every occurrence, including inherited members. Classes, records, and mutable collections remain invariant. Generic DI keys must be concrete, such as `Repository<int>`.

## Classes, records, and local state

A class starts with its name and ends its header with `implements Interface`. There is no `class` or `function` prefix and no class inheritance. Interfaces can extend several interfaces and supply default methods; conflicting inherited defaults require an explicit override. Interfaces have methods and no fields.

An initializer can reject construction with a checked error. Write the error before `implements`: `Session(own Handle handle) unless SessionError implements ActiveSession`. Callers must catch or propagate it. Class constructors require a written `unless` clause; record validation can infer failures.

If construction fails after ownership transfers, August releases the partially constructed object and its initialized owned fields, then propagates the constructor error. It does not call `drop` on a partial object. `drop` runs only after successful construction.

Construct fallible classes explicitly. They cannot be DI binding targets because injected-construction failure handling is not yet supported.

Header inputs become fields. Fields are read-only after initialization unless marked `mutable`. Public names grant access; names starting with `_` keep storage private. Separate a public constructor label from private storage with `int initial to _count`. The shorthand `int _count` exposes the input label `count`.

```aug project=state-guide file=main.aug
import Counter from counter

counter to Counter(initial=4)
borrow counter:
    counter.increment()
print(value=counter.value())
```

```aug project=state-guide file=counter.aug
interface Count:
    increment() changes self
    value() returns int

Counter(mutable int initial to _count) implements Count:
    initialize:
        _count = _count + 1
    increment() changes self:
        _count = _count + 1
    value() returns int:
        return _count
```

The optional `initialize` block runs after header and local field initialization and must be pure. It may establish local fields. Put it before methods. Put external startup work in a named method and call it from main.

An immutable record is data and needs no marker interface:

```aug project=data-guide file=main.aug
import Point from data

point = Point(y=2, x=1)
print(value=point == Point(x=1, y=2))
print(value={point, Point(x=1, y=2)}.length())
(first, second) = (1, "pear")
print(value=second)

for (key, value) in {1: "apple", 2: "pear"}:
    print(value=value)

Map<int, string> fruit = {1: "apple"}
match fruit.get(key=7):
    when null:
        print(value="missing")
    when some name:
        print(value=name)
```

```aug project=data-guide file=data.aug
record Point(int x, int y)
```

Record fields contain data, including safe literal or explicitly frozen collections. A mutable collection alias must be frozen before storage. Records cannot retain capabilities or ownership inputs. Records compare and hash by type and field values. Validation uses `record Positive(int value) unless DomainError { initialize { ... } }`; it may reject an input, and cannot replace immutable fields. Behavioral classes compare by identity.

## Collections and iteration

| Literal | Type | Behavior |
| --- | --- | --- |
| `[1, 2]` | `List<int>` | Ordered, mutable elements. |
| `(1, 2)` | `Tuple<int,int>` | Fixed positions; `(1,)` is a singleton. |
| `{1, 2}` | `Set<int>` | Unique elements with hashing. |
| `{1: "apples", 2: "pears"}` | `Map<int,string>` | Hashed keys; the last duplicate key wins. |

Empty literals require context: `List<int> values = []`, `Set<int> values = {}`, or `Map<int,string> values = {}`. Typed declarations require a variable name. Mixed integer/float literals widen to float. A tuple can contain different types. `(1)` is grouping and `()` is an empty tuple.

| Type | Reading | Mutation |
| --- | --- | --- |
| List | `length()`, `get(index=...)` unless IndexError, `at(index=...)` returns `optional T` | `append(value=...)` |
| Set | `length()`, `contains(value=...)` | `add(value=...)` |
| Map | `length()`, `contains(key=...)`, `get(key=...)` returns `optional V` | `set(key=..., value=...)` |
| Tuple | `length()`, `get(index=constant)` with compile-time bounds | None |

Managed mutations need a borrow; owned collections mutate directly. Collections cannot store borrowed or owned references by copying them. Reference results grant reading.

**Unreleased:** `values[index]` reads a List with the same checked IndexError as get, a Map with an optional result, or a Tuple with a compile-time constant position. Indexing does not grant mutation; text and byte operations stay explicit.

**Unreleased loop control.** `break` leaves the nearest loop; `continue` starts its next iteration. Both run intervening `always` cleanup, join child scopes, release locks and borrows, and drop owned locals. A cleanup error propagates instead of completing the jump. Neither accepts a label. Jumps require an enclosing `for` or `while`; an `always` block cannot jump out of its cleanup.

Tuple destructuring introduces new local names and checks arity. A one-name tuple pattern binds the tuple’s cell; use `(value,)` for a one-cell tuple. A single loop item or wait result still receives its whole value. `for item in values` snapshots List, Set, and homogeneous Tuple elements. `for (key, value) in map` snapshots entries in insertion order. Modifying the original collection does not extend the current iteration. Reference elements remain read-only.

## Functions, effects, and capabilities

A bare header without `implements` declares a function. A body infers its result from return expressions or an implemented interface. A body with no returned value has a void result; a bodyless signature needs `returns T` for a non-void result. Non-void bodies must return or throw on every path. A bodyless top-level declaration cannot be called unless it is an extern declaration.

Bodies infer capability use and state transitions. Bodyless interfaces declare permitted `uses` and `changes`; mutable reference inputs require `borrow` or `own`. A helper cannot mutate a managed input, an alias, or nested objects reachable through it.

I/O uses capability interfaces and checked `uses dependency.operation` contracts. Capability types have interface behavior and permit explicit adapter substitution. The standard `august.io` folder provides Console/SystemConsole, FileReader/FileWriter/LocalFiles, and Arguments/ProcessArguments.

```aug project=capabilities-guide file=main.aug
import Console and SystemConsole from august.io
import announce from messages

implement Console with SystemConsole
announce(message="Dependencies are visible")
```

```aug project=capabilities-guide file=messages.aug
import Console from august.io

announce(resolve Console console, string message):
    console.write(value=message)
```

A caller's contract must include the effects of its calls and interceptor layers. Interface implementations cannot add mutation or effects beyond the interface contract. A contract may name `Console.write` when a concrete dependency is exposed through another interface.

### Short implementation headers

Executable functions, methods, interface defaults, and interceptors infer omitted `returns`, `changes`, `uses`, and `unless` clauses. Return expressions determine the result; calls and writes determine capabilities and observable mutations; failures that escape catches determine checked errors. Record validation also infers escaping failures.

```text
import Console and FileReader from august.io

interface Logger:
    log(string message) uses Console.write

ConsoleLogger(resolve Console console) implements Logger:
    log(string message):
        console.write(value=message)

load(resolve FileReader files, string path):
    return files.read(path)
```

The editor shows `uses Console.write` beside `log` and `returns string uses FileReader.read unless FileError` beside `load` as non-editable hints. These clauses are absent from saved code. Hover, `aug explain`, generated API docs, and `aug spec` use the same checked contracts. Formatting preserves any clauses you wrote explicitly.

Bodyless interfaces and foreign declarations describe contracts the compiler cannot inspect. A written clause remains a checked assertion: `returns void` rejects a returned value, and an explicit `uses` or `unless` limits the body. Implementations must satisfy their interface. An interface with no effects remains pure. Inference follows calls and generic substitutions independently of declaration order. Recursive results without an anchor, empty collections without a contextual type, and expanding generic contracts need an explicit type or finite contract.

`borrow`, `own`, `resolve`, `mutable`, HTTP input sources and error-status mappings express permissions or choices. They stay in source. Inferred mutation cannot grant access to a managed input. Constructors and `drop()` keep their purity rules, and inferred I/O remains forbidden under a lock. A fresh local `Shared` value needs no artificial external-effect clause; retained external shared state still requires its capability or mutation contract. A forwarding interceptor can inherit each target's result; an interceptor that needs a fixed result contract can state it.

Capability implementations inherit their operation contract even when a test adapter does no I/O. This includes shared-state capabilities such as `ExpiringStore<T>`. An unhandled error in main still fails checking; inferred propagation through a helper does not handle that failure.

Outside main and test setup, every injected dependency is declared in the callable/class header. Calls forward the one compatible header dependency; multiple candidates require a clearer header. Constructor and interceptor dependencies are checked the same way. Body-level `resolve` is rejected with a fix to lift it into the header.

Raw `print`, `arguments`, `read_file`, and `write_file` are available to main/test tooling and the trusted standard adapters. Other callables receive explicit capabilities. Pure construction cannot perform these effects.

## Dependency injection and lifetimes

Provide one implementation per key before startup: `implement Logger with ConsoleLogger`. A named key such as `app` selects a class without a type key. `resolve app to program` retrieves it explicitly. Legacy `bind` and assignment-form resolve are rejected; use `aug migrate` or the editor migration fix.

A bound class must have only `resolve` header inputs. Duplicate bindings, missing dependencies, cycles, incompatible keys, and effectful bound construction are errors. Diagnostics show the dependency path. Declaration order does not determine initialization order.

| Lifetime | Meaning |
| --- | --- |
| `shared` | One eagerly constructed instance per composition. Default for stateless adapters. |
| `fresh` | Construct on each resolve. Default for stateful classes. |
| `scoped` | Cache inside an explicit `scope` block; nested scopes have their own cache and restore the outer cache. |

Statefulness includes mutable fields, owned mutable storage, `changes self` methods, and retained stateful dependencies. Process-wide state requires `shared mutable`. Stateful scoped bindings use `scoped mutable`. Scoped dependencies require a scope even through fresh factories; shared objects cannot retain them.

A scoped reference cannot escape into an outer variable, a return, or longer-lived storage. A first-class `composition Services { implement ... }` collects bindings in an explicitly imported module. Main or test setup uses `include Services` before execution. There is one root and no implicit registration.

See [the scoped composition example](../examples/approved-design/counters.aug).

## Ownership and read access

**Unreleased:** a new local initialized by a call with an `own` result inherits ownership. For example, `connection = open(path)` has deterministic cleanup when `open` returns an owned connection. Editor hints and the spec show that lifetime. Copies or transfers from an existing owned local still require an explicit `own` destination; a fresh managed result does not imply ownership.

Default objects are managed and reclaimed by the runtime. Ordinary reads require no borrow. An `own` value has exclusive lifetime control; passing it to an own input, field, or return moves it. Using a moved value or copying it into managed storage is rejected.

`borrow value { ... }` or its colon form grants exclusive mutable access. A `borrow Type input` grants it for the call. The compiler tracks aliases, nested references, binding identities, call inputs/results, branch joins, escaping loans, and loop re-entry. Ordinary managed inputs and public reference reads are deep read-only views.

Owned values are dropped on normal or error exits. An optional `drop()` method takes no inputs, returns void, and performs only local cleanup. Cleanup layers cannot add effects or errors. External shutdown work belongs in an explicit effect-declared method. Managed objects are collected at runtime safe points; process roots survive to shutdown.

`Shared(value=...)` takes a fresh or owned value. The wrapper owns that payload, so dropping an owned `Shared<T>` also runs the payload's `drop()` before later local cleanup. A `resolve` dependency counts as a call input for alias checks: it cannot refer to an object also passed as an exclusive input. A scheduled task captures dependencies supplied through `resolve` as well as written call arguments. Wait for a task before mutably borrowing an object it reads through either path.

A child borrowing an owned `Shared<T>` pins the wrapper until the child finishes. The parent cannot transfer it to another owner, put it in another `Shared<T>`, or return it while the child uses it. A child can still read a `Shared<T>` concurrently through its own reference. Use `lock` to access the payload.

If a child starts while a `borrow` block is already open, the parent cannot mutate the captured object until it waits. The rule also applies to a borrowed function call or a direct field assignment. See the [executable conformance rules](language-conformance.md).

If `start` runs inside a loop, a wait for one result may leave children from earlier iterations running. Their captures remain pinned until the enclosing `scope` joins them. To release captures on each iteration, put a `scope` inside the loop and finish its children there.

For a collection of tasks, `wait for tasks` joins the whole list. Waiting for one task selected with a dynamic index cannot prove which sibling tasks remain active, so their captures stay pinned until the scope joins them.

When the checker cannot establish separate origins or freshness, it rejects the access. These conservative checks are not a formal ownership proof. Tasks run cooperatively on one OS thread; multicore execution is unsupported.

## Null, matching, and checked failures

**Unreleased:** `name otherwise "Guest"` evaluates its right operand only when the left operand is null. Both operands have compatible types. False, zero and empty text remain values; this expression does not catch failures or transfer owned resources. Use an explicit match when selecting ownership.

Nullable locals narrow after null checks, short-circuit conditions, match patterns, and surviving early-return branches. Mutable fields are narrowed conservatively.

`match value` uses `when null`, `when some name`, `when true`, `when false`, or `when Type name`. Nullable and bool matches must cover every case. Open class/interface domains require `else`. Duplicate/unreachable cases and incompatible patterns are errors.

**Unreleased:** `error InvalidQuantity(int value)` declares a data-only Error implementation without an empty body. Its fields, labels, checked propagation and cleanup follow ordinary classes. It cannot contain injected, owned or mutable storage; use a full Error implementation for custom behavior.

An error satisfies Error. A body infers escaping errors. A bodyless signature or explicit bound names specific errors with `returns T unless FileError and DomainError`. It can throw any value satisfying its declaration; declaring Error accepts any Error implementation. Calls must catch or propagate all effective errors, including interceptor layers; executable callers infer propagation when unless is omitted.

`start worker` schedules a standalone function on an OS thread with a private heap and copied data. Its inputs cannot be injected or owned/borrowed references, and its result and errors must be copied data. Construct services and native resources inside the worker; [worker boundaries](workers.md) explain the supported types and native contracts.

`start` evaluates its receiver and arguments immediately; their errors belong to the scheduling statement. The scheduled operation's errors belong to a `wait for` or its owning scope's implicit join. Unobserved sibling failures can reach any wait in that group. Grouped waits observe every selected child, including cancellation cleanup, and rethrow the first failure. A helper awaiting a `Task<T>` parameter declares or handles `Error`, since that public type does not specify a narrower error contract yet.

A cooperative task can take an owned input. Scheduling transfers cleanup responsibility to
the child, including when cancellation occurs before its function runs. A task
cannot return an `own` value: `Task<T>` has no owned-result transfer contract.
Create and release resources inside the task, then return immutable data.

Owned locals in a `try` or `catch` body are released when that body exits, before
its `always` block runs. This order applies to normal execution, returns and
errors. Values owned by the enclosing function remain live until that function
exits. Cleanup suspends pending errors and cancellation while a `drop` method
runs, then restores them.

An error already leaving the parent remains the reported error if cancelling a child causes its cleanup to fail. `always` cleanup still runs for that child. A `return` from a scope joins its children before the caller receives the result.

```aug project=errors-guide file=main.aug
import load from files
import FileReader and LocalFiles from august.io

implement FileReader with LocalFiles
try:
    print(value=load(path="definitely-missing.txt"))
catch FileError error:
    print(value="No configuration available")
```

```aug project=errors-guide file=files.aug
import FileReader from august.io

/**
 * Read a configuration file.
 * @param path File path.
 * @return UTF-8 text.
 * @throws FileError Reading failed or the text is invalid.
 */
load(resolve FileReader files, string path):
    return files.read(path=path)
```

List.get raises IndexError; List.at returns null. Division by a potentially zero value requires ArithmeticError handling. Literal nonzero divisors need no error clause. Runtime invariant corruption and allocation failure remain fatal.

Quick Fix offers propagation through `unless` or an explicit recovery template. Optional lints flag broad Error contracts and discarded errors. The internal diagnostic code for unchecked failures remains THROWS; the language spelling is `unless`.

## Interceptors

A first-class `interceptor` wraps a function, method, or constructor. It defines one implemented `around`, may have helper methods and resolve dependencies, and needs no interface.

```aug project=interceptors-guide file=main.aug
import describe from descriptions

print(value=describe(x=4, label="answer"))
```

```aug project=interceptors-guide file=descriptions.aug
interceptor AddOne<T>:
    around(int y) returns T:
        return next(y=y + 1)

[AddOne(y=x)]
describe(int x, string label) returns string:
    return label
```

Around selects only the target inputs it needs. Labels match automatically; `[Validator(y=x)]` maps target x to around y. Resolve inputs are declared dependencies, never mappings. Types, ownership, effects, errors, and results are checked. Generic arguments can be inferred or supplied.

Layers execute in written order; the first is outermost. `next()` forwards original inputs to the next layer or target. Labeled overrides change mapped inputs, while unselected inputs pass through. Each path calls next at most once. A layer can deliberately short-circuit with a compatible result or error.

Every layer dependency must appear in the target's header dependencies; registration is explicit. Constructor layers must be pure. Callable hover and explain/context output show layer order, dependency origins, added effects/errors, delegation, and possible short-circuiting.

See [the complete validation and testing example](../examples/approved-design/domain/numbers.aug).

## Documentation, tests, and tooling

Javadoc immediately before a declaration feeds hover, completion, and signature help. Supported tags include `@param`, `@return`, `@throws`/`@exception`, `@see`, and `@deprecated`; `{@code ...}` and `{@link ...}` format inline help. Parameter labels, return tags, and effective error tags are checked; mismatches are DOC errors. Implementations can inherit interface method documentation.

`aug spec` compiles each file's complete behavior into an adjacent Markdown explanation. Comments are optional unless `main.yaml` sets `spec.require_comments` to `public` or `all`. See [compiled specifications](specifications.md).

Enable the public_docs lint for missing public descriptions. Keep behavior examples in [same-file class or function suites](testing.md). [Explain/context](tooling.md#context-for-developers-and-llms) gathers contracts and provenance with a bounded output budget. The persistent editor server checks local modules while an application root is unfinished; complete composition remains a build gate.

Numeric widths, Unicode behavior, FFI, configuration, debugging, benchmarks, and CLI output are specified in [the tooling guide](tooling.md).

First-party endpoints, wire inputs, HTTP policies, streams, server components and actions, scoped tasks, OpenAPI, endpoint tests and cryptographic capabilities are specified in the [web guide](web.md). The [same-app login proof](../examples/oidc-login/README.md) demonstrates these features through an OpenID Connect provider and client in one executable.

### Literal parameter defaults (unreleased)

An ordinary managed input can declare a scalar or collection literal default: `greet(string name = "August")`. The default supplies an omitted label; passing `null` remains an explicit value and requires an optional type. A collection default is created afresh for each call. Defaults cannot read names, call functions, resolve dependencies, or perform effects. They are part of an interface's checked signature and appear in hover and compiled specs. Native, HTTP-bound, injected, borrowed, and owned inputs do not accept defaults in this profile. Constructor inputs follow the same rule; a storage alias precedes its default, as in `int initial to _count = 0`.

### String interpolation (unreleased)

`$"Hello, {name}!"` builds text from checked scalar expressions. Each expression runs once, from left to right. Integers use decimal notation, booleans use `true` or `false`, null uses `null`, and floats use invariant binary64 text with up to 17 significant digits. Double an opening or closing brace to insert it literally. Ordinary quoted strings never interpolate. Records and collections require an explicit formatter. Interpolated text is not HTML or SQL escaping; use the typed markup and parameterized database interfaces for those contexts.

### Integer remainder (unreleased)

`left % right` returns the remainder after integer division truncates toward zero. A nonzero result has the dividend's sign: `-7 % 3` is `-1`. Zero divisors raise checked `ArithmeticError`; the signed minimum divided by `-1` has remainder zero. Floating operands are rejected. Addition, subtraction, and multiplication retain their existing wrapping int64 rules.

### Text helpers (unreleased)

Use `endsWith(suffix)` for an exact suffix and `replace(search, replacement)` for nonoverlapping exact replacement. Replacement rejects an empty search with `ConversionError`. `List<string>.join(separator)` retains order and empty elements; an empty list produces empty text. `codePointLength()` counts Unicode scalar values after checking UTF-8; combining marks remain separate. `length()` continues to count UTF-8 bytes, and `utf16Length()` counts UTF-16 units. Code points are not grapheme clusters.

`parseInteger()` accepts decimal digits with an optional leading minus and checks signed int64 bounds. `parseFloat()` accepts finite invariant decimal text, including a fraction and exponent, and rejects overflow and underflow. Both reject whitespace, a leading plus, trailing text, and embedded NUL with `ConversionError`. Trim input explicitly when that is the intended contract.

### Immutable collection contracts (unreleased)

`record Invoice(string number, immutable List<Line> items)` states that a collection and all its reachable data are frozen. Nested collection literals can satisfy this contract directly; their construction freezes the result without copying it. An existing mutable collection must be explicitly frozen first. The qualifier applies to `List`, `Map`, `Set`, and `Tuple` of data values, including immutable records. It does not make a behavioral object immutable. Mutation and mutable borrowing remain rejected through every alias; lookups retain the deep frozen guarantee.

### Record copies (unreleased)

`paid = invoice with (paid=true)` creates a new value of the same record type. It evaluates the original once, then replacement expressions once in written order, retains unchanged data, and runs construction validation. Its checked failures remain caller obligations. Labels are the record's constructor inputs; duplicate or unknown replacements and access to private fields are rejected. This operation does not mutate the original or copy an entire unchanged collection. Mutable aliases cannot enter replacements; freeze them explicitly first.

## Bounded integer ranges

**Unreleased:** `import range and RangeError from august.collections` supplies an ordinary library function. `range(end=5)` allocates a new list containing 0, 1, 2, 3 and 4. `range(start=5, end=0, step=-2)` contains 5, 3 and 1. The boundary is excluded. A step facing away from it produces an empty list.

`step` defaults to 1 and must be nonzero. `limit` defaults to 1,000,000 and must be from 1 to 1,000,000; producing more items raises `RangeError`. A step past the int64 boundary ends the range without wrapping values into its output. For very large numeric loops, use `while` to avoid allocating the list.

`start` and `wait` are contextual names: they can name a function or an input. `start calculate(...)` starts work, and `wait for pending` joins it; reading a value named `start` or `wait` does neither.


For example, this complete program prints the three values before the exclusive boundary:

```aug project=bounded-ranges file=main.aug
import range and RangeError from august.collections

try:
    for value in range(start=1, end=4, limit=3):
        print(value=value)
catch RangeError error:
    print(value=error.message)
```


## Checked mathematics (unreleased)

Import `checkedAdd`, `checkedSubtract`, `checkedMultiply`, `checkedDivide`, `checkedNegate`, `checkedAbs`, or `checkedSum` from `august.math` when an integer calculation must stay within int64. These ordinary August functions raise `ArithmeticError` on overflow; division also rejects zero. `checkedSum` visits a list in order and rejects an overflowing intermediate sum. Ordinary operators keep their wrapping behavior.

`Decimal(coefficient=1250, scale=2)` represents exactly 12.50. Its signed int64 coefficient and scale from 0 to 18 are immutable record fields. Use `parseDecimal(text="12.50")` and `formatDecimal(value=amount)` for invariant ASCII text. Parsing accepts an optional minus, integer digits, and an optional dot with fractional digits; it rejects whitespace, plus, exponent notation, non-ASCII digits, text over 64 bytes, and an unrepresentable coefficient with `ConversionError`. Formatting preserves trailing zeroes. Negative zero loses its sign.

`addDecimals` and `subtractDecimals` use the greater operand scale. `multiplyDecimals` adds scales. `divideDecimals` requires the output scale explicitly. `rescaleDecimal` adds or removes fractional zeroes exactly. Each coefficient calculation and intermediate alignment must fit int64; excess scale raises `ConversionError`, while overflow, zero division or a discarded nonzero digit raises `ArithmeticError`. There is no implicit rounding or arbitrary-precision fallback. A mathematically representable result can still fail if an intermediate coefficient exceeds int64.

Use `compareDecimals(left, right)` for numerical ordering: it returns -1, 0, or 1 without aligning integer coefficients. Record equality includes scale, so 1.0 and 1.00 are distinct records but compare numerically equal. These functions do not choose currency, precision or rounding policy for an application.

```aug project=checked-math file=main.aug
import parseDecimal and addDecimals and formatDecimal from august.math

try:
    price = parseDecimal(text="0.10")
    tax = parseDecimal(text="0.20")
    total = addDecimals(left=price, right=tax)
    print(value=formatDecimal(value=total))
catch ArithmeticError error:
    print(value="The exact calculation exceeds its limits")
catch ConversionError error:
    print(value="Invalid decimal input")
```

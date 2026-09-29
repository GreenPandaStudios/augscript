# Built-in unit tests

Tests live in the same file as the declaration they describe. Class suites use `test ClassName subject`; function suites use `test functionName`. Tests are excluded from production executables, and no test package is required.

Endpoint suites use `test endpoint endpointName client`. HttpTestClient enters the native routing and policy pipeline with explicit method, relative path, headers and optional Bytes body. Group bindings supply fresh test dependencies; production startup is excluded. See the [complete service and endpoint cases](web.md#endpoint-tests). Live sockets, TLS negotiation and disconnect behavior require transport tests separately.

## A complete function suite

```aug project=testing-guide file=main.aug
import add from math

print(value=add(left=1, right=2))
```

```aug project=testing-guide file=fixtures.aug
/** A reusable, pure test input. */
fixture seven() returns int:
    return 7
```

```aug project=testing-guide file=math.aug
import seven from fixtures

/**
 * Add two integers with defined wrapping.
 * @param left First operand.
 * @param right Second operand.
 * @return Their sum.
 */
add(int left, int right) returns int:
    return left + right

test add:
    when addition:
        it adds for (left, right, expected) in [(1, 2, 3), (4, 3, 7), (0, 0, 0)]:
            assert(add(right=right, left=left) == expected)

        it uses_fixture:
            assert(add(left=seven(), right=0) == 7)
```

Each tuple row becomes a separately listed and executed case. Row arity and types are checked. The row variables are local to that case. Fixtures are ordinary checked functions marked `fixture`; import them explicitly and declare any dependencies/effects. They create no implicit fixture scope and remain callable as ordinary functions.

## A complete class suite

```aug project=class-testing-guide file=main.aug
import Counter from counter

counter = Counter(initial=1)
print(value=counter.value())
```

```aug project=class-testing-guide file=counter.aug
interface Count:
    increment() changes self
    value() returns int

Counter(mutable int initial to _count) implements Count:
    increment() changes self:
        _count = _count + 1
    value() returns int:
        return _count

test Counter counter:
    when increment:
        counter = Counter(initial=3)
        it advances:
            borrow counter:
                counter.increment()
            assert(counter.value() == 4)
        it starts_fresh:
            assert(counter.value() == 3)
```

The subject header identifies a local class and the variable used to test it. It does not invoke the constructor; initialize that subject in setup or the case. Generic classes use concrete type arguments. Tests follow ordinary member privacy and cannot access private fields merely because they share the file.

## Groups, setup, and dependencies

Group/case names are identifiers or quoted strings. A suite's groups are unique; a group's cases are unique. Within a group, place bindings or included compositions first, setup statements second, and cases last. Nested groups are not supported.

Every case gets its own setup, bindings, native process, managed heap, and assertion state. Production main bindings and startup never run. Setup variables are visible only to that case. All bindings use ordinary graph, lifetime, and purity checks.

Resolve expressions belong in setup. Test bodies and helpers receive visible dependencies through setup variables or headers. A test can explicitly replace a capability with a private adapter. See [the runnable calculator tests](../examples/developer-workflow/calculator.aug).

Process isolation does not reset files, databases, sockets, or other external resources. Use explicit adapters or case-specific resources for integration tests.

## Assertions and failure

`assert(condition)` and `assert(condition=condition)` require a bool. A failed assertion reports file, line, and source condition. Catching its error cannot make the case pass. Setup may assert its invariants, but every case body must also execute an assertion. A body that executes none fails.

An uncaught checked error, a native crash, a nonzero exit, or a timeout fails the case. Assertions are test operations, not production contracts.

## CLI and coverage

Use `aug` when installed, or `node bin/aug.mjs` from this repository.

| Command | Action |
| --- | --- |
| `aug test PROJECT` | Run all cases. |
| `aug test PROJECT GROUP_NAME` | Select an exact group name. |
| `aug test PROJECT --group NAME` | Same explicit selection. |
| `aug test PROJECT --list --json` | Discover IDs, subject, group, case, row, file, and line. |
| `aug test PROJECT --case ID` | Select an exact ID; repeat for several. |
| `aug test PROJECT --json` | Machine-readable pass/fail counts and captured output. |
| `aug test PROJECT --timeout 2000` | Limit each native execution to 2 seconds. |
| `aug test PROJECT --coverage` | Merge executed statement lines across selected cases. |

Selection is exact and case sensitive. Quote names containing spaces. Unknown selections fail. The default timeout is ten seconds per native case; compilation is outside that timeout.

Test C and binaries live under `.aug-build/tests/`. Coverage writes `.aug-build/coverage/coverage.json` and `lcov.info`, retaining zero-count executable lines in the compiled test closure. It reports statement lines, not branch coverage. Production startup is omitted, so the result is not whole-application startup coverage. Filtering reports only selected tests and their reachable declarations.

`aug check` checks production and test bodies. `aug test` checks selected tests and their reachable declarations; it does not execute or type-check production startup. A test project still has a root main.aug.

## VS Code

Test Explorer groups cases by project, declaration, and when group. Parameterized rows have separate entries and source locations. Saving refreshes discovery; **AugScript: Refresh Tests** refreshes it manually. Running saves pending edits first. Cancellation skips remaining cases after the active case finishes or times out.

Choose **Native tests** to run or **Native coverage** to see merged statement-line coverage when the installed VS Code supports its coverage API. **AugScript: Test Project** runs the project CLI in a task terminal.

The adapter uses the [VS Code Testing API](https://code.visualstudio.com/api/extension-guides/testing). `try`/`always` performs explicit cleanup; snapshots and nested groups are not part of this version. Each selected case currently compiles a separate native binary.

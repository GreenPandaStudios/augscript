# Built-in unit tests

Write tests beside the declaration they check. `aug test` compiles and runs them as native programs. Test bodies are excluded from production executables.

The AUG-0001 development compiler can enumerate bounded literal domains into existing parameterized rows and record concrete replay evidence. Setup and assertions remain independently authored. See [checked changes](checked-changes.md#enumerate-independent-test-inputs) for the experimental protocol, vector limits, exclusions and separate compiler/behavior gates.

Use `test functionName` for a function or `test ClassName subject` for a class. If testing is new to you in August, work through [State and tests](learn/state-and-tests.md) first. For HTTP, use [endpoint tests](web.md#endpoint-tests); they exercise routing and policies, while live sockets and TLS need separate transport tests.

## A complete function suite

Save these three files in one folder. `aug run .` prints `3`; `aug test .` runs four cases. Three come from the input rows, and one calls the reusable fixture.

**main.aug**

```aug project=testing-guide file=main.aug
import add from math

print(value=add(left=1, right=2))
```

**fixtures.aug**

```aug project=testing-guide file=fixtures.aug
/** A reusable, pure test input. */
fixture seven() returns int:
    return 7
```

**math.aug**

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

Each tuple row becomes a separately listed and executed case. The checker verifies its arity and types, and the row variables belong to that case. `fixture seven` is a function that several cases can call. Import it like any other function. Fixtures remain callable outside tests and do not create a setup scope.

## A complete class suite

In a separate folder, save these two files. `aug run .` prints `1`, and `aug test .` runs two cases. Notice that the second case sees the initial counter value even though the first case increments its own subject.

**main.aug**

```aug project=class-testing-guide file=main.aug
import Counter from counter

counter = Counter(initial=1)
print(value=counter.value())
```

**counter.aug**

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

The subject header names a local class and its test variable. It does not construct the subject; setup does that here. Each case gets a new counter. Tests follow ordinary privacy rules, so sharing the source file does not grant access to `_count`. Test generic classes with concrete type arguments.

## Groups, setup, and dependencies

Group/case names are identifiers or quoted strings. A suite's groups are unique; a group's cases are unique. Within a group, place bindings or included compositions first, setup statements second, and cases last. Nested groups are not supported.

Every case gets its own setup, bindings, native process, managed heap, and assertion state. Production main bindings and startup never run. Setup variables belong to that case. Dependency bindings follow the same graph, lifetime, and purity rules as application bindings.

Resolve expressions belong in setup. Test bodies and helpers receive visible dependencies through setup variables or headers. A test can explicitly replace a capability with a private adapter. See [the runnable calculator tests](../examples/developer-workflow/calculator.aug).

Process isolation does not reset files, databases, sockets, or other external resources. Use explicit adapters or case-specific resources for integration tests.

## Assertions and failure

`assert(condition)` and `assert(condition=condition)` require a bool. A failed assertion reports file, line, and source condition. Catching its error cannot make the case pass. Setup may assert its invariants, but every case body must also execute an assertion. A body that executes none fails.

An uncaught checked error, a native crash, a nonzero exit, or a timeout fails the case. Assertions are test operations, not production contracts.

## CLI and coverage

Use `npx @greenpandastudios/aug-cli@next` in place of `aug` below, or use an installed `aug` command. See [Your first project](getting-started.md) for the npm workflow.

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

Test LLVM IR and binaries live under `.aug-build/tests/`. Coverage writes `.aug-build/coverage/coverage.json` and `lcov.info`, retaining zero-count executable lines in the compiled test closure. It reports statement lines, not branch coverage. Production startup is omitted, so the result is not whole-application startup coverage. Filtering reports only selected tests and their reachable declarations.

`aug check` checks production and test bodies. `aug test` checks selected tests and their reachable declarations; it does not execute or type-check production startup. A test project still needs a root `main.aug`.

## VS Code

Test Explorer groups cases by project, declaration, and when group. Parameterized rows have separate entries and source locations. Saving refreshes discovery; **AugScript: Refresh Tests** refreshes it manually. Running saves pending edits first. Cancellation skips remaining cases after the active case finishes or times out.

Choose **Native tests** to run or **Native coverage** to see merged statement-line coverage when the installed VS Code supports its coverage API. **AugScript: Test Project** runs the project CLI in a task terminal.

Use `try`/`always` for cleanup. Snapshots and nested groups are unsupported. Each selected case compiles a separate native binary.

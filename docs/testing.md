# Built-in unit tests

Write tests beside the declaration they check. `aug test` compiles and runs them as native programs. Test bodies are excluded from production executables.

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

Each tuple row becomes a separately listed and executed case. The checker verifies its arity and types, and the row variables belong to that case. A one-column row uses a one-cell tuple such as `(7,)`; its name receives the cell, including when that cell is itself a tuple. `fixture seven` is a function that several cases can call. Import it like any other function. Fixtures remain callable outside tests and do not create a setup scope.

## Suggest boundary inputs

**Unreleased:** the compiler containing `--suggest-inputs` can propose rows from a function's checked input types. It does not run the function or choose its expected results. Start from a project that passes `aug check`, then request a same-file function:

```sh
aug test --suggest-inputs sign --file numbers.aug
aug test --suggest-inputs sign --file numbers.aug --json > inputs.json
```

The source fragment is an `it boundaries` case to put inside a new, empty test group. Replace `__author_property` with an assertion based on your requirements. The placeholder is deliberately unresolved. In the unreleased editor, complete `itboundaries` inside a function test group for the same rows and an editable assertion. It follows the project's block, indentation and assignment preferences.

For example, the requirement for `sign` is to return −1 for negative integers, 0 for zero and 1 for positive integers. Save this independently chosen set of answers in `numbers.aug`:

```aug project=boundary-tests file=numbers.aug
sign(int value):
    if value < 0:
        return -1
    if value > 0:
        return 1
    return 0

test sign:
    when boundaries:
        it signed for (value, expected) in [
            (0, 0),
            (-1, -1),
            (1, 1),
            (-9223372036854775808, -1),
            (9223372036854775807, 1)
        ]:
            assert(condition=sign(value) == expected)
```

Save the entry in `main.aug`. `aug run` prints `-1`; `aug test` runs five ordinary cases.

```aug project=boundary-tests file=main.aug
import sign from numbers

print(value=sign(value=-4))
```

The version 1 generator proposes zero, −1, 1 and the endpoints for `int` and `c_int`; both boolean values; finite float examples including negative zero and a fraction; and short strings including empty text, accented text, an emoji and escaped characters. Optional inputs also get `null`. `c_int` rows use the existing checked conversion. These are representative inputs, not every possible value or every valid domain constraint. Owned, borrowed, resolved, generic, native, intercepted, endpoint and non-scalar input contracts need ordinary author-written cases.

By default, the first row uses each domain's first value, then each additional row changes one input. `--combinations` enumerates the Cartesian product of those finite domains. Both modes reject a selection above `--limit`, which defaults to 64 and has a maximum of 4096. They never silently truncate or discard inputs. Each delivered row is checked as an ordinary labeled call without execution.

Add application-specific inputs with `--cases cases.json`. This data file uses August source literals as JSON strings so that an int64 value keeps its exact spelling:

```json
{"format":1,"rows":[{"value":"42"},{"value":"-7"}]}
```

Every row must supply exactly the public labels. Only scalar literals and bounded `c_int(value=INTEGER)` conversions are accepted; function calls cannot enter through this data file. An empty or invalid author domain fails. Author rows follow the generated rows and count toward the limit; defaults are shown in the report, but this profile supplies every input explicitly. Test omitted defaults separately.

JSON records the concrete rows, their origin, limit, ordering, generator version, compiler identity, source/configuration revision, author-file digest and replay digest. Keep the report with your review, then save accepted inputs and independently selected assertions as ordinary test rows. Rerunning the command against the same sources produces the same report. It provides finite input evidence; expected answers, behavioral checks and general proofs remain separate.

## Review requirements with test results

**Unreleased:** `aug verify` puts author-written requirements, checked code, its generated explanation and native test results in one report. Write the requirements before choosing implementation answers. August checks the mapping and runs the selected cases; it cannot determine whether your tests were written independently or cover the intended business behavior.

Save this program as `math.aug`. The requirement is to double the input, including negative integers and zero. The three expected values are ordinary author-written test rows.

```aug project=acceptance-review file=math.aug
double(int value):
    return value * 2

test double:
    when acceptance:
        it examples for (value, expected) in [
            (-3, -6), (0, 0), (7, 14)
        ]:
            assertEqual(actual=double(value), expected)
```

Save its entry in `main.aug`. `aug run` prints `8`; `aug test` runs three cases.

```aug project=acceptance-review file=main.aug
import double from math

print(value=double(value=4))
```

Run `aug test --list --json` to discover exact case ids. Save their requirement mapping in a separate `requirements.json`:

```json
{
  "format": 1,
  "requirements": [{
    "id": "twice",
    "description": "Double the input, including negatives and zero.",
    "tests": [
      "math.aug:double:acceptance:examples:1",
      "math.aug:double:acceptance:examples:2",
      "math.aug:double:acceptance:examples:3"
    ]
  }]
}
```

Run the review from this folder and preserve its JSON with the proposed change:

```sh
aug verify --requirements requirements.json
aug verify --requirements requirements.json --json > verification.json
```

The human report names `twice` as passed and reports `3 passed, 0 failed`. The JSON also contains exact selected source, checked function and dependency contracts, generated specification text, test-group source, captured native output and the source/configuration revision. It records compiler acceptance, finite behavioral results and required engineer review separately. Descriptions and expected answers remain author-supplied; explanations are source-derived. A compiled `.aug.md` cannot be used as the requirements file.

To check that the cases detect a mistake, change `return value * 2` to `return value`. Static checking still succeeds, but verification fails two cases. Restore the multiplication and rerun before accepting the change. Passing these cases establishes their results for this revision; it does not prove the function correct for every integer.

Verification checks production and all same-file test bodies, then executes only mapped cases using the ordinary isolated native test runner. It prepares missing declared packages and the pinned LLVM compiler like `aug run`; `--offline` and `--frozen` keep their usual restrictions. `--backend c` selects the maintainer reference backend and requires its native tools. `--timeout MS` bounds each native case execution, from 1 to 3,600,000 milliseconds; compilation is outside that timeout. Test output and caches are written under the ordinary build/cache directories. Source files, requirements and adjacent specs are not edited.

The format accepts up to 256 nonempty requirements and 256 selected cases, with at most 4096 requirement-to-case links. A requirement needs a unique id, description and distinct case ids. The requirements file and selected source review each have a 1 MiB limit. Missing cases, invalid metadata or omitted mandatory context reject verification before tests run. Native and interface-dispatch boundaries remain visible in the review; a finite test run does not resolve every possible caller. Optional context omitted for size is listed explicitly.

The runner checks the expected source revision before native compilation and execution. After execution, August checks the source/configuration and requirement identities again and compares the runner's loaded-source revision. A detected change reports `stale`, retaining the concrete results for the earlier revision. A rejected final source or dependency-metadata check also invalidates the report, even when its source hash is unchanged. Incomplete or interrupted evidence fails verification. These checks do not lock editors, make a source transaction or reset external databases and services. Review the code, requirements and test results together, then rerun if any of them changes.

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

Use `assertEqual(actual=add(left=2, right=3), expected=5)` when the failure needs both values. Inputs are evaluated once in the order written. It uses ordinary `==` rules: compatible numbers compare numerically, records and tuples compare their contents, and other objects compare by identity. Two different lists with the same items therefore fail this assertion.

Failures show bounded scalar, record, and tuple values, followed by the first difference in field order: for example, `difference at $.address[1].city`. Tuple positions start at zero. A difference inside private storage stops at its public parent, without showing private field names or values. The path search visits at most 64 values, descends through four containers, and uses at most 255 bytes for a path. If it reaches a limit, it reports that the path is unavailable.

Long text and nested values are shortened; native payloads are omitted. File and line identify the assertion without printing its source literals. Use a boolean assertion when comparing a specific collection item or application property.

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
| `aug test PROJECT --json` | Machine-readable pass/fail counts, captured output and loaded-source revision. |
| `aug test PROJECT --expected-revision SHA256` | **Unreleased:** reject a different loaded source/configuration before native execution. |
| `aug test PROJECT --timeout 2000` | Limit each native execution to 2 seconds. |
| `aug test PROJECT --coverage` | Merge executed statement lines across selected cases. |

Selection is exact and case sensitive. Quote names containing spaces. Unknown selections fail. The default timeout is ten seconds per native case; compilation is outside that timeout.

Test LLVM IR and binaries live under `.aug-build/tests/`. Coverage writes `.aug-build/coverage/coverage.json` and `lcov.info`, retaining zero-count executable lines in the compiled test closure. It reports statement lines, not branch coverage. Production startup is omitted, so the result is not whole-application startup coverage. Filtering reports only selected tests and their reachable declarations.

`aug check` checks production and test bodies. `aug test` checks selected tests and their reachable declarations; it does not execute or type-check production startup. A test project still needs a root `main.aug`.

## VS Code

Test Explorer groups cases by project, declaration, and when group. Parameterized rows have separate entries and source locations. Saving refreshes discovery; **AugScript: Refresh Tests** refreshes it manually. Running saves pending edits first. Cancellation skips remaining cases after the active case finishes or times out.

Choose **Native tests** to run or **Native coverage** to see merged statement-line coverage when the installed VS Code supports its coverage API. **AugScript: Test Project** runs the project CLI in a task terminal.

Use `try`/`always` for cleanup. Snapshots and nested groups are unsupported. Each selected case compiles a separate native binary.

The unreleased `aug graph --composition --case TEST_ID --json` checks and describes a selected case’s providers without executing it. Use an id from `aug test --list --json`. The [service wiring guide](guides/reuse-services.md) compares application and test compositions; application startup and test execution remain separate checks.

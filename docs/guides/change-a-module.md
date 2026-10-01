# Change an unfamiliar module

A change request is easier to review when you can trace its inputs, dependencies, and observable behavior. This guide follows the repository's tested calculator application. It uses the same process for a human developer and a coding agent; the checks establish specific program properties, while you still review whether the change meets the request.

## Establish a working baseline

Download [the tested calculator project](../examples/developer-workflow/index.md#try-this-project), extract it, and prepare [the native dependencies](../packages.md#npm-registry). From the folder containing the extracted project:

```sh
cd developer-workflow
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next test .
npx @greenpandastudios/aug-cli@next spec .
```

Open [the application's entry point](../examples/developer-workflow/main.md). It selects the console and logger, constructs the calculator, and calls its addition operation. Then open [the calculator and its compiled spec](../examples/developer-workflow/calculator.md). Its interface describes addition and console output. The class receives a logger. The tests supply a private silent logger and check the returned sums.

The private test adapter implements the public logging contract. It keeps these cases independent of console messages. Test setup chooses its own providers; application startup does not run during a case.

## Trace only what the change needs

Suppose the request is: **also verify addition with a negative operand**. Read the `Arithmetic.add` contract, `Calculator.add`, and the `addition` test group. Follow [the logging contract](../examples/developer-workflow/logging/logger.md) if you need to understand its effect. The dependency section of the compiled spec links to the used surfaces; it does not repeat every dependency implementation.

For a bounded context report:

```sh
npx @greenpandastudios/aug-cli@next explain . --file calculator.aug --name Calculator
npx @greenpandastudios/aug-cli@next context . --file calculator.aug --name Calculator --budget 6000
```

The report gives checked contracts and related context. It helps you choose which files to read; it does not establish that the requested behavior is correct. The development protocol reports `coverage.requiredContextComplete`, required omissions and unresolved dispatch boundaries. Increase the budget for omitted contracts; unresolved boundaries need explicit investigation. A description from the editor's import closure does not enumerate all reverse callers. See [checked changes](../checked-changes.md) for supported standalone plans and independent acceptance gates.

## Make and check the change

Add a case to the existing `addition` group. The following is a fragment, not a standalone file:

```text
it "adds a negative operand" {
    assert(calculator.add(left=-2, right=5) == 3)
}
```

The existing group setup supplies the calculator and its dependencies. Run `check` and `test` again. The new case should pass without changing the implementation: the current operation already adds integers. If your change needs a new error, dependency, or mutation, update the public contract and its callers deliberately; those decisions belong in the review.

## Review the explanation with the patch

Regenerate specs after the change:

```sh
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next spec . --check
```

Compare the edited files with the originals, using your editor or source control. The source change adds a behavior case. The spec change should describe that case. Review both and confirm that neither adds an unexpected public export, effect, or dependency. Generated explanations describe checked source; handwritten comments explain domain intent. A passing test covers its exercised inputs, and a current spec is still subject to reader review.

## Give a coding agent the same starting point

A useful instruction is:

> Read `calculator.aug.md` first and follow its linked contracts. Inspect the August source and tests before editing. Add a case that verifies addition with a negative operand. Run `aug check` and `aug test`, regenerate with `aug spec`, and review the source and spec diffs. Report the checks that passed and any limits.

Give the agent an explicit instruction to use the neighboring spec and verify its work. This workflow demonstrates the tools; it makes no comparative productivity claim.

For a larger boundary example, explore [modules and composition](../examples/approved-design/index.md). For a different task, return to the [guides](index.md).

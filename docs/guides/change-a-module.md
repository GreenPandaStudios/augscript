# Change an unfamiliar module

Add a test for a negative operand to the calculator project. Before editing, read the operation, its dependency, and its compiled spec. Afterward, run the test and review both diffs.

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

Suppose the request is: **also verify addition with a negative operand**. Read the `Arithmetic.add` contract, `Calculator.add`, and the `addition` test group. Follow [the logging contract](../examples/developer-workflow/logging/logger.md) if you need to understand its effect. The spec links to the logging operations used by the calculator.

For a bounded context report:

```sh
npx @greenpandastudios/aug-cli@next explain . --file calculator.aug --name Calculator
npx @greenpandastudios/aug-cli@next context . --file calculator.aug --name Calculator --budget 6000
```

The report lists declarations and related code. The unreleased compiler rejects a budget that cannot hold the selected contract and implementation, and reports `minimumBudget`. A ready report can still omit dependencies or tests; check its coverage and omissions before editing.

For an interface change, add `--mode interface-change`; this includes known transitive callers and type consumers. `--mode review` also uses that closure for reviewing a change. Available test source is context, not a test result. Use `--require-complete` when an integration needs all required facts and resolved caller coverage. Dynamic dispatch and consumers outside the project remain explicit boundaries.

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

Compare the edited files with the originals, using your editor or source control. The source change adds a behavior case. The spec change should describe that case. Review both for unexpected exports, I/O, mutation, or dependencies. The new explanation should describe the added case.

## Review a mechanical rename

The unreleased [checked-change workflow](../tooling.md#checked-source-changes-unreleased) can rename an ordinary standalone function or its public input across resolved project callers. Save the plan, inspect its files and public contract changes, then apply it against the same revision. The plan maps the selected and changed derived symbol IDs to their checked replacements; read it with its source revisions. A stale or altered plan is rejected. Regenerate specs and run the independent tests afterward. The command does not infer a business value or recovery policy.

## Review a replacement implementation

The unreleased body operation accepts one complete standalone function in a separate UTF-8 source file. Use `aug change plan-replace-body` with the selected project file, function name and `--source` file. Keep its header unchanged and use the project's existing imports. Inspect the embedded source, one-file edit and empty public delta before applying the plan.

This operation rejects changed checked promises and changes to neighboring declarations, including private code. If the implementation needs another import, input, effect or error contract, make that broader change deliberately. After applying the body plan, regenerate the spec and run independent acceptance cases. A checked body can still implement the wrong rule. Rejections retain the exact starting, supplied or candidate source with its corresponding stage and revision; repair that source rather than pairing new diagnostics with an older file.

## Give a coding agent the same starting point

A useful instruction is:

> Read `calculator.aug.md` first and follow its linked contracts. Inspect the August source and tests before editing. Add a case that verifies addition with a negative operand. Run `aug check` and `aug test`, regenerate with `aug spec`, and review the source and spec diffs. Report the checks that passed and any limits.

Ask the agent to read the spec, inspect the source, and run the checks. Review its patch before accepting it. The unreleased [requirements review](../testing.md#review-requirements-with-test-results) can retain author requirements, exact selected source, its explanation and native test results together. Keep expected behavior in your requirements and tests; the generated explanation describes the proposed implementation.

For a larger boundary example, explore [modules and composition](../examples/approved-design/index.md). For a different task, return to the [guides](index.md).

## Compare two local revisions

The unreleased `aug compare before after --json` compares two local project folders. Install each folder's declared source dependencies first. The command checks both projects and reports changed contracts, source bytes, visibility and metadata, followed by known consumer sites. Each side retains its revision and available authored test cases. Tests are not run by comparison; use the selected cases with `aug test` or an authored acceptance file with `aug verify`.

Read the contract differences separately from source changes. Comments and formatting change source hashes too. A moved declaration appears as a removal and an addition. Interface dispatch, native behavior and unknown external clients require separate review; a report of known callers is not a complete account of those boundaries. For two versions of a published package, use `aug package diff` to compare their exported surface.

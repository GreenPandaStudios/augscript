# Make a checked change

A checked change records the program you started from, the files you may edit, the intended public contract change, and independent tests for the requested behavior. The compiler checks the candidate before writing source. Compiler acceptance and passing tests remain separate results.

This is the experimental AUG-0001 implementation in the development compiler. It is not included in the published 0.20.0 packages. These commands require a build containing the amendment; release notes will identify its first published version. The initial protocol supports one standalone function rename, one implementation body replacement, or one verified forwarding conversion per plan. It does not add inputs, invent argument values, or decide how to handle a new error.

## Forward an operation

Use forwarding when a module needs a public name for an existing operation. If there is no useful boundary, import the operation directly.

Create `billing.aug` for the implementation:

```aug project=checked-forwarding file=billing.aug
/** Apply the amount adjustment. */
adjust(int amount) returns int:
    return amount + 1
```

Create `dispatch.aug` for the application-facing name and its acceptance cases:

```aug project=checked-forwarding file=dispatch.aug
import adjust from billing

/** The application-facing adjustment operation. */
forward dispatch to adjust

test dispatch:
    when "independent acceptance":
        it "adjusts an amount" for (amount, expected) in [(0, 1), (3, 4)]:
            assert(condition=dispatch(amount=amount) == expected)
```

Create `main.aug` to call it:

```aug project=checked-forwarding file=main.aug
import dispatch from dispatch

print(value=dispatch(amount=3))
```

`dispatch` inherits the target's labeled inputs, resolved types, result, ownership, and effective checked errors. Supplied arguments are evaluated in the usual order and delegated once, unchanged. The declaration performs no validation, recovery, transformation, or other behavior. Forwarding chains inherit the same contract. Adding a target input or error changes every alias interface, even when its source stays unchanged. Callers must supply the input and catch or propagate the error.

Forwarding belongs in ordinary modules and requires an explicitly imported public standalone function. The first profile supports concrete managed types and checked errors. It rejects generic functions, `own`, `borrow`, `resolve`, capabilities, mutation, endpoints, native linkage, and interceptors, including inferred effects. A private alias starts with `_` and cannot be exported. Ordinary functions named `forward` remain valid.

Hover and compiled specs show the inherited contract, immediate target, and final implementation. Navigation from a call goes to the alias; navigation from its target goes to the imported declaration. JSON navigation also includes the implementation location. Each alias has its own identity, such as `dispatch.aug:dispatch`.

## Obtain checked context

From the example project:

```sh
aug check .
aug test .
aug context . --file billing.aug --name adjust > context.json
```

The packet includes its revision, compiler version/build identity, source inventory, configuration/dependency digests, resolved contracts and occurrences, forward dependencies, and reverse callers. It checks the loaded project and its same-file tests, including callers outside the queried import closure. External consumers are not checked. Interface dispatch and foreign implementations remain explicit boundaries; unresolved required coverage rejects a plan.

Read `coverage.requiredContextComplete` before using a packet. A checked project, complete graph within its scope, and complete delivered context are separate statuses. `omissions`, `unresolved`, and `optionalOmissions` identify absent facts. Root contracts and required dependency/caller facts take priority over optional snippets. `--budget` targets semantic content size; required revision/omission metadata is retained even when larger, with `budgetExceeded` reporting that condition. Incomplete mandatory context returns nonzero.

`status.graph` describes the loaded project's graph. `graphCoverage` counts its boundaries and identifies omitted callers outside the query closure. An unrelated unresolved operation can leave that graph partial while the required context for a supported standalone edit is complete. A boundary inside the edit's dependency or reverse caller closure blocks the plan.

## Plan and verify a rename

Save this JSON template as `request.json`, replacing `BASE_REVISION` with the exact revision from the packet:

```json
{
  "baseRevision": "BASE_REVISION",
  "root": "billing.aug:adjust",
  "editScope": ["billing.aug", "dispatch.aug"],
  "operations": [
    {"kind": "rename", "symbol": "billing.aug:adjust", "name": "applyAdjustment"}
  ],
  "expectedPublicDelta": {
    "kind": "rename",
    "from": "billing.aug:adjust",
    "to": "billing.aug:applyAdjustment"
  },
  "requirements": [
    {"id": "R1", "text": "Preserve the supplied amount adjustment examples."}
  ],
  "verification": {
    "tests": [{"group": "independent acceptance", "requirements": ["R1"]}],
    "provenance": {
      "source": "Engineer-authored amount examples",
      "independence": "engineer asserted"
    }
  }
}
```

```sh
aug change plan . request.json > plan.json
aug change check . plan.json > verification.json
aug change apply . plan.json > accepted.json
```

Planning and checking leave source untouched. The plan carries exact edits, candidate source units and revision, public interface hashes, affected occurrences, and verification selection. Rename changes resolved declarations, imports, exports, callers, test subjects, and forwarding targets. Comments, strings, shadowed locals, and unrelated same-named declarations remain unchanged. An occurrence outside `editScope` rejects the plan.

Application rederives the plan, rejects tampering and stale source/configuration/dependencies, checks the whole candidate, compares its public delta, and runs selected tests in isolated native processes. Only then does it write source. A newly added file or caller invalidates the old revision. Empty or unmatched selections cannot pass. Oracle independence is a recorded author assertion; the compiler cannot establish who wrote it.

The plan's `exchange` presents ordered requirements, actual source, complete checked context, independent acceptance source, read-only compiled spec, versioned tested syntax idioms, and permitted operations together. A rejection returns the exact candidate with revision-bearing diagnostics and available fixes. Keep that candidate with its diagnostics; an older restored file is not a coherent repair request for a newer rejection.

For a body replacement, use `{"kind":"replace-body","symbol":"billing.aug:adjust","source":"..."}`. The source unit contains imports and exactly one implementation, with the original header preserved. It is parsed as August source, not a Markdown layout. State `unchanged` or an exact list of expected before/after public interface hashes. `aug change interfaces . > interfaces.json` captures a baseline; `aug change diff . interfaces.json` reports changes, including inherited aliases with unchanged source and visibility through folder exports.

A conversion uses `{"kind":"forward","symbol":"wrapper.aug:dispatch"}`. The wrapper must be one direct return of an imported target with every labeled parameter unchanged, in declaration order, and an identical resolved interface. Added behavior, catches, effects, layers, or embedded body comments prevent mechanical conversion. Existing wrappers remain valid.

## Recover an interrupted writer

Application uses an exclusive cooperating writer and durable journal under `.aug-changes`. Readers reject active or interrupted transactions. Package installation, formatting, spec generation, and managed source hints coordinate with that writer.

```sh
aug change recover .
```

Before the durable commit point, recovery restores the earlier sources. After it, recovery completes the accepted record. Recovery checks all entries before writing and preserves conflicting external edits. Keep the journal and reconcile conflicts before retrying. Interrupted acquisition or malformed metadata fails closed: inspect `.aug-changes/acquiring` and its recorded process before removing an abandoned acquisition marker.

The permit coordinates August writers. An external editor can still write without it. Revision and journal checks detect conflicts, but do not provide filesystem isolation from arbitrary writers. Accepted records live in `.aug-changes/revisions`; archive returned JSON with the engineering review for lasting evidence. Source control remains the history for ordinary edits.

## Enumerate independent test inputs

The bounded runner supplies literal tuple rows to an existing same-file test, preserving authored setup and assertions. It does not derive an oracle from the implementation or its spec. For a parameterized replay test, compose boolean domains:

```json
{
  "version": "august.enumerated-rows/1",
  "file": "operations.aug",
  "group": "receipt acceptance",
  "case": "replay and dry run",
  "domains": [
    {"parameter": "cached", "values": [false, true]},
    {"parameter": "dryRun", "values": [false, true]}
  ],
  "limit": 4,
  "requirements": ["R1"],
  "provenance": {
    "source": "Independent replay requirements",
    "independence": "engineer asserted"
  }
}
```

```sh
aug evidence run . generator.json > evidence.json
aug evidence replay . evidence.json
```

Enumeration covers the complete Cartesian product in domain order, with the last dimension varying fastest. Scalar domains accept strings, booleans, null, safe integers, and finite fractional numbers. Every generated row is type checked. Empty, invalid, unmatched, excessive, or fully discarded domains reject the run. The declared limit is 1–256 vectors. Exclusions need exact value indices and a reason; invalid inputs are never discarded implicitly.

Evidence records generator version, limits, vectors, exclusions, oracle identity, source/compiler/configuration/dependency revisions, ordinary replay case fragments, and concrete native outcomes. Replay requires that revision. A change request can include generators in `verification.generators`; they form another acceptance gate before source writes.

For stateful behavior, author assertions for unchanged inputs, allowed output state changes, idempotency, and public output. Compose new/cached requests, matching/conflicting payloads, tenants, and dry-run modes as needed. Passing finite checks does not prove all inputs correct. Reports separate compiler acceptance, runtime enforcement, finite behavior evidence, formal proof, and engineer review. This implementation makes no comparative AI reliability claim.

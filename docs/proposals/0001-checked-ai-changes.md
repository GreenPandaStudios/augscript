# AUG-0001: Checked changes and operation forwarding

| Field | Value |
| --- | --- |
| Status | Experimental development implementation; qualification and publication pending |
| Scope | Language declaration, compiler context, source edits, verification evidence |
| Motivation | Reliable engineering with coding AI across shared modular code |
| Evidence | Local pilot experiments and compiler prototypes; see the [experiment report](https://github.com/GreenPandaStudios/augscript/blob/a1a9769e77e3dfd32bf91b3f6534a9b3de4ac7ac/experiments/agent-amendment/RESULTS.md) |
| Compatibility | Additive syntax; current function, export, ownership, and runtime rules remain authoritative |

The development compiler implements sections 4–6 through revision-bearing context, checked plans, forwarding and experimental enumerated test rows. The matched comparative evaluation in section 9 has not been run. Recovery coordinates cooperating August writers and preserves external conflicts; arbitrary editor writes are not filesystem-isolated. Interrupted acquisition metadata fails closed for inspection.

## 1. Abstract

August should make a requested change a **checked, bounded operation on a program**.
The coding model should supply business decisions and implementations. The compiler
should supply exact interfaces, affected callers, fresh source identities, and safe
mechanical edits. Independent examples and bounded behavioral checks should supply
acceptance evidence.

The language amendment adds an explicit declaration for transparent forwarding:

```text
import applyRefund from billing
forward dispatch to applyRefund
```

The associated compiler protocol exposes the complete inherited interface, plans
changes against exact source revisions, checks the proposed program before writing,
and records public interface and verification deltas. The first implementation profile
is deliberately narrow: ordinary managed standalone functions, including checked
errors, with no interceptors, endpoints, native linkage, injected dependencies,
capability effects, or declared mutation.

This proposal aims to make natural-language changes practical while an engineer retains
control over architecture, effects, and acceptance evidence. The experiments do not
establish that August is the best language for that workflow. That claim requires the
matched evaluation in section 9.

**Recommended implementation order:** ship the revision/coverage protocol and checked
edits first. Forwarding removes a measured source-maintenance burden, but supplies no
unique advantage over TypeScript aliases. A shorter context packet alone did not improve
acceptance in this pilot. Behavioral checks must remain a separate acceptance gate.

## 2. Observed problem

The September 30 investigation produced a valid August refund change only after a
language primer, staged source generation, compiler repairs, and human review. Generated
specs stayed unchanged, but the model initially failed to propagate labeled inputs and
checked errors. A solution passing the original 51 hidden cases still had an uncovered
cached dry-run receipt bug.

The subsequent sixteen fresh localized trials produced two August solutions accepted
by the frozen suite. Neither survived the added interaction checks: one bypassed replay
conflicts during dry runs; the other changed the required validation order. The 64-vector
replay grid and adaptive 128-vector validation-order grid both passed on independently
written August and TypeScript references. These outcomes motivate stronger evidence,
not an inference that compiled context guarantees correct behavior.

A separately frozen four-trial syntax calibration then made all four first proposals
compile. Two passed the frozen suite and both interaction grids without handwritten
implementation repairs or hidden-test feedback. The added cue taught inferred bindings,
field comparisons, and source-exchange formatting through an unrelated checked example.
The canonical agent primer now includes the binding and comparison rules. This is a
useful improvement on one model and fixture; it does not establish a stable success rate.

Two failure classes require different remedies:

- **Program mechanics:** labels, imports, checked errors, caller discovery, stale source,
  and repeated forwarding interfaces. The compiler has facts that can settle these.
- **Requested behavior:** authorization order, replay semantics, state conservation,
  and receipt privacy. A checked implementation can still implement the wrong rule.

August already has compiled `.aug.md`, `aug context`, `aug explain`, immutable records,
checked errors/effects, editor fixes, and typed same-file tests. The proposal extends
these capabilities; it does not introduce a new prose documentation system.

TypeScript already supports transparent export aliases. Forwarding is a usability
improvement toward parity. August's potential distinction is the combination of
explicit checked interfaces, precise change operations, and reviewable evidence.

## 3. Goals and exclusions

The amendment must:

1. Remove redundant interface transcription from transparent forwarding modules.
2. Preserve labeled inputs, resolved type/error identities, narrow exports, and
   visible public behavior.
3. Distinguish complete checked facts from truncated or unresolved context.
4. Reject stale, ambiguous, unsupported, or out-of-scope edits before source writes.
5. Make compiler acceptance, finite test evidence, and engineer review separate facts.
6. Support models that are unfamiliar with August without requiring them to invent
   imports, discover every caller, or reconstruct contract propagation from prose.

This proposal does not change ownership, garbage collection, workers/channels, runtime
security policies, or foreign-code trust. It does not promise a proof of arbitrary
business behavior, a complete graph of external code, or reliable generation from
an insufficiently capable model.

## 4. Normative language amendment

The words **must**, **must not**, and **should** define requirements for an implementation.
The normative amendment is retained here for review. See [the implemented workflow](../checked-changes.md) for executable examples, exact profile limits, recovery behavior, and development availability.

### 4.1 Grammar and resolution

```text
ForwardDeclaration := "forward" Name "to" Name Newline
```

`forward` is a contextual keyword. Existing declarations or calls named `forward`,
such as `forward(...)`, must remain valid. The new form belongs in an ordinary module,
not `main.aug` or `export.aug`. The target must be an explicitly imported public
standalone function or another supported forwarding declaration.

The compiler must resolve the target to its definition identity. Matching an unqualified
spelling is insufficient. Cycles, unresolved targets, unsupported profiles, annotations
on aliases, bodies attached to aliases, and attempts to conceal additional wrapper
behavior must produce diagnostics.

The forwarding name is a new module declaration with its own public identity and
source location. It remains private when its name starts with `_`; normal export rules
apply. Publishing a forwarding declaration must not make a private target public.

### 4.2 Interface and behavior

A forwarding declaration inherits the target's complete supported interface:

- Public parameter labels, types, order, and required status.
- Return type and ownership.
- Effective checked errors.
- The empty capability and mutation contracts required by the first profile.

The compiler must retain resolved identities rather than copying type names into a
new lookup scope. Invocation evaluates each argument once, in normal August order,
and delegates exactly once. It performs no validation, transformation, catch, state
write, interception, or receipt construction of its own.

Adding a required target input makes that input required through every forwarding
chain. Missing argument values remain caller errors. The compiler must not invent a
reason, approval, default value, or recovery decision. Changing the target's checked
errors changes inherited public interfaces; consumers must still catch or propagate
those errors according to existing rules.

### 4.3 Visibility and change review

Hover, compiled specs, `aug context`, symbols, navigation, and interface-diff output
must show the expanded interface, the immediate target, the final implementation,
and whether each fact is inherited or locally declared. Source links must distinguish
the alias declaration from the implementation.

A target interface change must report every changed exported forwarding interface.
An unchanged alias source file must not conceal a public interface change. A checked
change plan must explicitly include the intended public delta; unexpected widening
must reject that plan. Ordinary compilation continues to diagnose missing inputs and
unhandled failures.

### 4.4 Initial profile and future extensions

The prototype validates only managed standalone functions with concrete types and
checked errors. The first implementation should reject generics, `own`/`borrow`,
`resolve`, `uses`, `changes`, endpoints, native functions, and interceptors in this form.

Supporting these later requires separate semantics and tests for generic substitution,
linear transfer, dependency scopes, effective capability/error layers, and mutation
frames. A compiler must never silently erase an unsupported contract to permit an alias.
No prototype result in this proposal establishes those extensions.

## 5. Normative compiler change protocol

### 5.1 Context and affected interfaces

Extend the existing semantic schema with identities for methods, parameters, public
aliases, and resolved occurrences. Expose typed relationships for calls, implementations,
imports, exports, forwarding, injected dependencies, interceptor delegation, and tests.
Return forward dependencies and reverse callers as distinct sets.

An intent query must prioritize the root interface and required dependency facts before
optional prose or implementation snippets. It must enumerate omissions, unresolved
external/member dispatch, and budget truncation. A checked project, complete graph,
and complete delivered packet are separate statuses. A packet must never imply all
callers were examined when only an import closure was checked.

Every packet carries schema/compiler versions, query root, checked scope, source and
configuration/dependency digests, ordering policy, and its revision. Use reproducible
root-relative paths and package identities. Source-derived behavior descriptions must
remain explicitly distinguishable from desired requirements.

### 5.2 Plans and edits

A proposed change contains:

```text
base revision
root definition and permitted edit scope
typed operations and expected public interface delta
unresolved decisions and unsupported occurrences
verification selection and its provenance
```

Initial operations should be resolved symbol rename, conversion of a verified pure
forwarder, and replacement of one resolved implementation body. Adding inputs/errors
can be added after complete caller/implementation coverage is tested. These operations
must not supply business values or choose whether to expose or catch a new error.

Before commit, the compiler must validate every source precondition, apply edits to an
isolated candidate, check the whole affected project, and compare the public delta to
the plan. Comments, string literals, shadowed names, and unrelated same-named declarations
must remain unchanged by symbol operations. A failed plan writes no accepted revision.

A shipping transaction needs exclusive writer coordination, a recoverable journal or
revision mechanism, and defined behavior for crashes and concurrent readers. The local
prototype demonstrates stale-plan rejection and rollback on an injected process failure;
it does not demonstrate crash atomicity or eliminate the check-to-write race.

### 5.3 Diagnostics as repair input

Structured diagnostics must identify the source revision and rejected candidate they
refer to, the resolved symbol/caller, and available deterministic fixes. Pair a rejection
with that exact candidate. A restored older source plus diagnostics from another revision
must not be presented as a coherent repair request.

The agent-facing operation accepts source units through the parser, rather than requiring
an arbitrary Markdown layout. Extra imports or fences can be diagnosed or structurally
normalized; the compiler still checks all resulting references. No normalization may
replace a model's behavior with a reference implementation.

Context should include small compiler-tested syntax examples for the constructs the
edit requires. This investigation found unsupported `let` bindings and field assignments
used as conditions even after a prose primer. The existing language needs clearer
examples and specific diagnostics for those mistakes before new alternative binding
syntax is justified. Each supplied idiom must identify its compiler version and checked
example; unrelated examples must not masquerade as project declarations.

### 5.4 Minimum agent exchange

An agent integration must present the following together:

1. The engineer's ordered requirements and independent acceptance cases.
2. The actual implementation being edited, its complete public contract, and checked
   dependency contracts. `.aug.md` describes the starting program and is read only.
3. Revision-bearing affected occurrences, unresolved boundaries, and explicit omissions.
4. Tested syntax idioms for required constructs and the permitted edit operations.
5. The exact rejected candidate and its structured diagnostics on a repair attempt.

The integration must refuse acceptance when required context coverage or revision checks
fail. After compilation it must run selected independent behavioral checks and return
their concrete results. It must not substitute an agent's completion claim for either
gate or infer broad safety from a passing finite suite.

## 6. Behavioral evidence

Keep desired behavior in independently reviewable examples and requirement-linked tests.
Do not derive the acceptance oracle from the implementation's generated spec.

Extend existing typed rows/testing with an experimental bounded generator protocol before
adding a second production contract language. Record generator version, seed or enumerated
vectors, limits, discarded inputs, and concrete replay cases. Invalid or empty domains
must not pass silently. A future shrinker must preserve validity and produce an ordinary
checked regression case.

For stateful operations, compose dimensions such as new/cached request, matching/conflicting
payload, tenant, and dry-run mode. Test unchanged inputs, allowed output state changes,
idempotency, and public output. Finite generation finds counterexamples; it does not
prove a property for every input. Static typing, runtime enforcement, finite evidence,
and formal proof must have different statuses in compiler output.

## 7. Alternatives and trade-offs

| Alternative | Decision |
| --- | --- |
| Improve the primer only | Retain it, but it cannot remove propagation or behavior errors by itself. |
| Delete unnecessary forwarding layers | Prefer this when the architecture has no real seam; do not preserve synthetic layers to justify a language feature. |
| Add renamed reexports | Plausible smaller alternative; requires new export semantics and alias provenance. Compare against `forward` before final syntax adoption. |
| Introduce a shared operation interface and implementing classes | Existing interfaces help real interchangeable adapters; avoid adding objects/DI solely to abbreviate pure wrappers. |
| Infer all public errors/effects | Reject blanket inference; it can conceal a changed public promise. |
| Add general `requires`/`ensures` proof syntax now | Defer. Define verification/trust semantics and demonstrate useful bounded evidence first. |
| Train/fine-tune models on August | Worth separate evaluation; a prompt or compiler feature is not a substitute for model competence. |

Forwarding reduces transcription and preserves explicit compiler-visible interfaces,
but reading a two-line declaration depends on trustworthy context tools. Precise semantic
edits add compiler complexity. Independent properties add authoring/review work. The
proposal is justified only if these costs reduce accepted defects and engineer effort.

## 8. Implementation and migration

1. **Semantic protocol:** revision-bearing context, exact occurrences, explicit graph
   coverage, reverse callers, and complete mandatory facts. Reuse current semantic APIs.
2. **Checked edit plans:** standalone symbol rename and source-unit validation. Test
   shadowing, collisions, staleness, unsupported edges, rollback, and concurrent writers.
3. **Forwarding declaration:** compiler AST/lowering, expanded contracts, diagnostics,
   exports/navigation/specs, formatter, editor support, and package compatibility.
4. **Bounded evidence:** typed generation/replay, requirement linkage, and later shrinking.
5. **Matched evaluation:** qualify improvements before changing marketing claims.

Migration is opt-in. A compiler fix may convert only a wrapper proven to be one direct
return of the imported target with unmodified labeled parameters. Wrappers with logging,
validation, catches, annotations, transforms, or additional calls retain their source.
Current wrappers remain valid. Generated output remains generated; change canonical
compiler sources and relevant handwritten docs, help/editor contracts, and package tests
when implementation is authorized.

## 9. Acceptance gates and the “best language” claim

Before adoption, require:

- Native equivalence for supported forwarding on independent fixtures, including failures.
- Exhaustive semantic coverage tests for supported edit operations; unsupported relationships
  explicitly block plans rather than disappear from context.
- Rejection of stale source/config/dependency plans with no accepted writes; recovery and
  concurrency tests beyond the current prototype.
- Meaningful mutation detection and replay for independently authored behavior checks.
- Existing language/runtime/editor/package regression gates and documentation drift checks.

Before a comparative AI claim, freeze at least 20 unrelated paired tasks across multiple
codebase sizes and domains. Use two local model families, five fresh trials per task,
equal feedback/budgets, and idiomatic TypeScript with compiler refactoring, readonly/result
contracts, and equivalent behavior tests. Include source/spec/context and edit-protocol
ablations. That initial two-language comparison is 400 trials, not sixteen.

Primary outcome: independent acceptance without handwritten solution patches. Report
accepted wrong changes, engineer intervention/review time, compiler repair rounds, tokens,
and wall time including failed attempts. Use uncertainty estimates clustered by task.
Freeze the following proposed decision thresholds before qualification calls:

- **Reliability route:** at least ten percentage points higher independent acceptance,
  with the task-clustered 95% interval for the paired improvement entirely above zero.
- **Effort route:** acceptance noninferior within five percentage points, with a 95%
  interval supporting that margin, plus at least 30% lower median engineer intervention
  and review time with uncertainty reported.
- **Both routes:** no increase in independently discovered wrong accepted changes or
  unexpected public-contract widening. Report defect-rate uncertainty; a zero observed
  count must not be called proof of zero risk.

These are engineering targets, not effects measured by this pilot. If the study cannot
resolve its margins, report an inconclusive result and collect additional task clusters.
Never turn one passing fixture or a lower prompt byte count into a general reliability claim.

“Best” also requires stronger relevant comparators and workloads, not just TypeScript.
The immediate defensible objective is measurable improvement over August's current
workflow while preserving its public promises. The formal amendment should be adopted
on that evidence, and broader claims should follow additional results.

## 10. Evidence and open decisions

See the [local experiment report](https://github.com/GreenPandaStudios/augscript/blob/a1a9769e77e3dfd32bf91b3f6534a9b3de4ac7ac/experiments/agent-amendment/RESULTS.md),
[recorded plan](https://github.com/GreenPandaStudios/augscript/blob/a1a9769e77e3dfd32bf91b3f6534a9b3de4ac7ac/experiments/agent-amendment/PLAN.md), and
[primary-source research](https://github.com/GreenPandaStudios/augscript/blob/a1a9769e77e3dfd32bf91b3f6534a9b3de4ac7ac/experiments/agent-amendment/RESEARCH.md).

Open decisions before implementation: `forward` versus renamed reexports; exact public
alias identity/versioning; conservative interface-dispatch graph coverage; transaction
recovery/reader semantics; and bounded generator/shrinker protocol. None is approval to
change ownership, GC, concurrency, or security behavior.

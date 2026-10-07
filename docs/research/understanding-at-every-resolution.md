# Understanding at every resolution

Reviewed October 7, 2026. This research informs August 1.0's deterministic compiled explanations and Mermaid diagrams. It extends [deterministic prose from source code](code-to-natural-language.md) and [generated diagrams at several levels](multiresolution-diagrams.md). The recommendations below are engineering proposals; their presence here does not establish that a generator change has shipped or passed qualification.

## The claim to build and measure

August should make ordinary understanding and change planning possible from checked specifications and diagrams, with source available at the point where a reader needs finer detail. A useful acceptance question is: **Can a developer locate the relevant operation, recover its contract, predict its important behavior, and plan a bounded change from the generated views?** Counting source openings is useful only alongside correct answers and successful changes.

The literature supports multiple related representations, explicit abstractions, and accessible evidence. It does not establish that generated prose and diagrams universally replace source, that short output is necessarily clear, or that a reader's feeling of understanding predicts a correct change. This review found no study validating August's exact language, generators, wiki, or developer and coding-agent workflow. Source avoidance is therefore a product objective and evaluation hypothesis.

## Audit of the starting representation

The review inspected `src/spec.ts`, `src/spec-tree.ts`, `src/spec-diagrams.ts`, `src/spec-dataflow.ts`, and `src/spec-hints.ts`, along with the committed Hello and OIDC overview, login explanation, and login diagram pages. These observations describe the inspected baseline; generated examples may change during implementation.

- The spec generator starts from a checked project, refuses compiler errors, resolves symbols and contracts, and produces offline versioned dependency explanations. Paragraphs retain source ranges. The prose planner verifies that its input evidence identifiers survive in order.
- Project and folder views group resolved boundary operations; module views collapse some relationships to owners; sequences describe local order and control frames. Interface dispatch, native boundaries, deferred callbacks, and browser actions already have distinct handling.
- The Hello overview makes its three small boundary contracts easy to recover. The OIDC overview remains compact in node count, yet bundles operation names and result types into long labels and a 64-contract disclosure. A small graph can still require substantial reconstruction by the reader.
- The OIDC login explanation exposes validation and result handling in detail. Its checked interface carries useful error, HTTP mapping, and capability information under a disclosure. Long argument expansions can obscure the stage of work a reader is currently examining.
- Prose, relationships, data summaries, and sequence tokens are extracted through related compiler structures but separate presentation paths. A source-identifier conservation check verifies planning; it cannot establish that extraction originally supplied every required fact.

The practical opportunity is a coherent reading system with explicit questions and evidence at each level. Further shrinking graphs alone does not address contract visibility, ambiguous labels, cross-view correspondence, or missing extraction.

## A resolution is a contract with the reader

These are proposed reading responsibilities, not six mandatory diagrams on every page. A tiny program can skip a level when it adds no useful distinction.

| Resolution | Reader question | Useful representation | Required connection to finer detail |
| --- | --- | --- | --- |
| Project | What enters this program, which areas participate, and what leaves it? | Entry points, area boundary graph, startup/composition summary | Areas, APIs, complete concrete boundary contracts |
| Folder or subsystem | What is this area's interface and how do its modules cooperate? | Direct module relationships, boundary inputs/results, local inventory | Child folders, modules, parent context, external boundaries |
| Module or type | What does this unit expose, require, change, or delegate? | Declaration inventory, ownership and capability contracts, typed relationships | Exact callable/type identities and corresponding explanations |
| Operation | What can I supply, receive, change, or fail with? | Visible contract synopsis and short evidence-derived orientation | Complete behavior, error mapping, called contracts, tests |
| Behavior or stage | In what order and under which conditions does the work happen? | Structured prose and local static sequence; focused data dependencies when available | Branches, repeated events, cleanup, values and callees |
| Statement or expression | What exactly controls this claim or value? | Precise expression, checked referents, source evidence | Exact source range and enclosing behavior context |

Each page should identify its scope and relation semantics. An area arrow means that one or more concrete boundary relations exist between members of those areas. It does not imply that the areas form an executable pipeline. A result arrow describes a result contract, not a measured runtime transfer. A source-order sequence remains a static possible-flow representation; feasibility, observed receiver identity, timing, and frequency require additional evidence.

Software reflexion models preserve source-to-model correspondence; GrouseFlocks demonstrates grouping's effect on topology. These support inspecting abstraction mappings. Treating August's folder grouping as execution semantics would require further analysis. [Murphy, Notkin, and Sullivan](https://www.cs.ubc.ca/~murphy/papers/rm/reflexion_model_fse95.pdf), [Archambault, Munzner, and Auber](https://www.cs.ubc.ca/labs/imager/tr/2008/Archambault_GrouseFlocks_TVCG/grouseFlocksSub.pdf).

## What the evidence changes in the design

### Support questions and movement among views

Programmers ask questions with different scopes and move between them as a task develops. Sillito and colleagues' two observational studies identify 44 question types, from locating an initial entity through relationships among groups of entities. This motivates entry-point, caller, dependency, and change-impact routes through the documentation, together with links back to the context a reader came from. The taxonomy describes observed questions; it is not a fixed sequence every reader follows. [Sillito, Murphy, and De Volder](https://www.cs.ubc.ca/~murphy/papers/other/asking-answering-fse06.pdf).

The Storey tool study observed strategy switching, helpful subsystem context, missing search facilities, and overload from visible arcs. It also warns that an imposed hierarchy can make a program appear more modular than it is. For August, folder names and authored domain descriptions can orient a reader, while checked relations establish the behavioral claims. Search, a declaration index, and precise links deserve the same attention as zoom. [Storey, Wong, and Müller](https://www.cs.uvic.ca/~mstorey/papers/scp.pdf).

### Make abstraction inspectable

A summary edge should be a projection of identified lower-level relations. Keep its member identities, relation kinds, exact cardinality, and a link to the complete list. Display truncation is acceptable when complete information remains directly recoverable. A folder is a physical grouping, a capability is a checked contract, and an HTTP route is a declared external entry; those meanings should remain visible.

GrouseFlocks requires edge conservation and internal connectivity for topology-preserving hierarchies. Applying this to August's directed, guarded behavior needs care: grouping disconnected methods by folder can suggest a spurious path. The v1 engineering recommendation is to define and test individual boundary relations. A stronger reachability claim needs a separate qualified analysis. [GrouseFlocks](https://www.cs.ubc.ca/labs/imager/tr/2008/Archambault_GrouseFlocks_TVCG/grouseFlocksSub.pdf).

### Plan readable language from explicit facts

The NLG work separates semantic messages, planning, and realization, and supplies grammatical aggregation techniques. August's engineering constraint is to conserve events and scope: two evaluations of `random(32)` remain two draws; conditions, failures, exits, and cleanup retain their controlling context. [McBurney and McMillan](https://sdf.org/~cmc/papers/mcburney_icpc_2014.pdf), [Dalianis](https://aclanthology.org/E95-1042.pdf), [Gatt and Reiter](https://aclanthology.org/W09-0613.pdf).

Our engineering recommendation is to orient readers with checked categories such as validation, value construction, capability calls, mutation, and response return. Author comments can explain domain intent; inferred purpose should not silently become a compiler-established fact. Keep complete prose below any short orientation, and assess accuracy, adequacy, fluency, and concision separately.

### Keep evidence and its limits readable

Readers need to tell apart author intent, checked source facts, declared foreign contracts, authored tests, and executed test evidence. Ko and colleagues observed that design rationale and behavior questions often require information outside ordinary code relationships. Gotel and Finkelstein distinguish requirement origins from later artifact traceability. A source-derived explanation can accurately describe an incorrect requirement implementation, and linking it to source cannot recover a missing business rationale. [Ko, DeLine, and Venolia](https://faculty.washington.edu/ajko/papers/Ko2007InformationNeeds.pdf), [Gotel and Finkelstein](https://discovery.ucl.ac.uk/id/eprint/749/1/2.2_rtprob.pdf).

A useful internal evidence record associates each generated assertion with its derivation rule and exact inputs. Provenance vocabulary helps distinguish using an input from actually deriving a claim from it; the W3C model explicitly cautions that use and generation alone do not prove derivation. August needs its own extraction rules and validation, not merely a provenance-shaped record. [W3C PROV-DM](https://www.w3.org/TR/prov-dm/#term-derivation).

### Validate the claimed benefit at the right level

Munzner separates the reader's domain problem, data abstraction, visual encoding and interaction, and implementing algorithm. Correct Mermaid and portable bytes establish implementation properties. They do not establish that developers can answer the intended question. Readability judgments and attractive screenshots also leave comprehension unmeasured. [Munzner](https://www.cs.ubc.ca/labs/imager/tr/2009/NestedModel/NestedModel.pdf).

Lexical comparison against a reference comment is insufficient for evaluating complete explanations. Roy and colleagues demonstrate disagreement between commonly used metrics and human judgments in their code-summary setting. Nie and colleagues show that learned summarizer conclusions depend on the evaluation use case and data split. For August, representative unseen programs and real revisions are engineering recommendations inspired by this work; deterministic generators have no training leakage in the same sense. [Roy and colleagues](https://veneraarnaoudova.com/wp-content/uploads/2021/09/2021-FSE-CR-Reassessing-Automatic-Evaluation-Metrics-for-Code-Summarization-Tasks.pdf), [Nie and colleagues](https://aclanthology.org/2022.acl-long.339.pdf).

## Prioritized generator and wiki work

### P0: establish an inspectable semantic foundation

1. **Preserve facts through all views.** Reuse resolved symbol identities and checked contracts. Give extracted facts a kind, owning operation, scope/guard, source location, event identity, relevant inputs/results, and relation kind. Retain the contributing facts when a paragraph or arrow aggregates them. This can begin with an internal representation; a new public protocol is unnecessary solely to implement presentation.
2. **Verify extraction independently of realization.** Maintain a construct coverage matrix and independent expectations for observable behavior. The existing planner ledger should remain, supplemented by fixtures that catch absent expressions, conditions, effects, and boundaries before planning. Multiple correct renderers sharing an incomplete extractor are still incomplete.
3. **Define abstraction invariants.** Every displayed direct relation has a resolved witness. Every required relation is present either directly or in an explicitly linked aggregate. Repeated event occurrences remain distinguishable in behavior views. Graph partitioning repeats boundary nodes and reopens control frames without changing their meaning.
4. **Publish limits beside claims.** Keep interface dispatch, native contracts, deferred work, worker/task boundaries, streams, error mapping, and interceptor short circuiting explicit. Distinguish no checked effect from unavailable analysis. These changes report existing semantics; they do not authorize ownership, GC, scheduling, channel, or security-policy changes.

### P1: make the contract visible before the body

1. Add or refine a compact operation synopsis containing public inputs, result, capabilities, changes, checked failures, and relevant ownership or lifetime boundaries. Use existing effective contracts so inherited, forwarded, generic, and intercepted operations remain accurate.
2. Let readers recover HTTP input origins, success response behavior, mapped failures, and unmapped failure handling without expanding a long source-level signature. Complete exact signatures can remain in a disclosure.
3. Add evidence-derived orientation for long bodies, preserving a complete detailed explanation below it. Use control and effect boundaries to select paragraph or stage boundaries. Avoid claiming a business stage solely because a name contains a familiar word.
4. Keep named intermediate values visible when they clarify how one operation feeds another. Retain exact complex expressions on demand with direct evidence links. Expanding every nested argument at every use can increase reading effort without adding new understanding.

### P2: make every coarse page lead to the next useful question

1. Begin project pages with entry points, startup/composition, areas, results, and external contracts. Begin folder pages with that folder's boundary and direct children. Begin module pages with callable/type contracts and local relationships.
2. Label grouped operations and results concisely and show complete aggregate counts. Attach `+N more` to its own complete contract group, with enough context to identify what the count measures.
3. Support both descent and return: project ↔ folder ↔ module ↔ operation ↔ detailed behavior ↔ source. Link a sequence participant or operation to the same declaration used by prose and the contract table. Add caller/context routes where the existing semantic graph can supply them accurately.
4. Keep relationship kinds distinct. Calls, value construction, injection, inheritance, deferred invocation, and returned values answer different questions. A view may select a few kinds, but its scope and the other available views should be explicit.
5. Rewrite the wiki's main reading path around the resolution table and actual tasks: understand a project, follow an API, use an operation, inspect failures, and plan a change. Let the handbook explain language concepts while generated examples demonstrate the checked program. Preserve source and exact contracts as directly reachable evidence.

### P3: qualify stronger assistance before promising it

Task-focused data lineage, semantic change summaries, architecture-intent mappings, or evidence from observed execution can be useful later. They need independent input models, boundary rules, and qualification. A call result and parameter-name match do not by themselves establish interprocedural data provenance. An import graph is not a capability graph. Authored tests do not establish observed outcomes.

Start with focused views that the current compiler facts can support. Weiser's slicing work offers a principled model for choosing behavior-relative context, but implementing sound slices across August's capabilities, callbacks, concurrency, and native boundaries is a substantial separate analysis. Avoid labeling ordinary selected relationships as a program slice. [Weiser](https://www.cs.kent.edu/~jmaletic/cs63901/readings/Weiser84.pdf).

## Evaluation and acceptance

### Automated semantic and artifact gates

| Gate | Meaningful check | Failure that it should reveal |
| --- | --- | --- |
| Extractor coverage | Independent expected facts for each language construct and important combination | An omitted operand call, guard, mutation, yield, checked failure, or cleanup |
| Prose faithfulness | Compare realized evidence, guards, order, referents, and repeated-event identities to extracted facts | Wrong scope, swapped order, collapsed independent draws, ambiguous pronouns |
| Graph projection | Reconstruct direct relation membership from aggregates and split views | Dropped relation, invented relation, mislabeled dispatch, incomplete aggregate |
| Sequence control | Check active frames and exits across deterministic splits | Work after an unconditional exit, cleanup disappearing, an alternative becoming unconditional |
| Cross-view agreement | Resolve prose, contract, graph, and sequence links to the same checked symbols/contracts | A generic result or failure contract differing between representations |
| Revision and link closure | Verify current inputs, portable links, source ranges, offline dependency copies, and staleness | Accurate text attached to outdated source or an inaccessible contract |
| Determinism and protection | Equivalent inputs produce equal bytes; retain writer coordination and generated-file protections | Platform paths, traversal variation, stale artifacts, unsafe overwrite |
| Rendering and access | Parse ordinary and split Mermaid; inspect wide/narrow, light/dark, keyboard and source fallback | Clipped evidence, unreadable labels, inaccessible disclosures or diagram-only information |

Snapshots remain useful for changes in intended wording. They should complement semantic expectations. Exact node/edge/participant limits are presentation policies to test, not experimentally established thresholds for human comprehension.

Useful adversarial fixtures include nested argument calls; short circuiting; early return inside recovery; cleanup after failure; loop break/continue; repeated identical effects; callback capture versus invocation; same names in distinct modules; alias resolution; generic capability results; interface calls under declared providers; forwarding; constructors; streams; task/worker start/wait; type-only dependencies; and a disconnected pair of methods grouped into the same folder. Pair each fixture with a changed version that alters one behavior and require the relevant explanation/view to change.

### Developer tasks

Compare source with ordinary navigation, explanations alone, diagrams alone where appropriate, and the combined documentation workflow. Match tasks and counterbalance order to reduce learning effects. Give equivalent tool access and training. Record task accuracy, completion time, confidence versus correctness, navigation steps, source openings, and the evidence cited for each answer. Evaluate professional developers, August newcomers, and experienced August users separately.

Use Hello to ask who supplies the logger, whether a call proves a concrete receiver identity, and what would change to redirect output. Use OIDC to ask which inputs come from a cookie or query, when a transaction is consumed, which validation fails before external work, what data reaches each HTTP boundary, how failures become responses, and where a bounded change belongs. Ask readers to predict altered behavior after a small change, then validate the prediction against independently checked/executed evidence.

Use larger and previously unseen programs, not only carefully named showcase examples. Include circular dependencies, broad fan-out, deep folders, long expressions, and partial external knowledge. Measure source avoidance only for tasks that the generated views claim to support. A correct source consultation for an explicit unknown boundary should count as appropriate navigation.

A small formative pilot can find defects and guide iteration; it cannot establish universal superiority. Predeclare any stronger comparative claims, sampling, outcomes, and decision thresholds before measuring them. Report errors and uncertainty, including failures by resolution.

### Coding-agent tasks

Evaluate agents separately from human readers. Hold model, tools, prompt, input revision, and task constant while varying the provided representation. Record correctness, unjustified behavioral assertions, stale-revision mistakes, edit scope, successful validation, token/tool costs, and source retrieval. Require claims and selected edit sites to cite facts in the supplied artifacts. A fluent explanation or fewer source reads is not enough if the agent edits the wrong behavior.

The human studies here do not establish that an LLM benefits equally. Treat this as an August-specific experiment and include deliberately misleading names, incomplete external contracts, and missing author rationale.

## Primary sources and access record

The entries below distinguish inspected original full texts from abstracts. “Full text inspected” means that the original paper was accessible and its relevant methods, findings, and limits were read; it does not imply a replication. Original papers hosted by authors or institutions and publisher records are the basis of the claims.

### Program comprehension and information needs

**1. Nancy Pennington, 1987.** *Stimulus structures and mental representations in expert comprehension of computer programs*. Cognitive Psychology 19(3), 295–341. [Publisher record/abstract](https://www.sciencedirect.com/science/article/pii/0010028587900077), DOI 10.1016/0010-0285(87)90007-7. **Abstract only:** direct full-text access returned 403; a linked PDF mirror was inaccessible. The abstract studies procedural and functional relations and reports an initial study with 80 professional programmers. It establishes the relevance of different relation types, without providing independently inspected detailed results here. Implication: evaluate control, data, and functional orientation separately.

**2. Stanley Letovsky, 1987 reprint of 1986 work.** *Cognitive processes in program comprehension*. Journal of Systems and Software 7(4), 325–339. [Publisher abstract](https://www.sciencedirect.com/science/article/pii/016412128790032X), DOI 10.1016/0164-1212(87)90032-X. **Abstract only:** full text could not be retrieved. The abstract reports verbal protocols from professional programmers and identifies questioning and conjecturing as cognitive events. Implication: let readers inspect evidence for a hypothesis and refine it. Detailed opportunistic-strategy claims are supported here by the independently inspected Storey study rather than assumed from this abstract.

**3. Jonathan Sillito, Gail C. Murphy, and Kris De Volder, 2006.** *Questions Programmers Ask During Software Evolution Tasks*. FSE, 23–34. [Author-hosted full text](https://www.cs.ubc.ca/~murphy/papers/other/asking-answering-fse06.pdf), DOI 10.1145/1181775.1181779. **Full text inspected**, especially study methods, question categories, implications, and limitations. Nine newcomers and sixteen industrial programmers supplied qualitative observations. Tasks, pairing, and observation affect generalization. Implication: organize navigation and evaluation by real questions and their scopes; do not assume a universal top-down reading order.

**4. Margaret-Anne D. Storey, Kenny Wong, and Hausi A. Müller, 1999.** *How Do Program Understanding Tools Affect How Programmers Understand Programs?* Science of Computer Programming. [Author-hosted manuscript](https://www.cs.uvic.ca/~mstorey/papers/scp.pdf), [author publication record](https://webhome.cs.uvic.ca/~mstorey/publications.html). **Full text inspected**, especially participant/design sections and discussion §§6–7. Thirty students compared Rigi, SHriMP, and SNiFF+ on a relatively small program. The authors discuss experimental biases. Implication: support strategy switching, search, context, and filtering; inspect whether imposed grouping creates a false impression of modularity. This is evidence about those tools and tasks, not proof that every graph is helpful.

**5. Amy J. Ko, Rob DeLine, and Gina Venolia, 2007.** *Information Needs in Collocated Software Development Teams*. ICSE. [Author-hosted full text](https://faculty.washington.edu/ajko/papers/Ko2007InformationNeeds.pdf). **Full text inspected**, especially information categories, automation discussion, and study limits. Observations identify 21 types of information, including design and execution questions that were difficult to satisfy. Some information seeking was invisible or influenced by observation. Implication: expose implemented behavior and revision context while retaining authored rationale and execution evidence as distinct sources.

### Abstraction, visualization, and validation

**6. Ben Shneiderman, 1996.** *The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations*. IEEE Visual Languages, 336–343. [Author-hosted full text](https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf), DOI 10.1109/VL.1996.545307. **Full text inspected**, including network data and overview, zoom, filter, details, relate, history, and extract tasks. It supplies a design taxonomy and examples, not a controlled proof of a required navigation order. Implication: allow overview and details on demand together with relationships, context/history, and extraction; merely drawing an overview does not complete the workflow.

**7. Daniel Archambault, Tamara Munzner, and David Auber, 2008.** *GrouseFlocks: Steerable Exploration of Graph Hierarchy Space*. IEEE TVCG 14(4), 900–913. [Author-hosted full text](https://www.cs.ubc.ca/labs/imager/tr/2008/Archambault_GrouseFlocks_TVCG/grouseFlocksSub.pdf), DOI 10.1109/TVCG.2008.34. **Full text inspected**, especially hierarchy constraints, coarsening, and results. The system explores alternative hierarchies using coauthorship and movie data. It supplies concrete abstraction invariants and demonstrations, not a software maintenance experiment. Implication: retain edge witnesses and be precise about what paths a grouped graph can establish.

**8. Helen Purchase, 1997.** *Which aesthetic has the greatest effect on human understanding?* Graph Drawing, LNCS 1353, 248–261. [Publisher record/abstract](https://link.springer.com/chapter/10.1007/3-540-63938-1_67). **Abstract only:** the full chapter requires subscription. The original conference year is 1997; the publisher's online date is later. The abstract reports time and error measures and a stronger effect from reducing crossings than other tested aesthetics. Implication: assess crossings and path-reading errors, rather than assuming a node limit guarantees clarity. Exact experimental parameters were not independently read.

**9. Tamara Munzner, 2009.** *A Nested Model for Visualization Design and Validation*. IEEE TVCG 15(6), 921–928. [Author-hosted full text](https://www.cs.ubc.ca/labs/imager/tr/2009/NestedModel/NestedModel.pdf). **Full text inspected**, especially four levels, threats, and validation §§2–3. This is a methodological model, not an August user study. Implication: separate the correctness/performance of generation from the suitability of the abstraction and the effectiveness of its presentation, and match each claim to evidence at that level.

**10. Gail C. Murphy, David Notkin, and Kevin Sullivan, 1995.** *Software Reflexion Models: Bridging the Gap Between Source and High-Level Models*. FSE, 18–28. [Author-hosted full text](https://www.cs.ubc.ca/~murphy/papers/rm/reflexion_model_fse95.pdf), [author record](https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html), DOI 10.1145/222132.222136. **Full text inspected**, especially formal mapping and reported applications. The technique compares an engineer's model with extracted source relations and identifies convergence, divergence, and absence. Its experience reports are not a controlled superiority test. Implication: preserve explicit mappings and distinguish authored architecture intent from extracted structure.

**11. Mark Weiser, 1984.** *Program Slicing*. IEEE TSE SE-10(4), 352–357. [Original paper in an institutional teaching copy](https://www.cs.kent.edu/~jmaletic/cs63901/readings/Weiser84.pdf), DOI 10.1109/TSE.1984.5010248. **Full text inspected**, including definitions and dependency rules. Slices preserve selected projections of behavior; statement-minimal slicing is generally unsolvable and analysis yields approximate slices. The paper's program model does not cover every modern language feature. Implication: focused context should have an explicit behavioral criterion and dependency analysis; a selected call graph should not acquire a slicing guarantee.

### Traceability and evidence

**12. Orlena C. Z. Gotel and Anthony C. W. Finkelstein, 1994.** *An Analysis of the Requirements Traceability Problem*. ICRE, 94–101. [Institutional full text](https://discovery.ucl.ac.uk/id/eprint/749/1/2.2_rtprob.pdf), DOI 10.1109/ICRE.1994.292398. **Full text inspected**, especially methods and pre-/post-specification distinctions. The empirical work involved over 100 practitioners and emphasizes locating origins and the social nature of requirement production. Implication: source links establish implementation correspondence; preserve separately the reasons and requirement sources that code cannot reconstruct.

**13. W3C, 2013.** *PROV-DM: The PROV Data Model*. W3C Recommendation, April 30, 2013. [Normative source](https://www.w3.org/TR/prov-dm/). **Relevant standard sections inspected:** entities/activities, derivation, revision, and provenance examples. This is a standard and vocabulary, not evidence of comprehension benefit. Implication: record what a generated fact was derived from, with revision and responsible generating activity; do not confuse an artifact being used somewhere with a demonstrated derivation of every claim.

### Deterministic language generation and evaluation

**14. Paul W. McBurney and Collin McMillan, 2014.** *Automatic Documentation Generation via Source Code Summarization of Method Context*. ICPC, 279–290. [Author-hosted full text](https://sdf.org/~cmc/papers/mcburney_icpc_2014.pdf). **Full text inspected**, especially NLG architecture, selection, study, participant feedback, and conclusion. Twelve Java programmers evaluated selected-context summaries. Name-based assumptions and selection limit completeness; feedback notes missing parameters, errors, and alternatives. Implication: include context and structured contracts, retain complete behavior below any summary, and validate wording separately from content coverage.

**15. Hercules Dalianis, 1995.** *Aggregation in the NL-generator of the Visual and Natural Language Specification Tool*. EACL, 286–290. [Original full text](https://aclanthology.org/E95-1042.pdf). **Full text inspected.** VINST paraphrases formal information through natural, compact, and surface grammar stages and proposes improvements to its generation representation. It is a telecom specification prototype, not a general program-language completeness study. Implication: grammatical aggregation can improve formal-fact narration; preserve semantics in the underlying representation and verify every language-specific aggregation rule.

**16. Albert Gatt and Ehud Reiter, 2009.** *SimpleNLG: A Realisation Engine for Practical Applications*. ENLG, 90–93. [Original full text](https://aclanthology.org/W09-0613.pdf). **Full text inspected.** Developers control phrase construction, grammatical features, and linearization, including mixed canned and constructed text. The engine supplies realization, not fact selection or truth checking. Implication: keep August's controlled grammar layer small and explicit, with semantic extraction and discourse planning separately testable; adopting the Java implementation is unnecessary.

**17. Devjeet Roy, Sarah Fakhoury, and Venera Arnaoudova, 2021.** *Reassessing Automatic Evaluation Metrics for Code Summarization Tasks*. ESEC/FSE, 1105–1116. [Author-hosted full text](https://veneraarnaoudova.com/wp-content/uploads/2021/09/2021-FSE-CR-Reassessing-Automatic-Evaluation-Metrics-for-Code-Summarization-Tasks.pdf), DOI 10.1145/3468264.3468588. **Full text inspected**, especially annotator methods, results, and recommendations. The study uses 226 annotators and finds that small metric differences and individual-summary scores are unreliable proxies for human judgment in its setting. Implication: directly assess accuracy, adequacy, fluency, and concision, and measure task outcomes. Its numeric thresholds are not universal gates for August.

**18. Pengyu Nie, Jiyang Zhang, Junyi Jessy Li, Ray Mooney, and Milos Gligoric, 2022.** *Impact of Evaluation Methodologies on Code Summarization*. ACL, 4936–4960. [Original full text](https://aclanthology.org/2022.acl-long.339.pdf), DOI 10.18653/v1/2022.acl-long.339. **Relevant full-text sections inspected**, including use cases, methodological comparison, discussion, and conclusion. Learned summarizer results differ under mixed-project, cross-project, and time-segmented evaluation. Implication: state the use case and test across programs and revisions. Applying this principle to a deterministic compiler generator is an engineering inference, not a transfer of the paper's ML results.

## Risks and limits for v1

The largest risk is a faithful-looking overview that silently changes the meaning of the underlying facts. Other risks include hiding failures beneath successful-flow narration, confusing declared and observed behavior, inferring intent from names, conflating repeated evaluations, mismatching source evidence after regeneration, and treating output size as a proxy for cognitive effort.

The implementation can reduce reconstruction work without making every foreign implementation, external system, business requirement, or runtime history knowable. Stronger v1 claims should be limited to checked implemented behavior, stated analysis boundaries, and measured tasks. Pending approval or unqualified runtime, ownership, GC, worker/channel, and security work stays outside this research recommendation.

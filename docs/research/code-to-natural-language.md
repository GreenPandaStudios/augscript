# Research: deterministic prose from source code

Reviewed September 29, 2026. August's spec generator explains local behavior in paragraphs and links to the dependencies used by the file. This note records the research behind that design and how to evaluate it. For usage, see [compiled specifications](../specifications.md).

## Findings that matter for August

A practical approach is to generate text from explicit program facts through document planning, sentence planning, and realization. Classic NLG separates content determination, discourse planning, aggregation, lexicalization, reference generation, and realization [1]. McBurney and McMillan apply these ideas to code, including fixed message ordering and rules that combine related phrases [5]. August uses this separation to plan paragraphs before choosing sentences.

Aggregation can reduce repeated subjects and predicates while retaining the facts being communicated. Dalianis and Hovy explicitly distinguish repackaging facts from dropping selected information, and restrict reordering to zones where ordering is free [8]. For program explanations, that restriction matters: execution order, branch scope, mutation, and error behavior cannot be treated as freely reorderable facts.

Program names can suggest wording, but behavior must come from the checked code. SWUM represents action, theme, and argument relationships in names and signatures [3]. The parameter-comment work combines these clues with control flow and data dependencies and acknowledges limitations from uninformative names and abbreviations [4]. August should establish behavioral claims from its compiler representations before choosing wording.

Context can help explain how a function fits into its program. The context-summary research uses call relationships and output uses [5, 6]. Its relevance ranking deliberately selects a small subset of context, and its evaluations concern summaries. It does not demonstrate generation of a complete executable or behavioral specification.

## Primary literature reviewed

Each entry describes the findings and their limits for August. Sources are linked to the paper or its publisher/author copy. Full text was inspected where available; the two abstract-only entries are marked explicitly.

### 1. Reiter and Dale, 1997: the generation pipeline

Ehud Reiter and Robert Dale. *Building Applied Natural Language Generation Systems*. Natural Language Engineering 3(1), 57–87, March 1997. [Publisher record and abstract](https://www.cambridge.org/core/journals/natural-language-engineering/article/abs/building-applied-natural-language-generation-systems/FEB374A3FF652F06D8567A6FAB2EF36E), [author-hosted PDF](https://web.science.mq.edu.au/~rdale/publications/papers/1997/jnle97.pdf). DOI: 10.1017/S1351324997001502.

The paper identifies content determination, discourse planning, sentence aggregation, lexicalization, referring expression generation, and linguistic realization as distinct tasks in applied NLG. Its stated emphasis is techniques suitable for practical systems. This gives August a vocabulary for separating semantic extraction from paragraph structure and wording. **Access limit:** the publisher abstract was read; author PDF fetching failed during this review. Detailed pipeline mechanics are additionally supported by the full-text implementation in [5]. The paper is architectural guidance, not a proof of specification completeness or reproducibility.

### 2. Sridhara et al., 2010: method summary comments

Giriprasad Sridhara, Emily Hill, Divya Muppaneni, Lori Pollock, and K. Vijay-Shanker. *Towards Automatically Generating Summary Comments for Java Methods*. ASE 2010, 43–52, September 2010. [Publication DOI](https://doi.org/10.1145/1858996.1859006), [paper abstract](https://www.researchgate.net/publication/220883580_Towards_automatically_generating_summary_comments_for_Java_methods).

The authors describe deriving descriptive method summaries from method signatures and bodies, and report programmer judgments of accuracy, important content, and conciseness. This is directly relevant precedent for source-based comment generation. **Access limit:** only the original paper's abstract was accessible; the publisher rejected access and the linked repository copy was unavailable. Implementation details should not be attributed to an independently read full text here. The later full-text papers [4, 5] discuss its selection of important statements. Neither favorable summary judgments nor selecting important content establishes that every behavior is explained.

### 3. Hill, Pollock, and Vijay-Shanker, 2011: linguistic roles in code

Emily Hill, Lori Pollock, and K. Vijay-Shanker. *Improving Source Code Search with Natural Language Phrasal Representations of Method Signatures*. ASE 2011, November 6–10, 2011. DOI: 10.1109/ASE.2011.6100115. [Author-uploaded full text](https://www.researchgate.net/publication/220883654_Improving_source_code_search_with_natural_language_phrasal_representations_of_method_signatures).

The paper uses SWUM to derive action, theme, secondary argument, and auxiliary argument roles. Its search score incorporates word location, role, distance from a phrase's head, and usage. The evaluation covers eight search tasks from four Java programs. Phrasal structure can distinguish adding an auction from adding an auction link. This supports keeping noun phrases and argument roles intact during wording. Its empirical result concerns search relevance, not generated documentation accuracy; the authors discuss limited generalization beyond Java. August's symbol resolution must establish what is called, independently of lexical heuristics.

### 4. Sridhara, Pollock, and Vijay-Shanker, 2011: parameters in context

Giriprasad Sridhara, Lori Pollock, and K. Vijay-Shanker. *Generating Parameter Comments and Integrating with Method Summaries*. ICPC 2011, 71–80. DOI: 10.1109/ICPC.2011.28. [Full paper](https://www.cs.kent.edu/~jmaletic/cs63902/Papers/Pollock11.pdf).

This method-local approach combines control flow, control and data dependencies, def-use chains, and SWUM information to identify a parameter's main role and connect it to the method's computation. It supports parameter comments and integration into method summaries. Nine experienced developers evaluated the results. The authors explicitly describe reduced readability and analysis accuracy from abbreviations and a dependence on meaningful identifiers. The approach emphasizes primary usage, so it does not justify omitting secondary parameter uses when August promises comprehensive local behavior.

### 5. McBurney and McMillan, 2014: readable method context

Paul W. McBurney and Collin McMillan. *Automatic Documentation Generation via Source Code Summarization of Method Context*. ICPC 2014, 279–290, June 2–3, 2014. [Author-hosted full paper](https://sdf.org/~cmc/papers/mcburney_icpc_2014.pdf).

The technique combines call graphs, PageRank-selected contextual methods, SWUM, and a custom NLG pipeline. Its document plan uses predefined message ordering; aggregation combines related phrases and suppresses repeated subjects and verbs. A study with twelve Java programmers evaluates understanding of internal behavior, purpose, and usage. This is particularly useful evidence that rule-driven code descriptions can form connected sentences. However, it selects only some context and uses simplifying assumptions about names and outputs. Its context descriptions are clues about role, not verified design intent or an exhaustive dependency contract.

### 6. McBurney and McMillan, 2015 accepted manuscript: stronger comparison

Paul W. McBurney and Collin McMillan. *Automatic Source Code Summarization of Context for Java Methods*. IEEE Transactions on Software Engineering, accepted manuscript bearing 2015 copyright and DOI 10.1109/TSE.2015.2465386. [Full accepted manuscript](https://sdf.org/~cmc/papers/mcburney_tse15.pdf).

This extension compares context summaries with expert summaries and an existing automatic summarizer. Its conclusion reports better contextual information than manual summaries, while human summaries were more accurate and concise; combining generated context with existing summaries improved documentation. This qualifies the earlier results: useful context does not imply human-level overall quality. The linked copy is a prepublication manuscript, so 2015 here identifies that manuscript rather than asserting the final issue's publication year. These studies are from the same research line and should not be counted as independent replications.

### 7. Reiter, Mellish, and Levine, 1995: documentation and links

Ehud Reiter, Chris Mellish, and John Levine. *Automatic Generation of Technical Documentation*. Applied Artificial Intelligence 9, 259–287, 1995; preprint submitted November 1994. [Full preprint](https://arxiv.org/pdf/cmp-lg/9411031), [version metadata](https://arxiv.org/abs/cmp-lg/9411031).

The IDAS work generates documentation from domain knowledge and linguistic/contextual models, including hypertext nodes and links. It discusses the expense of adding information absent from existing design databases and checking whether generated language faithfully reflects the knowledge base. This supports retaining explicit facts and structured references as generator input. It also shows why the quality of the underlying model constrains the text. IDAS concerns equipment help and tailored documentation, not compiler extraction from arbitrary programs; it does not solve August's dependency selection problem.

### 8. Dalianis and Hovy, 1993 workshop version: aggregation

Hercules Dalianis and Eduard Hovy. *Aggregation in Natural Language Generation*. EWNLG 1993 workshop version, later a chapter in *Trends in Natural Language Generation*. [Author-hosted manuscript](https://people.dsv.su.se/~hercules/papers/EGEN_Aggregation_NLG_1996.pdf).

The manuscript identifies aggregation operations from a small telephone-domain study, including grouping shared subjects and predicates. It distinguishes reducing redundancy from entirely omitting information chosen for communication. Its ordering discussion confines rearrangement to free-order zones in a discourse structure. Twelve participants completed the questionnaire; nine produced aggregated text. This provides concrete rules for turning repeated factual sentences into paragraphs. Its small constrained domain and assumptions about discourse structure limit generalization. The manuscript's heading identifies the 1993 workshop version; the filename should not be used as publication metadata.

### 9. Dalianis, 1995: aggregation for formal specifications

Hercules Dalianis. *Aggregation in the NL-generator of the Visual and Natural Language Specification Tool*. EACL 1995, 286–290. [Full paper](https://aclanthology.org/E95-1042.pdf).

VINST paraphrases formal information through naturalization, compacting, and surface grammar stages. The paper describes repeated noun phrase removal and proposes predicate grouping and a bidirectional grammar to improve tedious fact-base descriptions. This is an unusually close precedent for readable natural language from a formal specification representation. The discussion concerns a telecom specification prototype and a proposed architecture improvement, not an empirical demonstration that all program behaviors can be paraphrased without ambiguity. Use its representation-oriented approach while verifying August's individual language constructs.

### 10. Gatt and Reiter, 2009: realization under developer control

Albert Gatt and Ehud Reiter. *SimpleNLG: A Realisation Engine for Practical Applications*. ENLG 2009, 90–93, March 30–31, 2009. [Full paper](https://aclanthology.org/W09-0613.pdf).

SimpleNLG separates tactical linguistic choices from mechanical syntax, morphology, and linearization. Developers retain control over how semantic inputs map to phrase structures; the engine supports mixed canned and constructed text. This supports a small controlled realization layer handling coordination, agreement, inflection, and punctuation. It does not choose which source-code facts are true or complete. August need not adopt the Java library: the architectural separation is useful in a TypeScript compiler, and byte-identical output remains an engineering requirement to verify separately.

### 11. Roy, Fakhoury, and Arnaoudova, 2021: evaluation metrics

Devjeet Roy, Sarah Fakhoury, and Venera Arnaoudova. *Reassessing Automatic Evaluation Metrics for Code Summarization Tasks*. ESEC/FSE 2021, 1105–1116, August 23–28, 2021. DOI: 10.1145/3468264.3468588. [Author-hosted full paper](https://veneraarnaoudova.com/wp-content/uploads/2021/09/2021-FSE-CR-Reassessing-Automatic-Evaluation-Metrics-for-Code-Summarization-Tasks.pdf).

A study with 226 human annotators compares automatic metrics and human summary judgments. In its setting, improvements below two metric points do not reliably indicate quality improvements, and corpus BLEU remains unreliable for some larger differences. This argues against treating lexical overlap as the acceptance gate for August's prose. These observations concern the studied datasets and summarizers; they are not universal numerical thresholds. August needs direct semantic coverage checks and reader comprehension judgments, as separate dimensions.

### 12. Nie et al., 2022: evaluation should match use

Pengyu Nie, Jiyang Zhang, Junyi Jessy Li, Ray Mooney, and Milos Gligoric. *Impact of Evaluation Methodologies on Code Summarization*. ACL 2022, 4936–4960, May 2022. DOI: 10.18653/v1/2022.acl-long.339. [Full paper](https://aclanthology.org/2022.acl-long.339.pdf).

The authors compare mixed-project, cross-project, and time-segmented evaluation of learned code summarizers. Different splits can lead to conflicting conclusions, and the paper maps evaluation methods to intended use cases. This is chiefly relevant if August later adds learned lexical or summary components. Its broader lesson motivates representative acceptance examples and revisions of real programs. A deterministic rule generator has no training leakage in the same sense, so the paper's machine-learning results should not be presented as direct evidence of August's quality.

## Design criteria for August

These criteria are derived from the requirements and literature. The current compiler uses a behavior tree and deterministic sentence/paragraph planning in `src/spec-tree.ts`, with resolved contracts and dependencies in `src/spec.ts`. That implementation must be evaluated against the criteria; the papers do not establish its coverage or readability.

1. Extract an immutable behavior representation from resolved compiler structures. Each fact should retain its construct identity, lexical scope, source location, guard, ordering relation, and involved symbols. Represent bindings, calculations, calls, returns, mutation, loops, pattern alternatives, cleanup, capabilities, and checked errors explicitly.
2. Plan documents by module and declaration, and explain each body in its actual control structure. A declaration overview can precede its detailed behavior; branches and repeated actions should remain recognizable in paragraphs. Paragraph breaks are useful boundaries for changes in scope or topic.
3. Aggregate adjacent compatible clauses. Combine shared subjects or predicates, introduce a value once, and use unambiguous references afterward. Keep quantified repetition, negation, mutually exclusive alternatives, and early returns explicit. Repeated calls are distinct events even when their text matches.
4. Use a controlled lexicon and grammar. Render equality, assignment, comparison, indexing, conditional execution, iteration, and error propagation with stable terminology. Treat names as names; retain an identifier or a precise source fragment when linguistic expansion would guess its meaning.
5. Derive dependency surfaces from resolved usage: called declarations, referenced values, accessed members, referenced types and constructors. Imports alone do not prove a surface is used. Aliases must resolve to their original declaration. Define separately whether type-only usage belongs in the dependency section.
6. Link a dependency at its use and provide one canonical description of its used contract. Explain local call arguments, return handling, state changes, and failure handling locally. Avoid recursively narrating an entire dependency implementation. If symbol resolution or documentation is unavailable, state that boundary explicitly without inventing behavior.
7. Make determinism explicit: fixed traversal and ordering, fixed grammar rules, canonical links, no random variation or remote generation, and no timestamps or environment-specific paths in the output. Equal compiler inputs and generator version should produce equal bytes. This is a project contract requiring tests, not a research guarantee.
8. Preserve a coverage ledger through planning and aggregation. Every required source fact must be realized or deliberately accounted for. Aggregated clauses should retain all contributing fact identities. This makes missing local behavior inspectable without forcing one sentence per AST node.

## Validation criteria

Use independent gates for factual coverage, faithfulness, readable prose, dependency scope, valid links, and reproducibility. Representative fixtures should include nested alternatives, early exit, loops, local mutation, errors, callbacks, aliases, overloaded or ambiguous references, type-only dependencies, and repeated effects. A sentence snapshot alone cannot prove behavior coverage.

For prose quality, ask readers to recover inputs, outputs, branching, state changes, errors, and the role of dependencies from the generated document. Review sentence-level truth separately from paragraph coherence and excessive detail. The literature supports these as useful evaluation directions; it does not establish that a compiled prose document replaces executable semantics, formal verification, domain requirements, or handwritten explanations of design intent.

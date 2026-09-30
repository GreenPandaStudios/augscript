# Wiki editorial design research

Retrieved: 2026-09-30. Scope: public language documentation architecture and prose; this note does not establish AugustScript's implementation capabilities or comparative performance.

## Primary source observations

The Rust book introduces the language's purpose, identifies its readers, states that readers should already know another programming language, and explains a sequential learning path. Its chapters alternate concepts with small projects; its introduction also explains how deliberately failing examples are labeled. These are useful mechanisms for setting expectations before the reader encounters unfamiliar rules. [Rust book introduction](https://doc.rust-lang.org/book/ch00-00-introduction.html)

The C About page opens with a small program, explains the language's history and common uses, and links to learning resources and the standards committee. Its compact presentation connects a concrete language sample to purpose and provenance. This observation concerns the page's editorial structure, not independent verification of its historical or adoption claims. [C About](https://www.c-language.org/about)

Diátaxis distinguishes tutorials, task-oriented how-to guides, technical reference, and explanation according to the reader's needs. It recommends organizing documentation around these different needs. [Diátaxis](https://diataxis.fr/)

For tutorials, Diátaxis recommends an achievable practical goal, small concrete actions, visible results early, expected output, and a dependable path. It advises moving extended explanations and alternative choices out of the immediate lesson. [Diátaxis tutorials](https://diataxis.fr/tutorials/)

For reference, Diátaxis recommends precise descriptions, consistent patterns, an organization corresponding to the product, and examples that illustrate usage. It explicitly recognizes generated API documentation as useful for fidelity while distinguishing it from a complete documentation system. [Diátaxis reference](https://diataxis.fr/reference/)

Google's developer style guide recommends conversational, respectful prose, active voice, second person, descriptive links, and conditions stated before instructions. It advises against announcing unreleased functionality in documentation. [Google style highlights](https://developers.google.com/style/highlights)

Google's tone guidance emphasizes direct, useful writing for developers who may be in a hurry. It discourages buzzwords, filler, awkward sentences, and assurances that procedures are easy. Its code-sample guidance recommends introductory context, the relevant project's formatting conventions, readable line lengths, and explicit comments for omitted code. [Google voice and tone](https://developers.google.com/style/tone), [Google code samples](https://developers.google.com/style/code-samples)

Write the Docs recommends explaining the problem a project solves, showing a common small example, providing concise basic installation instructions with links to caveats, and exposing source, issue reporting, support, contribution, and license information. It warns that expanding FAQs can accumulate unrelated material and become difficult to search. [Write the Docs beginner guide](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)

## Application to AugustScript

The following recommendations are editorial synthesis, not claims made by the sources. The audience supplied for this work is senior engineers and large teams changing unfamiliar modular code with coding agents, with a quick entrance for hobbyists. Agent experiments are still underway: the wiki should present inspectable language mechanisms and examples without claiming that superiority has been proved.

The audit issues to resolve are mixed navigation, dense reference serving as the first lesson, unsupported metrics or broad claims, and a missing progression for learners. These are local editorial concerns, not external research findings.

### Give each reading mode a clear entrance

Use a small public landing page to explain what AugustScript is, the problems its design addresses, how to run a first program, and where to continue. Place a short, implemented example near the opening. Describe the current implementation and material limits plainly; link to detailed status rather than placing a backlog in the main introduction. This recommendation combines C's compact positioning with Write the Docs' practical entry points.

Provide five recognizable documentation areas:

| Area | Reader's purpose | Editorial shape |
| --- | --- | --- |
| Learn | Build familiarity with the language | A book-like sequence of lessons and small programs |
| Guides | Complete a specific task | Prerequisites, actions, expected result, relevant caveats |
| Reference | Check exact behavior | Consistent language, library, CLI, and configuration entries |
| Explanation | Understand a design choice | Rationale, tradeoffs, examples, and links to exact contracts |
| Engineering | Work on AugustScript itself | Compiler/runtime architecture, contribution, releases, documentation maintenance |

The four reader modes adapt Diátaxis; Engineering is a local addition for contributors. Keep product-user learning distinct from instructions for maintaining the repository. A source file or implementation detail belongs in public prose when it helps explain a contract or debug a real problem.

### Build a dependable learning sequence

State the assumed programming background. Begin with installation and a runnable first program, then build toward values and functions, control flow, custom data, modules and public boundaries, errors, and explicit capabilities as supported by the implementation. Use a modest project to connect earlier concepts before presenting advanced reference detail. Treat this sequence as a proposal to validate against actual dependencies between language features.

Each lesson should answer a concrete question, show a complete program or clearly labeled fragment, explain the important behavior, and provide the output or diagnostic the reader should observe. Introduce one unfamiliar idea at a time where practical. Link to the full reference for exhaustive syntax, edge cases, and advanced forms. Deliberately failing programs should say that they fail before the code and explain the diagnostic afterward. Rust's failure labeling and Diátaxis' expectation-setting support these choices.

### Make prose earn trust through evidence

Explain a mechanism and its consequence in ordinary developer language. For example, an account of module boundaries should show what a caller can access and what change is rejected, then explain how that makes an unfamiliar module easier to inspect. Avoid turning design goals into guarantees. Quantitative performance or productivity claims require reproducible evidence and scope; otherwise remove them or describe them as an investigation.

Keep implementation limits next to affected examples and contracts. A centralized readiness page can summarize support, but readers should not need to discover it to learn that the example in front of them cannot run. Clearly distinguish implemented behavior, experimental behavior, and proposed work. Pending approval work must not appear as an available capability.

Use short connected paragraphs, concrete titles, and code identifiers when they identify actual syntax or APIs. Introduce code with its purpose, then explain what to notice. Reserve tables for comparisons and mappings; reserve lists for actual sequences or parallel facts. Concision should remove repetition and filler while preserving the reasoning needed to understand the example.

### Verify the published contract

The local verification recommendation is to execute runnable examples with the documented compiler and CLI, check intended failures, and compare output with the prose. Validate package installation paths as documented, preserve executable-fence metadata, regenerate API and construct pages, and run documentation drift and site checks. Recheck readiness statements against code, tests, and the approved scope. Generated reference and handwritten explanations should agree on terminology and behavior.

Success means a newcomer can reach a working program and understand why it behaves as shown; a returning engineer can locate an exact contract; and a contributor can find implementation instructions without interrupting either journey.

## Installation audit during implementation

The source wiki still said the CLI had not been published. A live `npm view` check on September 30, 2026 found `@greenpandastudios/aug-cli`, `aug-stdlib`, `aug-web`, and `aug-crypto` at 0.19.0; the CLI's `next` and `latest` tags both selected that version and its library dependencies used exact matching versions. The published CLI was installed in a temporary directory and passed starter creation, checking, a native test, execution, spec generation, and read-only drift checking. That smoke run reused the verified native cache and does not by itself establish a fresh host's full web/crypto bootstrap. [CLI registry metadata](https://registry.npmjs.org/@greenpandastudios%2Faug-cli), [standard library](https://www.npmjs.com/package/@greenpandastudios/aug-stdlib), [web library](https://www.npmjs.com/package/@greenpandastudios/aug-web), [crypto library](https://www.npmjs.com/package/@greenpandastudios/aug-crypto)

An additional run used the exact `npx @greenpandastudios/aug-cli@next init` starter, a global installation under a temporary prefix, and an empty temporary native cache. The extraction-only minicoro/yyjson bootstrap, native test, run, spec generation, and drift check all passed. This verifies the book's core onboarding path on the measured macOS host; it does not certify fresh web/crypto builds or other platforms.

The installation lesson now uses available registry commands. This is a concrete example of why editorial review must check public claims against live distribution evidence, even when the checked source examples remain valid.

# Writing the August documentation

Write for a developer who wants to understand a program, complete a task, or check a rule. The wiki serves people trying August, engineers assessing it for a team, and developers working with coding agents. State what the current language does and show it in code. Design goals need explanation; claims of safety, speed, productivity, or production readiness need evidence and scope.

The [editorial research](research/wiki-editorial-design.md) records the primary sources behind this approach. The Rust book informs the learning sequence; C's About page informs the compact introduction. Diátaxis informs the separate reading modes. Google's developer style guidance informs the prose. August's writing and examples are original.

## Put a page in the right place

| Reader's need | Place | What the page provides |
| --- | --- | --- |
| Learn a new concept | `docs/learn/` and `getting-started.md` | A runnable lesson with a goal, expected result, and next step. |
| Complete a task | `docs/guides/` or an existing task guide | Direct actions, prerequisites, verification, and relevant limits. |
| Look up exact behavior | Language, tooling, grammar, or generated API reference | Precise contracts and a consistent structure. |
| Understand a design or assess the language | About, performance, readiness, compatibility, roadmap | Reasons, tradeoffs, and evidence. |
| Maintain August | Contributor guides and research notes | Repository workflows and implementation details. |

Keep existing URLs and anchors when a page still serves the same need. Add links to the lesson or task guide rather than turning the reference into a second book. Contributor processes belong under Contribute in navigation.

## Explain it like a developer

Open with the problem or operation the reader cares about. Introduce a program by saying what it does, then explain the important lines and their consequences. Use ordinary connected sentences and short paragraphs. Name actual declarations and commands. Explain unfamiliar terms when they first matter.

Use lists for steps or parallel items and tables for comparisons. A prose explanation should not become a stack of bullets, headings, or signature dumps. Remove repeated summaries and promises that a topic will be explained later. Avoid promotional adjectives and claims that a procedure is easy. Precision matters more than brevity when a dependency, state change, failure, or limit could surprise the reader.

For example, write: “The group constructs a new counter for each case. The second case still sees its initial value.” That explains the behavior a reader can observe. “Isolated test architecture enables scalable validation” does not.

## Give examples a dependable path

A lesson assumes the reader knows programming, not August. State where commands run, which files to save, and the output to expect. Introduce one new mechanism at a time where practical. Put detailed alternatives and edge cases in the reference and link them from the lesson.

Complete runnable source uses `aug project=NAME file=PATH` fences and an entry in `docs/examples.json`. Fragments use `text` and explicitly say they are fragments. Before an intentional failure, say what change the reader is making and that checking or running it should fail; afterward explain the result and how to restore working code. Test important failing examples as well as successful ones when the lesson depends on that behavior.

Handwritten lesson code is checked and run by `tests/documentation.test.mjs`, including nested Learn and Guides pages. `docs/lesson-failures.json` describes the book's tested mistake transformations and expected diagnostics. Generated gallery pages get their examples from `docs/example-projects.json` and `scripts/example-docs.mjs`. Edit those inputs, source, or Javadoc and regenerate; do not hand-edit generated Markdown.

## Keep claims current

Verify command names against CLI help and contracts against declarations, checker/runtime behavior, and regression tests. Do not infer semantics from a function's name. Keep release versions and installation availability in their canonical pages; link to them from introductions. A possible future command is not an installation instruction.

Performance claims need a workload, compiler version, environment, methodology, and raw measurements. The homepage links to the benchmark page instead of duplicating numbers that can become stale. Do not treat microbenchmarks as evidence of agent productivity or general production readiness.

An example involving security or deployment states its applicable limits nearby. Pending approval work and proposals remain labeled as such. Keep [readiness](production-readiness.md), the [roadmap](roadmap.md), and [library gaps](web-library-gaps.md) consistent with implemented behavior.

## Review before publishing

Follow [documentation maintenance](maintaining-docs.md) for generation and executable checks. Read the rendered page as a newcomer: can you find the first action, follow dependencies, understand the result, and locate the full contract? Check a narrow screen for long code and tables, and a wider screen for code/spec comparisons. Review copied source as well as visual wrapping.

Research notes cite primary sources near the claims they support and distinguish findings from recommendations. Link research from contributor pages when it explains an editorial decision; users should not need to read the research to use August.

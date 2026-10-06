# Generated diagrams at several levels

This is the 1.0 requirement authorized on October 5, 2026. August should help developers and coding agents understand a large program before changing its implementation. The code, compiled explanation and diagrams must describe the same checked program.

## Output contract

Ordinary `aug spec` creates an adjacent `FILE.aug.diagrams.md` for each explained source and `.aug-spec/diagrams/index.md` for the project. Specs link to their diagram page. The project page connects areas and modules; module pages show class interactions, calls and source-order operation sequences. HTTP routes appear in the overview and their handler sequences. Dependency diagrams use the existing versioned offline source/spec copies. Generation executes no project code and uses no model or network.

The smallest useful view comes first. An area is a top-level project folder, the project root, or an installed library identity. Module views retain the complete direct relationships. Class views collapse methods into their owning class, interface or interceptor while retaining interfaces and injected fields. API views keep resolved callable identities. Sequences do not inline helpers: each target links to its own module so readers can choose the next level.

Each graph has at most 18 nodes and 30 edges. Each sequence view has at most 12 participants and 24 call/note steps. Larger views split in deterministic order, repeat boundary nodes and reopen active control frames with continuation notes. Every relationship and sequence step remains available. These are presentation limits, not limits on programs. Long labels end in an ellipsis; the linked spec and source retain the full expression.

## Truth and boundaries

Use resolved compiler targets rather than matching names. Preserve nested argument evaluation, short-circuit conditions, branches, loops, early exits, checked failures, explicit recovery and cleanup, task/worker starts and waits, and streaming yields. Display forwarding without inventing wrapper behavior. Constructors show state initialization and validation. Interface dispatch remains an interface call; a configured provider does not prove a runtime receiver identity. Native code remains opaque. Creating a callback or browser handler is not an immediate call.

Applied interceptors and HTTP policies can short circuit, replace inputs and fail. Handler diagrams name the applied layers and refer to the effective spec rather than inventing an unconditional call chain. The diagrams are static possible-flow views, not observed traces, proofs of behavior or a complete foreign/external call graph. Same-file test behavior remains in the spec.

## Reading and publication

The wiki starts from the project overview, links to module interactions and API sequences, then to the compiled explanation and exact source. Code retains indentation/braces switching. Mermaid is rendered locally as SVG with strict sanitization, accessible source fallback, scrolling and magnification. Diagrams load when approached and follow the burgundy light/dark theme. Do not replace them with screenshots.

Source diagrams follow the existing spec manifest, source-writer coordination, drift check, generated-file cleanup, handwritten-file and symlink protection. Normal packages and downloadable examples include them. The prose spec remains concise and authoritative for the complete implemented behavior.

## Acceptance

Require portable byte determinism, equivalent relationships across block styles, compiler-rejection gating, exact resolved targets, meaningful control-flow fixtures, parsed Mermaid on ordinary and split views, link closure, stale output detection, obsolete artifact removal and handwritten/symlink protection. The gallery and installed CLI must generate the same artifacts. Check rendered desktop/mobile pages in both themes and run existing spec, package, docs and compiler gates.

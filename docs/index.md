---
layout: home
hero:
  name: August
  image:
    light: /brand/august-mark.svg
    dark: /brand/august-mark-dark.svg
    alt: August
  text: The world runs on language
  tagline: Understand a codebase from its overview to its source. Readable code, compiled explanations and diagrams, with measured native performance.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Explore the language
      link: /learn/
features:
  - title: Move from overview to code
    details: Follow modules, class interactions and API sequences, then open the explanation or source for the detail you need.
  - title: Read it like pseudocode
    details: Calls name their inputs. Imports and declaration headers show which dependencies the code uses.
  - title: Compile a human-readable spec
    details: Run aug spec to explain a module in sentences and link to its dependencies. Review the explanation with the code.
  - title: Run at native speed
    details: Compile to a native executable. The programs below compare August with C doing the same work.
---

<!--@include: ./.vitepress/home-example.md-->

<!--@include: ./.vitepress/home-diagram.md-->

## Understand a codebase at the level you need

August is designed for developers and coding agents working in large codebases. Whether you wrote an implementation or an agent produced it, you need to understand its dependencies, decisions and effects before changing it.

Move through the program at several levels: **project overview → module interactions → API sequences → compiled explanation → source**. Each view comes from the checked program and links to the next level. Start with the overview to find the relevant module, follow a sequence to see which operations it calls, and open the source when you need to inspect or change an expression.

Generated Mermaid diagrams are being added for 1.0 and are **unreleased**. Explore the [greeting project's diagrams](examples/hello/diagrams/index.md) or follow a larger [login application's APIs](examples/oidc-login/diagrams/index.md). The [compiled-spec guide](specifications.md) explains what each view contains.

Imports, dependency bindings and startup code remain together in `main.aug`. Tests stay beside the implementation, so the behavior and its acceptance cases are close to the code you change.

August infers return types, possible failures, and state changes from executable code. The editor shows those facts as hints. You write them explicitly where an interface needs to constrain its implementations.

Start with [your first project](getting-started.md), then follow [the August book](learn/index.md). Use the [task guides](guides/index.md) for packages, HTTP, tests, and deployment, and the [language reference](reference.md) when you need an exact rule. The [project gallery](examples/index.md) puts code and its actual compiled spec side by side.

## Try the public preview

August 0.23.0 is available now. You need Node.js 24 and macOS 14+ on Apple Silicon or GNU/Linux x86-64/ARM64 with glibc 2.36+. August obtains its native compiler and libraries automatically; you do not install LLVM or Clang.

The language is experimental, with no stable 1.0 compatibility promise yet. Cooperative tasks share a heap; worker tasks can run on multiple cores with isolated heaps. Read [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap to 1.0](roadmap.md) before choosing it for a deployment. Source and issues are on [GitHub](https://github.com/GreenPandaStudios/augscript).

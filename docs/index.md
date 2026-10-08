---
layout: home
hero:
  name: August
  image:
    light: /brand/august-mark.svg
    dark: /brand/august-mark-dark.svg
    alt: August
  text: Understanding at every resolution
  tagline: Code that reads like pseudocode. Compiled explanations and diagrams you can navigate. Native performance you can measure.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: See how the views work
      link: /guides/understand-a-project
features:
  - title: Understand the whole, then the part
    details: Begin with startup and folder data flow. Follow an operation into its decisions, dependencies, results and failures.
  - title: Read it like pseudocode
    details: Calls name their inputs. Modules have narrow exports. The compiler infers repeated contracts and checks them.
  - title: Compile the explanation
    details: aug spec turns the checked program into linked prose and Mermaid diagrams. Regenerate them with every change.
  - title: Run at native speed
    details: LLVM compiles August to native executables. Compare complete programs with C using published sources and measurements.
---

<!--@include: ./.vitepress/home-example.md-->

<!--@include: ./.vitepress/home-diagram.md-->

## Understand a large codebase without reading every file

The world runs on language. August makes the program explain itself at the level you need: the project, a folder, an operation, or an individual decision.

Start with the generated overview to see startup and the data that crosses folder boundaries. Open a folder to find its public surface. Follow a sequence to see when an operation calls its dependencies, returns, fails, or cleans up. Read the neighboring specification for the full behavior in sentences. The exact call contract and source stay one link away.

This is the normal reading path for both developers and coding agents. It lets you review a change, locate a dependency, or understand a failure without opening every implementation. When you need to change an expression, the explanation links to that part of the source.

All these views come from the checked program. The explanation describes what the implementation does; your requirements and tests establish whether that behavior is right. Native implementations and runtime interface choices remain visible boundaries.

The diagram views and expanded reading workflow are being prepared for 1.0 and are **unreleased**. Try the [greeting project's overview](examples/hello/diagrams/index.md), then explore the larger [login application](examples/oidc-login/diagrams/index.md). [Understand a project](guides/understand-a-project.md) shows how to move between the views.

<!--@include: ./.vitepress/home-performance.md-->

## Try the public preview

August 0.23.0 is available now. You need Node.js 24 and macOS 14+ on Apple Silicon or GNU/Linux x86-64/ARM64 with glibc 2.36+. August obtains its native compiler and libraries automatically; you do not install LLVM or Clang.

Start with [your first project](getting-started.md), then follow [the August book](learn/index.md). The [project gallery](examples/index.md) shows formatted code beside its actual compiled spec. Use the [task guides](guides/index.md) for packages, HTTP, tests, and deployment.

The language is experimental, with no stable 1.0 compatibility promise yet. Read [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap to 1.0](roadmap.md) before choosing it for a deployment. Source and issues are on [GitHub](https://github.com/GreenPandaStudios/augscript).

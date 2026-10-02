---
layout: home
hero:
  name: August
  text: The world runs on language
  tagline: Code that reads like pseudocode. A human-readable spec compiled from it. Native performance you can measure against C.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Explore the language
      link: /learn/
features:
  - title: Read it like pseudocode
    details: Calls name their inputs. Imports and declaration headers show which dependencies the code uses.
  - title: Compile a human-readable spec
    details: Run aug spec to explain a module in sentences and link to its dependencies. Review the explanation with the code.
  - title: Run at native speed
    details: Compile to a native executable. The programs below compare August with C doing the same work.
---

<!--@include: ./.vitepress/home-example.md-->

## Build code other people can understand

Start an unfamiliar project at `main.aug`: its imports, dependency bindings, and startup code show how the application is assembled. Read a module's compiled spec to follow its behavior and open the linked dependencies when you need them. Tests stay beside the implementation, so you can check the change in the same file.

August infers return types, possible failures, and state changes from executable code. The editor shows those facts as hints. You write them explicitly where an interface needs to constrain its implementations.

Start with [your first project](getting-started.md), then follow [the August book](learn/index.md). Use the [task guides](guides/index.md) for packages, HTTP, tests, and deployment, and the [language reference](reference.md) when you need an exact rule. The [project gallery](examples/index.md) puts code and its actual compiled spec side by side.

## Try the public preview

August 0.21.0 is available now. You need Node.js 24 and macOS 14+ on Apple Silicon or GNU/Linux x86-64/ARM64 with glibc 2.36+. August obtains its native compiler and libraries automatically; you do not install LLVM or Clang.

The language is experimental, with no stable 1.0 compatibility promise yet. Tasks run cooperatively on one OS thread. Read [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap to 1.0](roadmap.md) before choosing it for a deployment. Source and issues are on [GitHub](https://github.com/GreenPandaStudios/augscript).

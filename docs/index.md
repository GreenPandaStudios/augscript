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
    details: Named inputs, ordinary words, and small public modules make the work visible where you read it.
  - title: Compile a human-readable spec
    details: Turn checked source into linked prose. Review the behavior before a change and the explanation after it.
  - title: Run at native speed
    details: Build a native executable. Compare real August and C programs below, then measure the work your application does.
---

<!--@include: ./.vitepress/home-example.md-->

## Build code other people can understand

August is designed for developers working with teammates and coding agents. Calls name their inputs. Modules export only their chosen public surface. Dependencies appear in declaration headers; state changes and possible failures are checked. Tests live beside the code they describe.

You write the implementation. The compiler infers what it can, and the editor shows those facts without adding boilerplate to your source. The compiled spec gives a reader another way into the same program: what it accepts, what it does, what it changes, and where its dependencies are explained.

Start with [your first project](getting-started.md), then follow [the August book](learn/index.md). Use the [task guides](guides/index.md) for packages, HTTP, tests, and deployment, and the [language reference](reference.md) when you need an exact rule. The [project gallery](examples/index.md) puts code and its actual compiled spec side by side.

## Try the public preview

August 0.21.0 is available now. You need Node.js 24 and macOS 14+ on Apple Silicon or GNU/Linux x86-64/ARM64 with glibc 2.36+. August obtains its native compiler and libraries automatically; you do not install LLVM or Clang.

The language is experimental, with no stable 1.0 compatibility promise yet. Tasks run cooperatively on one OS thread. Read [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap to 1.0](roadmap.md) before choosing it for a deployment. Source and issues are on [GitHub](https://github.com/GreenPandaStudios/augscript).

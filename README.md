# AugScript

**The world runs on language.**

AugScript is an experimental, statically checked language for developers working with LLMs. Its tenets are **simplicity** and **developer scalability**: a module should explain its dependencies, state changes, errors, and public behavior in the code itself.

August reads like pseudocode, compiles a human-readable specification, and runs as a native executable. The [homepage](https://greenpandastudios.github.io/augscript/) shows the same program as source and compiled prose beside a measured C comparison. The TypeScript compiler lowers checked August through LLVM. This repository includes the compiler, managed runtime, CLI, standard capabilities, examples, tests, documentation, Docker image recipes, and VS Code extension. Public exports, labeled inputs, checked errors, same-file tests, and generated specifications keep behavior close to the code that implements it.

## Start a project

Install the CLI once, then create and run an application:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init hello-august
cd hello-august
aug run
```

Requires Node.js 24+ and npm on macOS 14+ ARM64 or GNU/Linux x64/ARM64 with glibc 2.36+. `aug run` downloads its verified LLVM/runtime pack, prepares declared packages, compiles the project, and starts it. Consumers do not install Clang, LLVM, or an SDK. The starter refuses to overwrite a nonempty directory. [Your first project](https://greenpandastudios.github.io/augscript/getting-started) walks through running, testing, and explaining it. See [the August book](docs/learn/index.md), [downloadable example projects](docs/examples/index.md) with code beside compiled specs, and [native packages](docs/native-packages.md).

August 0.23.0 is available through npm's `next` tag and [GitHub Releases](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.23.0). See [implementation status](docs/native-implementation.md) for qualification evidence.

## The language

```aug project=readme file=main.aug
import Counter from counter

counter = Counter(initial=3)
borrow counter:
    counter.increment()
print(value=counter.value())
```

```aug project=readme file=counter.aug
interface Count:
    increment() changes self
    value() returns int

Counter(mutable int initial to _count) implements Count:
    increment() changes self:
        _count = _count + 1
    value() returns int:
        return _count
```

Braces and colon-led indentation are both supported. Indentation can use tabs or spaces; ambiguous mixing is rejected. Semicolons are optional. Constructor and function inputs use labels, so their order does not matter. Classes implement interfaces; immutable records need no marker interface.

Interface contracts describe capability effects with `uses`; implementations and private helpers can infer those effects. Executable bodies infer mutation; bodyless interfaces state the permitted `changes`. I/O receives a capability through the header. Managed inputs grant reading; mutation needs exclusive access. Dependency bindings and startup live in `main.aug`; helper bodies cannot look up hidden services.

## Guides

Start with [the August book](docs/learn/index.md) for checked, runnable lessons. Use [task guides](docs/guides/index.md) to test a project, build a service, create a package, or [review an unfamiliar module](docs/guides/change-a-module.md). [Complete projects](docs/examples/index.md) show source and compiled specs together in indentation or braces style.

[Deploy with Docker](docs/docker.md) or [develop in a VS Code Dev Container](docs/dev-containers.md) using the published CLI and prepared native libraries.

Look up exact rules in the [language reference](docs/reference.md), [grammar](docs/grammar.md), and [CLI/editor reference](docs/tooling.md). Read [why August exists](docs/about.md), [performance evidence](docs/performance.md), [readiness](docs/production-readiness.md), and the [1.0 roadmap](docs/roadmap.md) when assessing it for a project. Contributors can use [the release process](docs/releasing.md) and [documentation maintenance](docs/maintaining-docs.md).

All `aug` code fences in the guides identify a complete project and file. The documentation test assembles and checks them with the compiler; selected examples also run and execute their tests.

## Develop

```sh
npm ci
npm run check
npm test
npm run docs:check
npm run docs:build
npm run package:packages
npm run test:packages
npm run package:extension
code --install-extension vscode/augscript-0.21.0.vsix --force
```

Development dependency versions are pinned in both manifests and lockfiles. The extension bundles the same compiler, runtime, guides and native bootstrap. Native commands prepare required libraries automatically; contributors can prewarm all dependencies with `node scripts/bootstrap-native.mjs`. Set `augscript.nativeHome` to this repository's `.aug-native` directory to share it with the bundled compiler.

August is experimental. Tasks currently run on one OS thread, and some ownership and resource-lifetime cases remain incomplete. Developers can create and import source packages with public exports and frozen dependency locks. The [production readiness review](docs/production-readiness.md), [roadmap](docs/roadmap.md), and [gap ledger](docs/web-library-gaps.md) state current limits and release gates.

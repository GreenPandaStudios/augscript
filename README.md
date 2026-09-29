# AugScript

AugScript is an experimental, statically checked language for developers working with LLMs. Its tenets are **simplicity** and **developer scalability**: a module should explain its dependencies, state changes, errors, and public behavior in the code itself.

The TypeScript compiler emits C11 and builds a native executable. This repository includes the compiler, managed runtime, CLI, standard capabilities, examples, tests, documentation, Docker image recipes, and VS Code extension. Public exports, labeled inputs, checked errors, same-file tests, and generated specifications keep behavior close to the code that implements it.

## Start a project

Requires Node.js 24+ and a C11 compiler. The CLI finds Xcode's Clang and SDK on macOS; set `CC` to select another compiler. From a checkout:

```sh
npm ci
node scripts/bootstrap-native.mjs --extract-only --only minicoro,yyjson
node bin/aug.mjs init hello-august
node bin/aug.mjs check hello-august
node bin/aug.mjs test hello-august
node bin/aug.mjs run hello-august
node bin/aug.mjs spec hello-august
```

The starter refuses to overwrite a nonempty directory. The npm package adds `npx @greenpandastudios/aug-cli@next init hello-august` once the owner publishes it. See the [step-by-step getting-started guide](docs/getting-started.md), [complete example projects](docs/examples/index.md) with code beside compiled specs, and [packages](docs/packages.md) for current installation options.

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

Ordinary callables are pure. Mutations declare `changes`; I/O declares `uses` and receives a capability through the header. Managed inputs grant reading; mutation needs exclusive access. Dependency bindings and startup live in `main.aug`; helper bodies cannot look up hidden services.

## Guides

- [Language wiki](docs/index.md), [getting started](docs/getting-started.md), [packages and installation](docs/packages.md), and [release process](docs/releasing.md).
- [Language reference](docs/reference.md): syntax, effects, ownership, DI, modules, collections, interceptors, and errors.
- [Grammar and line boundaries](docs/grammar.md).
- [Built-in testing](docs/testing.md): same-file class/function suites, rows, fixtures, filtering, and coverage.
- [Web and crypto](docs/web.md): first-party endpoints, policies, streaming, components/actions, scoped tasks, OpenAPI and endpoint tests.
- [Same-app OpenID Connect login](examples/oidc-login/README.md) and the [library gap ledger](docs/web-library-gaps.md).
- [Diagnostics and fixes](docs/diagnostics.md).
- [Native build, debugging, benchmarks, and configuration](docs/tooling.md).
- [Performance graphs and production assessment](docs/performance.md): C, Node and Python comparisons, memory, HTTP throughput, and reproduction commands.
- [Production readiness and dependency licenses](docs/production-readiness.md), [roadmap to 1.0.0](docs/roadmap.md), and [Docker build/run images](docs/docker.md).
- [Delivered design changes](docs/implementation-map.md) and the [original design audit](docs/language-design-audit.md).
- [VS Code extension](vscode/README.md): completion, hover help, navigation, formatting, tests, and debugging.

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
code --install-extension vscode/augscript-0.19.0.vsix --force
```

Development dependency versions are pinned in both manifests and lockfiles. The extension bundles the same compiler, runtime, guides and native bootstrap. Run `node scripts/bootstrap-native.mjs` for web/crypto examples; the extraction-only command above fetches the portable task/JSON sources. Set `augscript.nativeHome` to this repository's `.aug-native` directory to share it with the bundled compiler.

August is experimental. Tasks currently run on one OS thread, and some ownership and resource-lifetime cases remain incomplete. Developers can create and import source packages with public exports and frozen dependency locks. The [production readiness review](docs/production-readiness.md), [roadmap](docs/roadmap.md), and [gap ledger](docs/web-library-gaps.md) state current limits and release gates.

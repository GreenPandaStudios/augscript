---
layout: home
hero:
  name: August
  text: The world runs on language
  tagline: A statically checked language for developers working with LLMs. Readable modules, clear dependencies, explicit effects, native C output.
  actions:
    - theme: brand
      text: Build your first project
      link: /getting-started
    - theme: alt
      text: Install and try it
      link: /packages
    - theme: alt
      text: Build a web service
      link: /web
    - theme: alt
      text: Browse real projects
      link: /examples/
    - theme: alt
      text: See performance graphs
      link: /performance
features:
  - title: Understand a module in context
    details: Public exports, labeled inputs, same-file tests, and source comments tell a new reader what the code promises.
  - title: See dependencies and side effects
    details: Interface contracts, resolve parameters, and changes clauses keep behavior visible at the module boundary. Implementation effects are inferred and explained in hover and specs.
  - title: Build native applications
    details: The CLI checks August, emits C11, and invokes the C compiler. First-party HTTP endpoints use narrow native library adapters.
---

## Documentation for the code you run

These pages are versioned with the compiler. Guide projects are compiled and tested in CI. Library API pages and language construct help are generated from the same declarations and comments that supply editor hover. [Compiled specifications](specifications.md) explain each source file beside its code, including private behavior and links to offline dependency docs.

Start with [getting started](getting-started.md) to create, check, test, run, and explain a new project. [Browse complete projects](examples/index.md) with a choice of indentation or braces and compiled specifications beside the code. The [same-app OpenID Connect example](examples/oidc-login/index.md) demonstrates a login page, provider, client, and separate session JWT.

## Why August

A developer opening an unfamiliar file should see what it provides, what it imports, which inputs each call takes, what it can change, and which errors it can raise. August puts tests beside declarations and generates a readable specification from checked code. Folder exports form a deliberate public boundary. These choices help people and code assistants work within small, explainable modules.

## Performance and readiness

August emits C11 and builds native executables. In the [published benchmark suite](performance.md), the CPU loop took 7.24 ms in August and 8.17 ms in C on the measured host; a 200,000-item Map/Set workload took 15.10 ms in August and 6.38 ms in C. The HTTP result depends on load; at 16 clients the measured August server handled 73,370 requests per second, while at other client counts the comparison changes. See the graphs, code, inputs, hardware, and reproduction commands before drawing conclusions.

August is experimental. [Production readiness](production-readiness.md) identifies platform, licensing, security, and reliability gates. The [roadmap to 1.0.0](roadmap.md) and [gap ledger](web-library-gaps.md) show the work still required. See [packages](packages.md) for installation and the [Docker images](docker.md) for Linux core, web, and crypto applications.

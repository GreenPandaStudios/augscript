---
layout: home
hero:
  name: August
  text: Code that explains itself.
  tagline: A statically checked language for developers working with LLMs. Readable modules, clear dependencies, explicit effects, native C output.
  actions:
    - theme: brand
      text: Learn the language
      link: /reference
    - theme: alt
      text: Install and try it
      link: /packages
    - theme: alt
      text: Build a web service
      link: /web
features:
  - title: Understand a module in context
    details: Public exports, labeled inputs, same-file tests, and source comments tell a new reader what the code promises.
  - title: See dependencies and side effects
    details: Explicit capabilities, resolve parameters, uses and changes contracts keep behavior visible at the module boundary.
  - title: Build native applications
    details: The CLI checks August, emits C11, and invokes the C compiler. First-party HTTP endpoints use narrow native library adapters.
---

## Documentation for the code you run

These pages are versioned with the compiler. Guide projects are compiled and tested in CI. Library API pages and language construct help are generated from the same declarations and comments that supply editor hover.

Start with the [language guide](reference.md), [built-in testing](testing.md), or [HTTP endpoints](web.md). The [same-app OpenID Connect example](https://github.com/GreenPandaStudios/augscript/tree/main/examples/oidc-login) demonstrates a login page, provider, client, and separate session JWT.

August is experimental. The [gap ledger](web-library-gaps.md) records verified limits and remaining work. See [packages](packages.md) for installation and platform support.

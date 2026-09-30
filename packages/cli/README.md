# August CLI

`@greenpandastudios/aug-cli` installs `aug` and `aug-cli` (compiler, project starter, native builds, tests and language server) and `aug-native` (explicit native dependency bootstrap).

Requires Node.js 24+ and a C11 compiler. The CLI installs matching standard, web and crypto packages. Source imports remain `august.io`, `august.web`, and `august.crypto`.

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init my-app
cd my-app
aug run
```

The starter refuses a nonempty directory. It includes `main.aug`, an interface and implementation with a same-file test, and a README. Follow [Your first project](https://greenpandastudios.github.io/augscript/getting-started) to check, run, test, and generate a specification.

Early npm releases use `@next`; pin an exact version for reproducible projects. `aug run` installs packages declared in `main.yaml`, checks and compiles the application, and starts it. Native commands prepare only their required pinned libraries and reuse the cache. `aug run --offline` uses cached dependencies. Web/crypto native builds target macOS and Linux. `aug-native` remains available to prewarm a cache explicitly. A system C compiler and build tools remain prerequisites; errors explain what is missing.

See [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md), [the language wiki](https://GreenPandaStudios.github.io/augscript/) and [the repository](https://github.com/GreenPandaStudios/augscript). Guides and examples are included in this package.

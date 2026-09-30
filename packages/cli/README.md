# August CLI

`@greenpandastudios/aug-cli` installs `aug` and `aug-cli` (compiler, project starter, native builds, tests and language server) and `aug-native` (explicit native dependency bootstrap).

Requires Node.js 24+ and a C11 compiler. The CLI installs matching standard, web and crypto packages. Source imports remain `august.io`, `august.web`, and `august.crypto`.

```sh
npx @greenpandastudios/aug-cli@next init my-app
```

The published starter refuses a nonempty directory. It includes `main.aug`, an interface and implementation with a same-file test, and a README. Follow [Your first project](https://greenpandastudios.github.io/augscript/getting-started) to check, run, test, and generate a specification through `npx`.

Early npm releases use `@next`; pin an exact version for reproducible projects. Web/crypto native builds target macOS and Linux. Native dependencies are prepared explicitly with `npx --package=@greenpandastudios/aug-cli@next aug-native`; ordinary programs need only its `--extract-only --only minicoro,yyjson` source set.

See [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md), [the language wiki](https://GreenPandaStudios.github.io/augscript/) and [the repository](https://github.com/GreenPandaStudios/augscript). Guides and examples are included in this package.

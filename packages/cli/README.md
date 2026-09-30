# August CLI

`@greenpandastudios/aug-cli` installs `aug` and `aug-cli` (compiler, project starter, native builds, tests and language server) and `aug-native` (explicit native dependency bootstrap).

Requires Node.js 24+ and a C11 compiler. The CLI installs matching standard, web and crypto packages. Source imports remain `august.io`, `august.web`, and `august.crypto`.

```sh
npx @greenpandastudios/aug-cli@next init hello-august
```

The starter refuses a nonempty directory. It includes `main.aug`, an interface and implementation with a same-file test, and a README. Early npm releases use `@next`; publication status is tracked in the installation guide. Native builds support macOS and Linux.

See [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md), [the language wiki](https://GreenPandaStudios.github.io/augscript/) and [the repository](https://github.com/GreenPandaStudios/augscript). Guides and examples are included in this package.

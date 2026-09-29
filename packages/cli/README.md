# August CLI

`@greenpandastudios/aug-cli` installs `aug` (compiler, native builds, tests and language server) and `aug-native` (explicit native dependency bootstrap).

Requires Node.js 24+ and a C11 compiler. The CLI installs matching standard, web and crypto packages. Source imports remain `august.io`, `august.web`, and `august.crypto`.

```sh
aug --version
aug check path/to/project
aug run path/to/project
aug test path/to/project
aug-native
```

Early npm releases use `@next`. GitHub release tarballs can be installed together without registry publication. Web/crypto native builds currently target macOS; the full suite is verified on Apple silicon.

See [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md), [the language wiki](https://GreenPandaStudios.github.io/augscript/) and [the repository](https://github.com/GreenPandaStudios/augscript). Guides and examples are included in this package.

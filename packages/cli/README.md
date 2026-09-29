# August CLI

`@greenpandastudios/aug-cli` installs `aug` and `aug-cli` (compiler, project starter, native builds, tests and language server) and `aug-native` (explicit native dependency bootstrap).

Requires Node.js 24+ and a C11 compiler. The CLI installs matching standard, web and crypto packages. Source imports remain `august.io`, `august.web`, and `august.crypto`.

```sh
aug init my-app
aug --version
aug check path/to/project
aug run path/to/project
aug test path/to/project
aug-native
```

Once published, `npx @greenpandastudios/aug-cli@next init my-app` creates the same starter without a global CLI install. It refuses a nonempty directory. The starter includes `main.aug`, an interface and implementation with a same-file test, and a README.

Early npm releases use `@next`. GitHub release tarballs can be installed together without registry publication. Web/crypto native builds currently target macOS; the full suite is verified on Apple silicon.

See [installation](https://github.com/GreenPandaStudios/augscript/blob/main/docs/packages.md), [the language wiki](https://GreenPandaStudios.github.io/augscript/) and [the repository](https://github.com/GreenPandaStudios/augscript). Guides and examples are included in this package.

# Native dependency sources

August's compiler/runtime code is MIT licensed. Consumers obtain verified native compiler/runtime packs automatically through `aug run`. Maintainers build pinned dependencies with `aug-native` or `scripts/bootstrap-native.mjs`. The source/npm/VSIX artifacts include August runtime sources and the derived Unicode tables and notice; other native archives and binaries are retained in the separate compiler/runtime packs. Versions and archive checksums are pinned in `scripts/native-dependencies.lock.json`.

| Dependency | Official source and license information |
| --- | --- |
| CMake | [Kitware CMake](https://github.com/Kitware/CMake), `Copyright.txt` |
| GMP | [GNU GMP](https://gmplib.org/manual/Copying), LGPL 3 or later or GPL 2 or later; `COPYING` and `COPYING.LESSERv3` in its source archive |
| Nettle | [GNU Nettle](https://www.lysator.liu.se/~nisse/nettle/), LGPL 3 or later or GPL 2 or later; source archive license files |
| GnuTLS | [GnuTLS](https://www.gnutls.org/), LGPL 2.1 or later core; `COPYING` and `COPYING.LESSERv2` in its source archive |
| libtasn1, included by GnuTLS build | [GNU libtasn1](https://www.gnu.org/software/libtasn1/), LGPL 2.1 or later; inspect bundled source license files |
| libunistring, included by GnuTLS build | [GNU libunistring](https://www.gnu.org/software/libunistring/manual/html_node/Licenses.html), LGPL 3 or later or GPL 2 or later; inspect bundled source license files |
| libwebsockets | [libwebsockets](https://github.com/warmcat/libwebsockets/blob/main/LICENSE), MIT core with additional notices for selected bundled files; `LICENSE` |
| yyjson | [yyjson](https://github.com/ibireme/yyjson/blob/master/LICENSE), MIT |
| minicoro | [minicoro](https://github.com/edubart/minicoro/blob/main/LICENSE), public domain or MIT No Attribution |
| Unicode grapheme data | [Unicode 18.0.0 data](https://www.unicode.org/Public/18.0.0/ucd/) and [Unicode License V3](https://www.unicode.org/license.txt); complete notice in `runtime/UNICODE-LICENSE.txt` and the generated table. Runtime packs and deployed applications retain `licenses/Unicode.txt`. |
| zlib | Host system library; [zlib](https://zlib.net/zlib_license.html) |

Applications built using web/crypto link native libraries from the selected dependency prefix. Redistributors of compiled applications must preserve the notices and satisfy the licenses of the libraries they include. Compiler/runtime packs retain native notices and corresponding component sources. LLVM application bundles retain their selected native dependency closure, sources and notices under `share/august-native/`.

## JavaScript archive dependencies

The CLI depends on `tar` 7.5.22; the VS Code bundle includes it and its runtime dependencies (`chownr`, `yallist`, `minipass`, `minizlib`, and `@isaacs/fs-minipass`). Their package license files are retained in the extension. Exact versions and license declarations are recorded in `package-lock.json`. See the upstream [node-tar source](https://github.com/isaacs/node-tar) for archive behavior and security reports. Native library terms above are separate from these JavaScript packages.

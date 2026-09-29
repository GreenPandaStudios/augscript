# Native dependency sources

August's compiler/runtime code is MIT licensed. Native dependencies are downloaded explicitly by `aug-native` or `scripts/bootstrap-native.mjs`; their source archives, headers and binaries are not included in these source/npm/VSIX artifacts. Versions and archive checksums are pinned in `scripts/native-dependencies.lock.json`.

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
| zlib | Host system library; [zlib](https://zlib.net/zlib_license.html) |

Applications built using web/crypto link native libraries from the selected dependency prefix. Redistributors of compiled applications must preserve the notices and satisfy the licenses of the libraries they include. The release process currently distributes compiler/library source packages and VSIX rather than prebuilt native dependency bundles.

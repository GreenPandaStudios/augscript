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
| zlib | macOS system library or bundled Debian 12 zlib 1.2.13 on GNU/Linux; [zlib license](https://zlib.net/zlib_license.html), retained Debian copyright and exact source/package inputs |
| GCC runtime libraries | Bundled GNU/Linux GCC 12.2 runtime libraries; [GCC Runtime Library Exception](https://www.gnu.org/licenses/gcc-exception-3.1.html), GPL/LGPL texts, Debian copyright and original source/package inputs. The C++ runtime includes the retained aligned-allocation overflow backport and maintainer recipe. |
| ICU, compiler tools only | Bundled ICU 70.1 in the GNU/Linux LLVM tool closure; [ICU licensing](https://unicode-org.github.io/icu/userguide/icu/design.html#licensing), retained upstream source and Ubuntu package/copyright inputs |
| XZ/liblzma, compiler tools only | Bundled Debian liblzma 5.4.1 in the GNU/Linux LLVM tool closure; [XZ copying information](https://tukaani.org/xz/), retained upstream source and Debian package/copyright inputs |

Applications built using web/crypto link native libraries from the selected dependency prefix. Redistributors of compiled applications must preserve the notices and satisfy the licenses of the libraries they include. Compiler/runtime packs retain native notices and corresponding component sources. LLVM application bundles retain their selected native dependency closure, sources and notices under `share/august-native/`. Compiler-only ICU and liblzma remain in the compiler pack; they are not deployed merely because an application uses LLVM. GNU runtime libraries remain replaceable dynamic files. Package provenance records exact shipped member hashes separately from retained input materials.

## JavaScript archive dependencies

The CLI depends on `tar` 7.5.22 and `minizlib` 3.1.0; the VS Code bundle includes it and its runtime dependencies (`chownr`, `yallist`, `minipass`, `minizlib`, and `@isaacs/fs-minipass`). Their package license files are retained in the extension. Exact versions and license declarations are recorded in `package-lock.json`. See the upstream [node-tar source](https://github.com/isaacs/node-tar) for archive behavior and security reports. Native library terms above are separate from these JavaScript packages.

## Documentation website

The hosted wiki and offline documentation retain complete installed-package license texts under `third-party/`, with source archive identities in `manifest.json`. This conservative documentation-build inventory also includes build-only packages. `docs/licenses.md` explains its scope. VitePress's Inter 4.000 subsets retain the SIL Open Font License 1.1 and exact font provenance. Mermaid's ELKJS dependency retains EPL-2.0 and upstream source/build references; these references do not establish a complete embedded-code SBOM.

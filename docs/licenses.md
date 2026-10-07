# Licenses

August's source code and documentation use the [MIT license](https://github.com/GreenPandaStudios/augscript/blob/main/LICENSE). The wiki also uses third-party JavaScript and Inter fonts. Their [full license texts](third-party/NOTICE.txt), [font license](third-party/Inter-OFL-1.1.txt), and [exact input inventory](third-party/manifest.json) accompany the hosted site and offline documentation.

The inventory records installed packages from the documentation build, including tools and packages whose code is not sent to your browser. It identifies versions, source archives, integrity values, and retained notice files. It is not a complete inventory of code embedded within upstream packages. One optional native Rollup build helper has no standalone license text in its archive or source repository; its exact metadata and source location are recorded separately. It is not distributed with the wiki, and the build rejects it in emitted JavaScript module graphs. Inter's separate provenance record identifies the original font source and the hashes of VitePress's font subsets.

The diagram renderer includes ELKJS under the Eclipse Public License 2.0. Its [source and build instructions](https://github.com/kieler/elkjs/tree/0.9.3) are available under that license. The [upstream release](https://github.com/kieler/elkjs/releases/tag/0.9.3) describes the Eclipse Layout Kernel baseline and additional changes used for that version.

Native compiler packs and application libraries have separate license requirements. Their selected archives retain notices and corresponding source materials. Keep the `share` directory when deploying an August application; see [native packages](native-packages.md) and [Docker deployment](docker.md).

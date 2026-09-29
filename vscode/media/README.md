# Extension artwork

`augscript.svg` is the editable August logo. `banner.svg` is the extension header;
the renderer inserts that same logo. The file legend uses the actual SVGs in
`../icons`, including the special startup and export marks.

After editing the vector sources, render and commit the PNGs:

```sh
npm --prefix vscode ci
npm --prefix vscode run artwork
```

The PNG logo is used in the Extensions view. The README uses PNGs because VS Code
Marketplace does not allow custom SVG images there. Explorer and language icons
remain SVG so they stay sharp at every display scale. The legend is an artwork
preview, not an editor screenshot.

`welcome.md` is the local illustrated overview, opened through **AugScript: Open
Welcome**. It loads bundled images without network access. The Extensions
details README requires hosted HTTPS images; packaging supplies the repository's
`vscode` directory as its image base. Marketplace publication needs that same
base URL and a publicly accessible image host.

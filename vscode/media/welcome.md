# Welcome to August

![August — readable code, clear dependencies](banner.png)

The extension includes the compiler, language wiki, standard libraries and
editor tools. This page and its images are bundled and can be viewed offline.

## Recognize a file's role

![August source, startup, exports, and configuration icons](file-icons.png)

Run **AugScript: Enable File Icons** from the Command Palette to select the
theme in this workspace. You can also select **AugScript Icons** from
**Preferences: File Icon Theme**. Startup, exports, and configuration each have
a distinct mark. The August repository and login example select this theme
already.

## Start writing

Open a `.aug` file for colors, completion, Javadoc hover help, suggested fixes,
formatting, and Cmd-click/Ctrl-click navigation. Use **AugScript: Build Project**,
**Run Project**, or **Test Project** to work with the application. Hover a keyword
to discover its contract.

Use **AugScript: Open Compiled Specification** to read the current file's complete
behavior as Markdown. The compiler includes private helpers and tests, and links
to explanations of the dependency surfaces it uses.

## Bundled guides

- [Language reference](../compiler/docs/reference.md)
- [Compiled specifications](../compiler/docs/specifications.md)
- [Testing](../compiler/docs/testing.md)
- [Web and crypto](../compiler/docs/web.md)
- [Native setup and editor tooling](../compiler/docs/tooling.md)
- [Create and use packages](../compiler/docs/packages.md)
- [Performance graphs and benchmark commands](../compiler/docs/performance.md)
- [Standard I/O API](../compiler/docs/api/io.md)
- [Web API](../compiler/docs/api/web.md)
- [Crypto API](../compiler/docs/api/crypto.md)

After installing a new VSIX, use **Developer: Reload Window** if VS Code still
displays the earlier extension version.

---
title: "august/0.21.0/io/contracts.aug · A small tested application"
generated: true
source: "examples/developer-workflow/.aug-spec/august/0.21.0/io/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.21.0/io/contracts.aug`

[A small tested application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Permission to write to a console, provided by an explicitly selected adapter. */
capability Console:
    /** Write one line of text. @param value Text to display. */
    write<T>(T value) uses Console.write
/** The native standard-output adapter. Construction performs no output. */
SystemConsole() implements Console:
    write<T>(T value):
        print(value=value)
/** Read UTF-8 text through an explicitly selected filesystem adapter. */
capability FileReader:
    /** Read text. @param path File path. @throws FileError The file could not be read. */
    read(string path) returns string uses FileReader.read unless FileError
/** Write UTF-8 text through an explicitly selected filesystem adapter. */
capability FileWriter:
    /** Write text. @param path File path. @param content Text. @throws FileError Writing failed. */
    write(string path, string content) uses FileWriter.write unless FileError
/** Native filesystem adapter. Construction opens no files. */
LocalFiles() implements FileReader, FileWriter:
    read(string path):
        return read_file(path=path)
    write(string path, string content):
        write_file(path=path, content=content)
/** Read command-line input through an explicit dependency. */
capability Arguments:
    read() returns List<string> uses Arguments.read
/** Native command-line arguments. */
ProcessArguments() implements Arguments:
    read():
        return arguments()
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Permission to write to a console, provided by an explicitly selected adapter. */
capability Console {
    /** Write one line of text. @param value Text to display. */
    write<T>(T value) uses Console.write
}
/** The native standard-output adapter. Construction performs no output. */
SystemConsole() implements Console {
    write<T>(T value) {
        print(value=value)
    }
}
/** Read UTF-8 text through an explicitly selected filesystem adapter. */
capability FileReader {
    /** Read text. @param path File path. @throws FileError The file could not be read. */
    read(string path) returns string uses FileReader.read unless FileError
}
/** Write UTF-8 text through an explicitly selected filesystem adapter. */
capability FileWriter {
    /** Write text. @param path File path. @param content Text. @throws FileError Writing failed. */
    write(string path, string content) uses FileWriter.write unless FileError
}
/** Native filesystem adapter. Construction opens no files. */
LocalFiles() implements FileReader, FileWriter {
    read(string path) {
        return read_file(path=path)
    }
    write(string path, string content) {
        write_file(path=path, content=content)
    }
}
/** Read command-line input through an explicit dependency. */
capability Arguments {
    read() returns List<string> uses Arguments.read
}
/** Native command-line arguments. */
ProcessArguments() implements Arguments {
    read() {
        return arguments()
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Console` · capability interface · [source](contracts.md#code) {#symbol-Console}

Permission to write to a console, provided by an explicitly selected adapter.

#### `Console.write` · [source](contracts.md#code) {#symbol-Console.write}

Write one line of text. The type parameters are `T`. It takes `value` as `T` (Text to display). It can call [`Console.write`](contracts.md#symbol-Console.write).

### `SystemConsole` · class · [source](contracts.md#code) {#symbol-SystemConsole}

The native standard-output adapter. Construction performs no output. It implements [`Console`](contracts.md#symbol-Console).

#### `SystemConsole.write` · [source](contracts.md#code) {#symbol-SystemConsole.write}

Write one line of text. The type parameters are `T`. It takes `value` as `T` (Text to display). It prints `value`.

### `FileReader` · capability interface · [source](contracts.md#code) {#symbol-FileReader}

Read UTF-8 text through an explicitly selected filesystem adapter.

#### `FileReader.read` · [source](contracts.md#code) {#symbol-FileReader.read}

Read text. It takes `path` as a string (File path).

It returns `string`. It can call [`FileReader.read`](contracts.md#symbol-FileReader.read). Failures can raise `FileError` (The file could not be read).

### `FileWriter` · capability interface · [source](contracts.md#code) {#symbol-FileWriter}

Write UTF-8 text through an explicitly selected filesystem adapter.

#### `FileWriter.write` · [source](contracts.md#code) {#symbol-FileWriter.write}

Write text. It takes `path` as a string (File path) and `content` as a string (Text). It can call [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Failures can raise `FileError` (Writing failed).

### `LocalFiles` · class · [source](contracts.md#code) {#symbol-LocalFiles}

Native filesystem adapter. Construction opens no files. It implements [`FileReader`](contracts.md#symbol-FileReader) and [`FileWriter`](contracts.md#symbol-FileWriter).

#### `LocalFiles.read` · [source](contracts.md#code) {#symbol-LocalFiles.read}

Read text. It takes `path` as a string (File path). Failures can raise `FileError` (The file could not be read). It returns `read_file` with `path`.

#### `LocalFiles.write` · [source](contracts.md#code) {#symbol-LocalFiles.write}

Write text. It takes `path` as a string (File path) and `content` as a string (Text). Failures can raise `FileError` (Writing failed). It calls `write_file` with `path` and `content`.

### `Arguments` · capability interface · [source](contracts.md#code) {#symbol-Arguments}

Read command-line input through an explicit dependency.

#### `Arguments.read` · [source](contracts.md#code) {#symbol-Arguments.read}

It returns `List<string>`. It can call [`Arguments.read`](contracts.md#symbol-Arguments.read).

### `ProcessArguments` · class · [source](contracts.md#code) {#symbol-ProcessArguments}

Native command-line arguments. It implements [`Arguments`](contracts.md#symbol-Arguments).

#### `ProcessArguments.read` · [source](contracts.md#code) {#symbol-ProcessArguments.read}

It returns `arguments`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

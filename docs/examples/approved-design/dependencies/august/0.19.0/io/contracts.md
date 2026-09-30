---
title: "august/0.19.0/io/contracts.aug · Modules and composition"
generated: true
source: "examples/approved-design/.aug-spec/august/0.19.0/io/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/io/contracts.aug`

[Modules and composition](../../../../index.md) · Dependency source and specification

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
/** Native files. Operations are explicit; construction opens no files. */
LocalFiles() implements FileReader, FileWriter:
    read(string path) returns string unless FileError:
        return read_file(path=path)
    write(string path, string content) unless FileError:
        write_file(path=path, content=content)
/** Read command-line input through an explicit dependency. */
capability Arguments:
    read() returns List<string> uses Arguments.read
/** Native command-line arguments. */
ProcessArguments() implements Arguments:
    read() returns List<string>:
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
/** Native files. Operations are explicit; construction opens no files. */
LocalFiles() implements FileReader, FileWriter {
    read(string path) returns string unless FileError {
        return read_file(path=path)
    }
    write(string path, string content) unless FileError {
        write_file(path=path, content=content)
    }
}
/** Read command-line input through an explicit dependency. */
capability Arguments {
    read() returns List<string> uses Arguments.read
}
/** Native command-line arguments. */
ProcessArguments() implements Arguments {
    read() returns List<string> {
        return arguments()
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Console"></a>
### `Console` · capability interface · [source](contracts.md#code)

Permission to write to a console, provided by an explicitly selected adapter.

<a id="symbol-Console.write"></a>
#### `Console.write` · [source](contracts.md#code)

Write one line of text. The type parameters are `T`. The caller supplies `value` as `T` (Text to display). It can use [`Console.write`](contracts.md#symbol-Console.write).

<a id="symbol-SystemConsole"></a>
### `SystemConsole` · class · [source](contracts.md#code)

The native standard-output adapter. Construction performs no output. Implements [`Console`](contracts.md#symbol-Console).

<a id="symbol-SystemConsole.write"></a>
#### `SystemConsole.write` · [source](contracts.md#code)

Write one line of text. The type parameters are `T`. The caller supplies `value` as `T` (Text to display). It can use [`Console.write`](contracts.md#symbol-Console.write). It calls `print` (`value`).

<a id="symbol-FileReader"></a>
### `FileReader` · capability interface · [source](contracts.md#code)

Read UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileReader.read"></a>
#### `FileReader.read` · [source](contracts.md#code)

Read text. The caller supplies `path` as `string` (File path). The result is `string`. It can use [`FileReader.read`](contracts.md#symbol-FileReader.read). It can fail with `FileError` (The file could not be read).

<a id="symbol-FileWriter"></a>
### `FileWriter` · capability interface · [source](contracts.md#code)

Write UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileWriter.write"></a>
#### `FileWriter.write` · [source](contracts.md#code)

Write text. The caller supplies `path` as `string` (File path) and `content` as `string` (Text). It can use [`FileWriter.write`](contracts.md#symbol-FileWriter.write). It can fail with `FileError` (Writing failed).

<a id="symbol-LocalFiles"></a>
### `LocalFiles` · class · [source](contracts.md#code)

Native files. Operations are explicit; construction opens no files. Implements [`FileReader`](contracts.md#symbol-FileReader) and [`FileWriter`](contracts.md#symbol-FileWriter).

<a id="symbol-LocalFiles.read"></a>
#### `LocalFiles.read` · [source](contracts.md#code)

Read text. The caller supplies `path` as `string` (File path). The result is `string`. It can use [`FileReader.read`](contracts.md#symbol-FileReader.read). It can fail with `FileError` (The file could not be read). It returns the value from `read_file` (`path`).

<a id="symbol-LocalFiles.write"></a>
#### `LocalFiles.write` · [source](contracts.md#code)

Write text. The caller supplies `path` as `string` (File path) and `content` as `string` (Text). It can use [`FileWriter.write`](contracts.md#symbol-FileWriter.write). It can fail with `FileError` (Writing failed). It calls `write_file` (`path` and `content`).

<a id="symbol-Arguments"></a>
### `Arguments` · capability interface · [source](contracts.md#code)

Read command-line input through an explicit dependency.

<a id="symbol-Arguments.read"></a>
#### `Arguments.read` · [source](contracts.md#code)

The result is `List<string>`. It can use [`Arguments.read`](contracts.md#symbol-Arguments.read).

<a id="symbol-ProcessArguments"></a>
### `ProcessArguments` · class · [source](contracts.md#code)

Native command-line arguments. Implements [`Arguments`](contracts.md#symbol-Arguments).

<a id="symbol-ProcessArguments.read"></a>
#### `ProcessArguments.read` · [source](contracts.md#code)

The result is `List<string>`. It can use [`Arguments.read`](contracts.md#symbol-Arguments.read). It returns the value from `arguments`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`arguments`: Composition arguments. Other callables receive the Arguments capability. `print`: Composition and test output. Other callables receive Console and declare uses console.write. `read_file`: Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError. `write_file`: Root-only UTF-8 text output. Other callables receive FileWriter.

::::

:::::

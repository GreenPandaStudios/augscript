---
title: "august/0.19.0/io/contracts.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/.aug-spec/august/0.19.0/io/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/io/contracts.aug`

[Function and constructor middleware](../../../../index.md) · Dependency source and specification

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

Write one line of text. The type parameters are `T`. It takes `value` as `T` (Text to display). It can call [`Console.write`](contracts.md#symbol-Console.write).

<a id="symbol-SystemConsole"></a>
### `SystemConsole` · class · [source](contracts.md#code)

The native standard-output adapter. Construction performs no output. It implements [`Console`](contracts.md#symbol-Console).

<a id="symbol-SystemConsole.write"></a>
#### `SystemConsole.write` · [source](contracts.md#code)

Write one line of text. The type parameters are `T`. It takes `value` as `T` (Text to display). It prints `value`.

<a id="symbol-FileReader"></a>
### `FileReader` · capability interface · [source](contracts.md#code)

Read UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileReader.read"></a>
#### `FileReader.read` · [source](contracts.md#code)

Read text. It takes `path` as a string (File path).

It returns `string`. It can call [`FileReader.read`](contracts.md#symbol-FileReader.read). Failures can raise `FileError` (The file could not be read).

<a id="symbol-FileWriter"></a>
### `FileWriter` · capability interface · [source](contracts.md#code)

Write UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileWriter.write"></a>
#### `FileWriter.write` · [source](contracts.md#code)

Write text. It takes `path` as a string (File path) and `content` as a string (Text). It can call [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Failures can raise `FileError` (Writing failed).

<a id="symbol-LocalFiles"></a>
### `LocalFiles` · class · [source](contracts.md#code)

Native files. Operations are explicit; construction opens no files. It implements [`FileReader`](contracts.md#symbol-FileReader) and [`FileWriter`](contracts.md#symbol-FileWriter).

<a id="symbol-LocalFiles.read"></a>
#### `LocalFiles.read` · [source](contracts.md#code)

Read text. It takes `path` as a string (File path). Failures can raise `FileError` (The file could not be read). It returns `read_file` with `path`.

<a id="symbol-LocalFiles.write"></a>
#### `LocalFiles.write` · [source](contracts.md#code)

Write text. It takes `path` as a string (File path) and `content` as a string (Text). Failures can raise `FileError` (Writing failed). It calls `write_file` with `path` and `content`.

<a id="symbol-Arguments"></a>
### `Arguments` · capability interface · [source](contracts.md#code)

Read command-line input through an explicit dependency.

<a id="symbol-Arguments.read"></a>
#### `Arguments.read` · [source](contracts.md#code)

It returns `List<string>`. It can call [`Arguments.read`](contracts.md#symbol-Arguments.read).

<a id="symbol-ProcessArguments"></a>
### `ProcessArguments` · class · [source](contracts.md#code)

Native command-line arguments. It implements [`Arguments`](contracts.md#symbol-Arguments).

<a id="symbol-ProcessArguments.read"></a>
#### `ProcessArguments.read` · [source](contracts.md#code)

It returns `arguments`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

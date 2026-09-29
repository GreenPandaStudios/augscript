---
title: "august/0.19.0/io/contracts.aug · A small tested application"
generated: true
source: "examples/developer-workflow/.aug-spec/august/0.19.0/io/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/io/contracts.aug`

[A small tested application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
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

Write one line of text.

Type parameters: `T`.

**Inputs:** Take `value` (`T`) — Text to display.

Uses [`Console.write`](contracts.md#symbol-Console.write).

<a id="symbol-SystemConsole"></a>
### `SystemConsole` · class · [source](contracts.md#code)

The native standard-output adapter. Construction performs no output. Implements [`Console`](contracts.md#symbol-Console).

<a id="symbol-SystemConsole.write"></a>
#### `SystemConsole.write` · [source](contracts.md#code)

Write one line of text.

Type parameters: `T`.

**Inputs:** Take `value` (`T`) — Text to display.

Uses [`Console.write`](contracts.md#symbol-Console.write).

- Call `print` with `value`.

<a id="symbol-FileReader"></a>
### `FileReader` · capability interface · [source](contracts.md#code)

Read UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileReader.read"></a>
#### `FileReader.read` · [source](contracts.md#code)

Read text.

**Inputs:** Take `path` (`string`) — File path.

Returns `string`. Uses [`FileReader.read`](contracts.md#symbol-FileReader.read). Can fail with `FileError` (The file could not be read).

<a id="symbol-FileWriter"></a>
### `FileWriter` · capability interface · [source](contracts.md#code)

Write UTF-8 text through an explicitly selected filesystem adapter.

<a id="symbol-FileWriter.write"></a>
#### `FileWriter.write` · [source](contracts.md#code)

Write text.

**Inputs:** Take `path` (`string`) — File path. Take `content` (`string`) — Text.

Uses [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Can fail with `FileError` (Writing failed).

<a id="symbol-LocalFiles"></a>
### `LocalFiles` · class · [source](contracts.md#code)

Native files. Operations are explicit; construction opens no files. Implements [`FileReader`](contracts.md#symbol-FileReader), [`FileWriter`](contracts.md#symbol-FileWriter).

<a id="symbol-LocalFiles.read"></a>
#### `LocalFiles.read` · [source](contracts.md#code)

Read text.

**Inputs:** Take `path` (`string`) — File path.

Returns `string`. Uses [`FileReader.read`](contracts.md#symbol-FileReader.read). Can fail with `FileError` (The file could not be read).

- Return the result of `read_file` with `path`.

<a id="symbol-LocalFiles.write"></a>
#### `LocalFiles.write` · [source](contracts.md#code)

Write text.

**Inputs:** Take `path` (`string`) — File path. Take `content` (`string`) — Text.

Uses [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Can fail with `FileError` (Writing failed).

- Call `write_file` with `path`, `content`.

<a id="symbol-Arguments"></a>
### `Arguments` · capability interface · [source](contracts.md#code)

Read command-line input through an explicit dependency.

<a id="symbol-Arguments.read"></a>
#### `Arguments.read` · [source](contracts.md#code)

Returns `List<string>`. Uses [`Arguments.read`](contracts.md#symbol-Arguments.read).

<a id="symbol-ProcessArguments"></a>
### `ProcessArguments` · class · [source](contracts.md#code)

Native command-line arguments. Implements [`Arguments`](contracts.md#symbol-Arguments).

<a id="symbol-ProcessArguments.read"></a>
#### `ProcessArguments.read` · [source](contracts.md#code)

Returns `List<string>`. Uses [`Arguments.read`](contracts.md#symbol-Arguments.read).

- Return the result of `arguments`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `arguments`: Composition arguments. Other callables receive the Arguments capability.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.
- `read_file`: Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError.
- `write_file`: Root-only UTF-8 text output. Other callables receive FileWriter.

::::

:::::

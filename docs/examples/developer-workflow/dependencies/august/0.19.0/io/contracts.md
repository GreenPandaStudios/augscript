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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Console`](contracts.md#symbol-Console) is a capability interface.
- [`SystemConsole`](contracts.md#symbol-SystemConsole) is a class implementing `Console`.
- [`FileReader`](contracts.md#symbol-FileReader) is a capability interface.
- [`FileWriter`](contracts.md#symbol-FileWriter) is a capability interface.
- [`LocalFiles`](contracts.md#symbol-LocalFiles) is a class implementing `FileReader`, `FileWriter`.
- [`Arguments`](contracts.md#symbol-Arguments) is a capability interface.
- [`ProcessArguments`](contracts.md#symbol-ProcessArguments) is a class implementing `Arguments`.

### `Console` {#symbol-Console}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Permission to write to a console, provided by an explicitly selected adapter.

#### `Console.write` {#symbol-Console.write}

[source](contracts.md#code)

Type parameters: `T`.

**Inputs**

- `value` (`T`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Write one line of text.

**Parameters**
- `value`: Text to display.

### `SystemConsole` {#symbol-SystemConsole}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Console`](contracts.md#symbol-Console).

**Author documentation**

The native standard-output adapter. Construction performs no output.

#### `SystemConsole.write` {#symbol-SystemConsole.write}

[source](contracts.md#code)

Type parameters: `T`.

**Inputs**

- `value` (`T`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](contracts.md#symbol-Console.write).

**What it does**

- Call `print` with `value` = `value`.

**Author documentation**

Write one line of text.

**Parameters**
- `value`: Text to display.

### `FileReader` {#symbol-FileReader}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Read UTF-8 text through an explicitly selected filesystem adapter.

#### `FileReader.read` {#symbol-FileReader.read}

[source](contracts.md#code)

**Inputs**

- `path` (`string`) — required labeled input.

Returns: `string`.

Capabilities: [`FileReader.read`](contracts.md#symbol-FileReader.read).

Can fail with `FileError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

### `FileWriter` {#symbol-FileWriter}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Write UTF-8 text through an explicitly selected filesystem adapter.

#### `FileWriter.write` {#symbol-FileWriter.write}

[source](contracts.md#code)

**Inputs**

- `path` (`string`) — required labeled input.
- `content` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`FileWriter.write`](contracts.md#symbol-FileWriter.write).

Can fail with `FileError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

### `LocalFiles` {#symbol-LocalFiles}

[source](contracts.md#code)

Behavioral class.

Satisfies [`FileReader`](contracts.md#symbol-FileReader), [`FileWriter`](contracts.md#symbol-FileWriter).

**Author documentation**

Native files. Operations are explicit; construction opens no files.

#### `LocalFiles.read` {#symbol-LocalFiles.read}

[source](contracts.md#code)

**Inputs**

- `path` (`string`) — required labeled input.

Returns: `string`.

Capabilities: [`FileReader.read`](contracts.md#symbol-FileReader.read).

Can fail with `FileError`. Callers must catch or propagate these errors.

**What it does**

- Return call `read_file` with `path` = `path`.

**Author documentation**

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

#### `LocalFiles.write` {#symbol-LocalFiles.write}

[source](contracts.md#code)

**Inputs**

- `path` (`string`) — required labeled input.
- `content` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`FileWriter.write`](contracts.md#symbol-FileWriter.write).

Can fail with `FileError`. Callers must catch or propagate these errors.

**What it does**

- Call `write_file` with `path` = `path`; `content` = `content`.

**Author documentation**

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

### `Arguments` {#symbol-Arguments}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Read command-line input through an explicit dependency.

#### `Arguments.read` {#symbol-Arguments.read}

[source](contracts.md#code)

Returns: `List<string>`.

Capabilities: [`Arguments.read`](contracts.md#symbol-Arguments.read).

Interface contract. A selected implementation supplies the behavior.

### `ProcessArguments` {#symbol-ProcessArguments}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Arguments`](contracts.md#symbol-Arguments).

**Author documentation**

Native command-line arguments.

#### `ProcessArguments.read` {#symbol-ProcessArguments.read}

[source](contracts.md#code)

Returns: `List<string>`.

Capabilities: [`Arguments.read`](contracts.md#symbol-Arguments.read).

**What it does**

- Return call `arguments`.

### Built-in operations used by this file

- `arguments` (no inputs) → `List<string>`: Composition arguments. Other callables receive the Arguments capability.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.
- `read_file` (`path`: `string`) → `string`: Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError. Can fail with `FileError`.
- `write_file` (`path`: `string`, `content`: `string`) → `void`: Root-only UTF-8 text output. Other callables receive FileWriter. Can fail with `FileError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

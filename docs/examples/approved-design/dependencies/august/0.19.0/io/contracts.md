---
title: "august/0.19.0/io/contracts.aug · Modules and composition"
generated: true
source: "examples/approved-design/.aug-spec/august/0.19.0/io/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/io/contracts.aug`

[Modules and composition](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `arguments`

Composition arguments. Other callables receive the Arguments capability.

Result: `List<string>`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `read_file`

Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError.

Inputs: `path`: `string`.

Result: `string`.

Possible failures: `FileError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `write_file`

Root-only UTF-8 text output. Other callables receive FileWriter.

Inputs: `path`: `string`; `content`: `string`.

Result: `void`.

Possible failures: `FileError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `Console` {#symbol-Console}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Permission to write to a console, provided by an explicitly selected adapter.

#### `Console.write` {#symbol-Console.write}

[source](contracts.md#code)

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](contracts.md#symbol-Console.write).

**Author documentation**

Write one line of text.

**Parameters**
- `value`: Text to display.

Interface contract. A selected implementation supplies the behavior.

### `SystemConsole` {#symbol-SystemConsole}

[source](contracts.md#code)

Behavioral class.

Satisfies [`Console`](contracts.md#symbol-Console).

**Author documentation**

The native standard-output adapter. Construction performs no output.

#### `SystemConsole.write` {#symbol-SystemConsole.write}

[source](contracts.md#code)

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](contracts.md#symbol-Console.write).

**Author documentation**

Write one line of text.

**Parameters**
- `value`: Text to display.

**Behavior when execution reaches this operation**

- Call `print` with `value` set to `value`.

### `FileReader` {#symbol-FileReader}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Read UTF-8 text through an explicitly selected filesystem adapter.

#### `FileReader.read` {#symbol-FileReader.read}

[source](contracts.md#code)

**Inputs and dependencies**

- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Capabilities: [`FileReader.read`](contracts.md#symbol-FileReader.read).

Possible failures: `FileError`. The caller must catch or propagate them.

**Author documentation**

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

Interface contract. A selected implementation supplies the behavior.

### `FileWriter` {#symbol-FileWriter}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Write UTF-8 text through an explicitly selected filesystem adapter.

#### `FileWriter.write` {#symbol-FileWriter.write}

[source](contracts.md#code)

**Inputs and dependencies**

- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `content`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`FileWriter.write`](contracts.md#symbol-FileWriter.write).

Possible failures: `FileError`. The caller must catch or propagate them.

**Author documentation**

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

Interface contract. A selected implementation supplies the behavior.

### `LocalFiles` {#symbol-LocalFiles}

[source](contracts.md#code)

Behavioral class.

Satisfies [`FileReader`](contracts.md#symbol-FileReader), [`FileWriter`](contracts.md#symbol-FileWriter).

**Author documentation**

Native files. Operations are explicit; construction opens no files.

#### `LocalFiles.read` {#symbol-LocalFiles.read}

[source](contracts.md#code)

**Inputs and dependencies**

- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Capabilities: [`FileReader.read`](contracts.md#symbol-FileReader.read).

Possible failures: `FileError`. The caller must catch or propagate them.

**Author documentation**

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

**Behavior when execution reaches this operation**

- Return the result of call `read_file` with `path` set to `path` and finish this operation.

#### `LocalFiles.write` {#symbol-LocalFiles.write}

[source](contracts.md#code)

**Inputs and dependencies**

- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `content`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`FileWriter.write`](contracts.md#symbol-FileWriter.write).

Possible failures: `FileError`. The caller must catch or propagate them.

**Author documentation**

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

**Behavior when execution reaches this operation**

- Call `write_file` with `path` set to `path`; `content` set to `content`.

### `Arguments` {#symbol-Arguments}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Read command-line input through an explicit dependency.

#### `Arguments.read` {#symbol-Arguments.read}

[source](contracts.md#code)

Result: `List<string>`.

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

Result: `List<string>`.

Capabilities: [`Arguments.read`](contracts.md#symbol-Arguments.read).

**Behavior when execution reaches this operation**

- Return the result of call `arguments` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

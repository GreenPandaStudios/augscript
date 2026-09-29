---
generated: true
source: src/stdlib/io
editLink: false
---

# august.io

Public declarations exported by this module. Import names explicitly from `august.io`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [Console](#api-Console)
- [SystemConsole](#api-SystemConsole)
- [FileReader](#api-FileReader)
- [FileWriter](#api-FileWriter)
- [LocalFiles](#api-LocalFiles)
- [Arguments](#api-Arguments)
- [ProcessArguments](#api-ProcessArguments)

## Console {#api-Console}

```text
capability Console
```

Permission to write to a console, provided by an explicitly selected adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L2)

### Console.write

```text
write<T>(T value) uses Console.write
```

Write one line of text.

**Parameters**
- `value`: Text to display.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L4)

## SystemConsole {#api-SystemConsole}

```text
SystemConsole() implements Console
```

The native standard-output adapter. Construction performs no output.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L7)

### SystemConsole.write

```text
write<T>(T value)
```

Write one line of text.

**Parameters**
- `value`: Text to display.

Inferred capabilities: `Console.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L8)

## FileReader {#api-FileReader}

```text
capability FileReader
```

Read UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L12)

### FileReader.read

```text
read(string path) returns string uses FileReader.read unless FileError
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L14)

## FileWriter {#api-FileWriter}

```text
capability FileWriter
```

Write UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L17)

### FileWriter.write

```text
write(string path, string content) uses FileWriter.write unless FileError
```

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L19)

## LocalFiles {#api-LocalFiles}

```text
LocalFiles() implements FileReader, FileWriter
```

Native files. Operations are explicit; construction opens no files.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L22)

### LocalFiles.read

```text
read(string path) returns string unless FileError
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

Inferred capabilities: `FileReader.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L23)

### LocalFiles.write

```text
write(string path, string content) unless FileError
```

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

Inferred capabilities: `FileWriter.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L25)

## Arguments {#api-Arguments}

```text
capability Arguments
```

Read command-line input through an explicit dependency.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L29)

### Arguments.read

```text
read() returns List<string> uses Arguments.read
```

The signature declares inputs, result, effects and checked errors.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L30)

## ProcessArguments {#api-ProcessArguments}

```text
ProcessArguments() implements Arguments
```

Native command-line arguments.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L33)

### ProcessArguments.read

```text
read() returns List<string>
```

The signature declares inputs, result, effects and checked errors.

Inferred capabilities: `Arguments.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L34)

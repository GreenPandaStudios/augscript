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

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L3)

### Console.write

```text
write<T>(T value) uses Console.write
```

Write one line of text.

**Parameters**
- `value`: Text to display.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L5)

## SystemConsole {#api-SystemConsole}

```text
SystemConsole() implements Console
```

The native standard-output adapter. Construction performs no output.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L8)

### SystemConsole.write

```text
write<T>(T value)
```

Write one line of text.

**Parameters**
- `value`: Text to display.

The compiler infers use of `Console.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L9)

## FileReader {#api-FileReader}

```text
capability FileReader
```

Read UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L13)

### FileReader.read

```text
read(string path) returns string uses FileReader.read unless FileError
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L15)

## FileWriter {#api-FileWriter}

```text
capability FileWriter
```

Write UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L18)

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

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L20)

## LocalFiles {#api-LocalFiles}

```text
LocalFiles() implements FileReader, FileWriter
```

Native files. Operations are explicit; construction opens no files.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L23)

### LocalFiles.read

```text
read(string path)
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

The compiler infers a `string` result, use of `FileReader.read`, `FileError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L24)

### LocalFiles.write

```text
write(string path, string content)
```

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

The compiler infers use of `FileWriter.write`, `FileError` failures.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L26)

## Arguments {#api-Arguments}

```text
capability Arguments
```

Read command-line input through an explicit dependency.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L30)

### Arguments.read

```text
read() returns List<string> uses Arguments.read
```

The signature declares inputs, result, effects and checked errors.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L31)

## ProcessArguments {#api-ProcessArguments}

```text
ProcessArguments() implements Arguments
```

Native command-line arguments.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L34)

### ProcessArguments.read

```text
read()
```

The signature declares inputs, result, effects and checked errors.

The compiler infers a `List<string>` result, use of `Arguments.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L35)

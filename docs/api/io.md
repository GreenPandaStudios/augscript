---
generated: true
source: src/stdlib/io
editLink: false
---

# august.io

Console and file capabilities supplied with the compiler. Import names from `august.io`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## Console {#api-Console}

```text
capability Console
```

Permission to write to a console, provided by an explicitly selected adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L3)

### Console.write

```text
write<T>(T value)
```

Write one line of text.

**Parameters**
- `value`: Text to display.

Uses `Console.write`.

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

Uses `Console.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L9)

## FileReader {#api-FileReader}

```text
capability FileReader
```

Read UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L13)

### FileReader.read

```text
read(string path) returns string unless FileError
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

Uses `FileReader.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L15)

## FileWriter {#api-FileWriter}

```text
capability FileWriter
```

Write UTF-8 text through an explicitly selected filesystem adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L18)

### FileWriter.write

```text
write(string path, string content) unless FileError
```

Write text.

**Parameters**
- `path`: File path.
- `content`: Text.

**Throws**
- `FileError`: Writing failed.

Uses `FileWriter.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L20)

## LocalFiles {#api-LocalFiles}

```text
LocalFiles() implements FileReader, FileWriter
```

Native filesystem adapter. Construction opens no files.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L23)

### LocalFiles.read

```text
read(string path) returns string unless FileError
```

Read text.

**Parameters**
- `path`: File path.

**Throws**
- `FileError`: The file could not be read.

Uses `FileReader.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L24)

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

Uses `FileWriter.write`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L26)

## Arguments {#api-Arguments}

```text
capability Arguments
```

Read command-line input through an explicit dependency.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L30)

### Arguments.read

```text
read() returns List<string>
```

Uses `Arguments.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L31)

## ProcessArguments {#api-ProcessArguments}

```text
ProcessArguments() implements Arguments
```

Native command-line arguments.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L34)

### ProcessArguments.read

```text
read() returns List<string>
```

Uses `Arguments.read`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/io/contracts.aug#L35)

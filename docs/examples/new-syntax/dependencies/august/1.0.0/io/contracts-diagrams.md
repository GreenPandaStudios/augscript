---
title: "august/io/contracts.aug diagrams"
generated: true
source: "examples/new-syntax/.aug-spec/august/1.0.0/io/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# august/io/contracts.aug diagrams

[Labeled calls and injection](../../../../index.md)

[Project overview](../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

## Class interactions

### LocalFiles

```mermaid
flowchart LR
    n0["FileReader"]
    n1["FileWriter"]
    n2["LocalFiles"]
    n2 -->|"implements"| n0
    n2 -->|"implements"| n1
```

### ProcessArguments

```mermaid
flowchart LR
    n0["Arguments"]
    n1["ProcessArguments"]
    n1 -->|"implements"| n0
```

### SystemConsole

```mermaid
flowchart LR
    n0["Console"]
    n1["SystemConsole"]
    n1 -->|"implements"| n0
```


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Console.write {#sequence-Console.write}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L6)
:::

Write one line of text.

The type parameters are `T`.

It takes `value` as `T` (Text to display).

It can call [`Console.write`](contracts.md#symbol-Console.write).

Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### SystemConsole constructor {#sequence-SystemConsole-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L9)
:::

The native standard-output adapter. Construction performs no output. It implements [`Console`](contracts.md#symbol-Console).

[Explanation](contracts.md).

### SystemConsole.write {#sequence-SystemConsole.write}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L10)
:::

Write one line of text.

It takes `value` as `T`.

It can call [`Console.write`](contracts.md#symbol-Console.write).

```mermaid
sequenceDiagram
    participant p0 as SystemConsole.write
    participant p1 as August runtime
    p0->>p1: print(value=value)
```

### FileReader.read {#sequence-FileReader.read}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L16)
:::

Read text.

It takes `path` as a string (File path).

It returns `string`. It can call [`FileReader.read`](contracts.md#symbol-FileReader.read). Failures can raise `FileError` (The file could not be read).

May leave with checked errors: FileError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### FileWriter.write {#sequence-FileWriter.write}

::: spec-paragraph specification-paragraph-5
[Source](contracts.md#source-L21)
:::

Write text.

It takes `path` as a string (File path) and `content` as a string (Text).

It can call [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Failures can raise `FileError` (Writing failed).

May leave with checked errors: FileError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### LocalFiles constructor {#sequence-LocalFiles-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](contracts.md#source-L24)
:::

Native filesystem adapter. Construction opens no files. It implements [`FileReader`](contracts.md#symbol-FileReader) and [`FileWriter`](contracts.md#symbol-FileWriter).

[Explanation](contracts.md).

### LocalFiles.read {#sequence-LocalFiles.read}

::: spec-paragraph specification-paragraph-7
[Source](contracts.md#source-L25)
:::

Read text.

It takes `path` as a string.

It can call [`FileReader.read`](contracts.md#symbol-FileReader.read). Failures can raise `FileError` (The file could not be read).

```mermaid
sequenceDiagram
    participant p0 as LocalFiles.read
    participant p1 as August runtime
    p0->>p1: read_file(path=path)
    p1-->>p0: read_file result: string
    Note over p0: Return read_file(path=path)； required cleanup runs<br/>before exit
    Note over p0: May leave with checked errors: FileError
```

### LocalFiles.write {#sequence-LocalFiles.write}

::: spec-paragraph specification-paragraph-8
[Source](contracts.md#source-L27)
:::

Write text.

It takes `path` and `content` as strings.

It can call [`FileWriter.write`](contracts.md#symbol-FileWriter.write). Failures can raise `FileError` (Writing failed).

```mermaid
sequenceDiagram
    participant p0 as LocalFiles.write
    participant p1 as August runtime
    p0->>p1: write_file(path=path, content=content)
    Note over p0: May leave with checked errors: FileError
```

### Arguments.read {#sequence-Arguments.read}

::: spec-paragraph specification-paragraph-9
[Source](contracts.md#source-L32)
:::

It returns `List<string>`. It can call [`Arguments.read`](contracts.md#symbol-Arguments.read).

Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### ProcessArguments constructor {#sequence-ProcessArguments-20-constructor}

::: spec-paragraph specification-paragraph-10
[Source](contracts.md#source-L35)
:::

Native command-line arguments. It implements [`Arguments`](contracts.md#symbol-Arguments).

[Explanation](contracts.md).

### ProcessArguments.read {#sequence-ProcessArguments.read}

::: spec-paragraph specification-paragraph-11
[Source](contracts.md#source-L36)
:::

It can call [`Arguments.read`](contracts.md#symbol-Arguments.read).

```mermaid
sequenceDiagram
    participant p0 as ProcessArguments.read
    participant p1 as August runtime
    p0->>p1: arguments()
    p1-->>p0: arguments result: List‹string›
    Note over p0: Return arguments()； required cleanup runs before exit
```

## Called contracts

- [Arguments](contracts-diagrams.md) — august/io/contracts.aug
- [Console](contracts-diagrams.md) — august/io/contracts.aug
- [FileReader](contracts-diagrams.md) — august/io/contracts.aug
- [FileWriter](contracts-diagrams.md) — august/io/contracts.aug

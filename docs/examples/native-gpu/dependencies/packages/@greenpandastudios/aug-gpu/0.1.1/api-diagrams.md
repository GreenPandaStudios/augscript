---
title: "Diagrams · GPU workers"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.1.1/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# GPU workers diagrams

[GPU workers](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["_add · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n1["_download · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n2["_live · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n3["_open · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n4["_upload · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n5["add · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n6["download · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n7["openDevice · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n8["upload · package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n5 -->|"calls"| n0
    n6 -->|"calls"| n1
    n7 -->|"calls"| n3
    n8 -->|"calls"| n4
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### \_open {#sequence-_open}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as _open

    Note over p0: May leave with checked errors: GpuError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### \_upload {#sequence-_upload}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as _upload

    Note over p0: May leave with checked errors: GpuError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### \_add {#sequence-_add}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as _add

    Note over p0: May leave with checked errors: GpuError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### \_download {#sequence-_download}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _download

    Note over p0: May leave with checked errors: GpuError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### \_live {#sequence-_live}

::: spec-paragraph specification-paragraph-5
[Source](api.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as _live

    Note over p0: Native implementation#59; only the declared contract is known
```

#### openDevice {#sequence-openDevice}

::: spec-paragraph specification-paragraph-6
[Source](api.md#source-L11)
:::

```mermaid
sequenceDiagram
    participant p0 as openDevice
    participant p1 as _open
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _open() · native boundary
    Note over p0: Return _open()#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

#### upload {#sequence-upload}

::: spec-paragraph specification-paragraph-7
[Source](api.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as upload
    participant p1 as _upload
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _upload(device, values) · native boundary
    Note over p0: Return _upload(device, values)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

#### add {#sequence-add}

::: spec-paragraph specification-paragraph-8
[Source](api.md#source-L19)
:::

```mermaid
sequenceDiagram
    participant p0 as add
    participant p1 as _add
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _add(left, right) · native boundary
    Note over p0: Return _add(left, right)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

#### download {#sequence-download}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L23)
:::

```mermaid
sequenceDiagram
    participant p0 as download
    participant p1 as _download
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _download(buffer) · native boundary
    Note over p0: Return _download(buffer)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

### Called contracts

- [\_add](api-diagrams.md#sequence-_add) — package/@greenpandastudios/aug-gpu@0.1.1/api.aug
- [\_download](api-diagrams.md#sequence-_download) — package/@greenpandastudios/aug-gpu@0.1.1/api.aug
- [\_open](api-diagrams.md#sequence-_open) — package/@greenpandastudios/aug-gpu@0.1.1/api.aug
- [\_upload](api-diagrams.md#sequence-_upload) — package/@greenpandastudios/aug-gpu@0.1.1/api.aug

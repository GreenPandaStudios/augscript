---
title: "package/@greenpandastudios/aug-gpu@0.2.0/api.aug diagrams"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.2.0/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-gpu@0.2.0/api.aug diagrams

[GPU workers](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_open {#sequence-_open}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

May leave with checked errors: GpuError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_upload {#sequence-_upload}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

May leave with checked errors: GpuError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_add {#sequence-_add}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

May leave with checked errors: GpuError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_download {#sequence-_download}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L8)
:::

May leave with checked errors: GpuError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_live {#sequence-_live}

::: spec-paragraph specification-paragraph-5
[Source](api.md#source-L9)
:::

Native implementation; only the declared contract is known. [Explanation](api.md).

### openDevice {#sequence-openDevice}

::: spec-paragraph specification-paragraph-6
[Source](api.md#source-L11)
:::

```mermaid
sequenceDiagram
    participant p0 as openDevice

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _open() · native boundary
    p0-->>p0: _open result: Device
    Note over p0: Return _open()； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

### upload {#sequence-upload}

::: spec-paragraph specification-paragraph-7
[Source](api.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as upload

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _upload(device=device, values=values) · native boundary
    p0-->>p0: _upload result: Buffer
    Note over p0: Return _upload(device, values)； required cleanup runs<br/>before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

### add {#sequence-add}

::: spec-paragraph specification-paragraph-8
[Source](api.md#source-L19)
:::

```mermaid
sequenceDiagram
    participant p0 as add

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _add(left=left, right=right) · native boundary
    p0-->>p0: _add result: Buffer
    Note over p0: Return _add(left, right)； required cleanup runs before<br/>exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

### download {#sequence-download}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L23)
:::

```mermaid
sequenceDiagram
    participant p0 as download

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _download(buffer=buffer) · native boundary
    p0-->>p0: _download result: List‹float›
    Note over p0: Return _download(buffer)； required cleanup runs before<br/>exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: GpuError
```

## Called contracts

- [\_add](api-diagrams.md#sequence-_add) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [\_download](api-diagrams.md#sequence-_download) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [\_open](api-diagrams.md#sequence-_open) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [\_upload](api-diagrams.md#sequence-_upload) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug

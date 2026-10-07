---
title: "compute.aug diagrams"
generated: true
source: "examples/native-gpu/compute.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# compute.aug diagrams

[GPU workers](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](compute.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### calculate {#sequence-calculate}

::: spec-paragraph specification-paragraph-1
[Source](compute.md#source-L5)
:::

Add two lists on a GPU and return copied values. GPU resources stay local.

It takes `left` and `right` as `List<float>`.

Failures can raise [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError).

```mermaid
sequenceDiagram
    participant p0 as calculate
    participant p1 as aug-gpu/api
    p0->>p1: openDevice()
    p1-->>p0: device: Device
    Note over p0: Own device； release on scope exits
    p0->>p1: upload(device=device, values=left)
    p1-->>p0: first: Buffer
    Note over p0: Own first； release on scope exits
    p0->>p1: upload(device=device, values=right)
    p1-->>p0: second: Buffer
    Note over p0: Own second； release on scope exits
    p0->>p1: add(left=first, right=second)
    p1-->>p0: result: Buffer
    Note over p0: Own result； release on scope exits
    p0->>p1: download(buffer=result)
    p1-->>p0: download result: List‹float›
    Note over p0: Return download(buffer=result)； required cleanup runs<br/>before exit
    Note over p0: May leave with checked errors: GpuError
```

## Called contracts

- [calculate](compute-diagrams.md#sequence-calculate) — compute.aug
- [add](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api-diagrams.md#sequence-add) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [download](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api-diagrams.md#sequence-download) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [openDevice](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api-diagrams.md#sequence-openDevice) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug
- [upload](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/api-diagrams.md#sequence-upload) — package/@greenpandastudios/aug-gpu@0.2.0/api.aug

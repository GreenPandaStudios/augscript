---
title: "packages/@greenpandastudios/aug-gpu/0.1.1/api.aug · GPU workers"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.1.1/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-gpu/0.1.1/api.aug`

[GPU workers](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer from bindings
import GpuError from contracts
extern C _open() returns own Device unless GpuError
extern C _upload(Device device, List<float> values) returns own Buffer unless GpuError
extern C _add(Buffer left, Buffer right) returns own Buffer unless GpuError
extern C _download(Buffer buffer) returns List<float> unless GpuError
extern C _live() returns int
/** Open a Metal GPU on the current worker. No device means GpuError. */
openDevice() returns own Device:
    unsafe:
        return _open()
/** Copy finite numbers to an owned float32 GPU buffer. Values round to float32. */
upload(Device device, List<float> values) returns own Buffer:
    unsafe:
        return _upload(device, values)
/** Add equally sized buffers on the GPU. Wait for device completion before returning. */
add(Buffer left, Buffer right) returns own Buffer:
    unsafe:
        return _add(left, right)
/** Copy float32 GPU values into an August list of floats. */
download(Buffer buffer):
    unsafe:
        return _download(buffer)
test openDevice:
    when "metal":
        it "adds_on_the_gpu_and_releases_every_resource":
            int before = 0
            unsafe:
                before = _live()
            scope:
                own Device device = openDevice()
                own Buffer left = upload(device, values=[1.0, 2.0, 3.0])
                own Buffer right = upload(device, values=[4.0, 5.0, 6.0])
                own Buffer result = add(left, right)
                output = download(buffer=result)
                assert(output.get(index=0) == 5.0)
                assert(output.get(index=1) == 7.0)
                assert(output.get(index=2) == 9.0)
            unsafe:
                assert(_live() == before)
        it "cleans_up_when_an_operation_fails":
            try:
                scope:
                    own Device device = openDevice()
                    own Buffer left = upload(device, values=[1.0])
                    own Buffer right = upload(device, values=[2.0, 3.0])
                    own Buffer result = add(left, right)
                    assert(false)
            catch GpuError error:
                assert(error.code == 2)
            unsafe:
                assert(_live() == 0)
```

```aug [Braces]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer from bindings
import GpuError from contracts
extern C _open() returns own Device unless GpuError
extern C _upload(Device device, List<float> values) returns own Buffer unless GpuError
extern C _add(Buffer left, Buffer right) returns own Buffer unless GpuError
extern C _download(Buffer buffer) returns List<float> unless GpuError
extern C _live() returns int
/** Open a Metal GPU on the current worker. No device means GpuError. */
openDevice() returns own Device {
    unsafe {
        return _open()
    }
}
/** Copy finite numbers to an owned float32 GPU buffer. Values round to float32. */
upload(Device device, List<float> values) returns own Buffer {
    unsafe {
        return _upload(device, values)
    }
}
/** Add equally sized buffers on the GPU. Wait for device completion before returning. */
add(Buffer left, Buffer right) returns own Buffer {
    unsafe {
        return _add(left, right)
    }
}
/** Copy float32 GPU values into an August list of floats. */
download(Buffer buffer) {
    unsafe {
        return _download(buffer)
    }
}
test openDevice {
    when "metal" {
        it "adds_on_the_gpu_and_releases_every_resource" {
            int before = 0
            unsafe {
                before = _live()
            }
            scope {
                own Device device = openDevice()
                own Buffer left = upload(device, values=[1.0, 2.0, 3.0])
                own Buffer right = upload(device, values=[4.0, 5.0, 6.0])
                own Buffer result = add(left, right)
                output = download(buffer=result)
                assert(output.get(index=0) == 5.0)
                assert(output.get(index=1) == 7.0)
                assert(output.get(index=2) == 9.0)
            }
            unsafe {
                assert(_live() == before)
            }
        }
        it "cleans_up_when_an_operation_fails" {
            try {
                scope {
                    own Device device = openDevice()
                    own Buffer left = upload(device, values=[1.0])
                    own Buffer right = upload(device, values=[2.0, 3.0])
                    own Buffer result = add(left, right)
                    assert(false)
                }
            }
            catch GpuError error {
                assert(error.code == 2)
            }
            unsafe {
                assert(_live() == 0)
            }
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `openDevice` · [source](api.md#code) {#symbol-openDevice}

Open a Metal GPU on the current worker. No device means GpuError. It returns ownership of [`Device`](bindings.md#symbol-Device). Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Within an unsafe block, it returns [`_open`](api.md#symbol-_open). Native operations must satisfy their declared C contracts.

### `upload` · [source](api.md#code) {#symbol-upload}

Copy finite numbers to an owned float32 GPU buffer. Values round to float32. It takes `device` as [`Device`](bindings.md#symbol-Device) and `values` as `List<float>`.

It returns ownership of [`Buffer`](bindings.md#symbol-Buffer). Failures can raise [`GpuError`](contracts.md#symbol-GpuError). Within an unsafe block, it returns [`_upload`](api.md#symbol-_upload) with `device` and `values`. Native operations must satisfy their declared C contracts.

### `add` · [source](api.md#code) {#symbol-add}

Add equally sized buffers on the GPU. Wait for device completion before returning. It takes `left` and `right` as [`Buffer`](bindings.md#symbol-Buffer).

It returns ownership of [`Buffer`](bindings.md#symbol-Buffer). Failures can raise [`GpuError`](contracts.md#symbol-GpuError). Within an unsafe block, it returns [`_add`](api.md#symbol-_add) with `left` and `right`. Native operations must satisfy their declared C contracts.

### `download` · [source](api.md#code) {#symbol-download}

Copy float32 GPU values into an August list of floats. It takes `buffer` as [`Buffer`](bindings.md#symbol-Buffer). Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Within an unsafe block, it returns [`_download`](api.md#symbol-_download) with `buffer`. Native operations must satisfy their declared C contracts.

### `_open` · [source](api.md#code) {#symbol-_open}

It is private to its defining scope. It returns ownership of [`Device`](bindings.md#symbol-Device). Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). It calls `aug_gpu_open_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The caller owns the returned handle. Its maintainer permits independent instances on worker threads. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_upload` · [source](api.md#code) {#symbol-_upload}

It is private to its defining scope. It takes `device` as [`Device`](bindings.md#symbol-Device) and `values` as `List<float>`. It returns ownership of [`Buffer`](bindings.md#symbol-Buffer). Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). It calls `aug_gpu_upload_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `device` lends read access for this call. The caller owns the returned handle. Its maintainer permits independent instances on worker threads. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_add` · [source](api.md#code) {#symbol-_add}

It is private to its defining scope. It takes `left` and `right` as [`Buffer`](bindings.md#symbol-Buffer). It returns ownership of [`Buffer`](bindings.md#symbol-Buffer). Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). It calls `aug_gpu_add_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `left` lends read access for this call; `right` lends read access for this call. The caller owns the returned handle. Its maintainer permits independent instances on worker threads. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_download` · [source](api.md#code) {#symbol-_download}

It is private to its defining scope. It takes `buffer` as [`Buffer`](bindings.md#symbol-Buffer). It returns `List<float>`. Failures can raise [`GpuError`](contracts.md#symbol-GpuError).

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). It calls `aug_gpu_download_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `buffer` lends read access for this call. August copies the returned buffer, then calls `aug_gpu_values_release_v1` to release it. Its maintainer permits independent instances on worker threads. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_live` · [source](api.md#code) {#symbol-_live}

It is private to its defining scope. It returns `int`.

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). It calls `aug_gpu_live_resources_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. Its maintainer permits independent instances on worker threads. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `test openDevice` · [source](api.md#code) {#symbol-test-20-openDevice}

Tests [`openDevice`](api.md#symbol-openDevice). Each case gets fresh setup and dependencies.

#### `metal`

##### `adds_on_the_gpu_and_releases_every_resource` · [source](api.md#code)

It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_live`](api.md#symbol-_live). Native operations must satisfy their declared C contracts. Within a task and ownership scope, it calls [`openDevice`](api.md#symbol-openDevice) and stores the result in owned `device` ([`Device`](bindings.md#symbol-Device)).

It calls [`upload`](api.md#symbol-upload) with `device` and `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Buffer`](bindings.md#symbol-Buffer)). It calls [`upload`](api.md#symbol-upload) with `device` and `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Buffer`](bindings.md#symbol-Buffer)). It calls [`add`](api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Buffer`](bindings.md#symbol-Buffer)). It sets `output` to [`download`](api.md#symbol-download) with `buffer` from `result`.

The test requires `output.get` with `index` `0` equals `5.0`. The test requires `output.get` with `index` `1` equals `7.0`. The test requires `output.get` with `index` `2` equals `9.0`. On leaving this scope, join its child tasks and release its local values.

Within an unsafe block, the test requires [`_live`](api.md#symbol-_live) equals `before`. Native operations must satisfy their declared C contracts.

##### `cleans_up_when_an_operation_fails` · [source](api.md#code)

Within a task and ownership scope, it calls [`openDevice`](api.md#symbol-openDevice) and stores the result in owned `device` ([`Device`](bindings.md#symbol-Device)). It calls [`upload`](api.md#symbol-upload) with `device` and `values` from a list containing `1.0` and stores the result in owned `left` ([`Buffer`](bindings.md#symbol-Buffer)). It calls [`upload`](api.md#symbol-upload) with `device` and `values` from a list containing `2.0`, `3.0` and stores the result in owned `right` ([`Buffer`](bindings.md#symbol-Buffer)). It calls [`add`](api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Buffer`](bindings.md#symbol-Buffer)).

The test requires `false` is true. On leaving this scope, join its child tasks and release its local values. If this work raises [`GpuError`](contracts.md#symbol-GpuError) as `error`, it the test requires `error.code` equals `2`. Within an unsafe block, the test requires [`_live`](api.md#symbol-_live) equals `0`.

Native operations must satisfy their declared C contracts.

### Dependencies

It uses [`Buffer`](bindings.md#symbol-Buffer) and [`Device`](bindings.md#symbol-Device) from `bindings`. It uses [`GpuError`](contracts.md#symbol-GpuError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

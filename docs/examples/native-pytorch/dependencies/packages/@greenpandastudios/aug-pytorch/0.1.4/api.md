---
title: "packages/@greenpandastudios/aug-pytorch/0.1.4/api.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.1.4/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-pytorch/0.1.4/api.aug`

[CPU tensors with PyTorch](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor from bindings
import TensorError from contracts
extern C _tensor(List<float> values) returns own Tensor unless TensorError
extern C _add(Tensor left, Tensor right) returns own Tensor unless TensorError
extern C _sum(Tensor tensor) returns float unless TensorError
extern C _values(Tensor tensor) returns List<float> unless TensorError
/** Copy a list of float64 values into a CPU tensor. */
tensor(List<float> values) returns own Tensor:
    unsafe:
        return _tensor(values)
/** Add tensors without changing either input. */
add(Tensor left, Tensor right) returns own Tensor:
    unsafe:
        return _add(left, right)
/** Sum every element. */
sum(Tensor tensor) returns float:
    unsafe:
        return _sum(tensor)
/** Copy tensor values into an August list. */
values(Tensor tensor) returns List<float>:
    unsafe:
        return _values(tensor)
extern C _liveTensors() returns int
extern C _liveBuffers() returns int
_consumeAndFail(own Tensor value) unless TensorError:
    throw TensorError(code=99, message="expected cleanup test")
interface _TensorContainer:
    total() returns float unless TensorError
_TensorHolder(mutable own Tensor item) implements _TensorContainer:
    total() returns float:
        return sum(tensor=item)
_replace(borrow _TensorHolder holder, own Tensor replacement):
    holder.item = replacement
test tensor:
    when "cpu":
        it "adds_real_tensors":
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            assert(sum(tensor=result) == 21.0)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
    when "ownership":
        it "transfers_into_a_field_and_releases_the_old_tensor":
            int before = 0
            unsafe:
                before = _liveTensors()
            scope:
                own Tensor initial = tensor(values=[1.0])
                own _TensorHolder holder = _TensorHolder(item=initial)
                own Tensor replacement = tensor(values=[7.0])
                borrow holder:
                    _replace(holder, replacement)
                assert(holder.total() == 7.0)
                unsafe:
                    assert(_liveTensors() == before + 1)
            unsafe:
                assert(_liveTensors() == before)
        it "preserves_native_error_methods":
            bool caught = false
            own Tensor left = tensor(values=[1.0, 2.0])
            own Tensor right = tensor(values=[1.0, 2.0, 3.0])
            try:
                add(left, right)
            catch TensorError error:
                caught = error.explain().length() > 0
            assert(caught)
        it "releases_a_transferred_tensor_when_the_callee_fails":
            int before = 0
            unsafe:
                before = _liveTensors()
            bool caught = false
            try:
                own Tensor value = tensor(values=[1.0])
                _consumeAndFail(value)
            catch TensorError error:
                caught = error.code == 99
            assert(caught)
            unsafe:
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
        it "releases_scoped_and_unused_results":
            int before = 0
            unsafe:
                before = _liveTensors()
            scope:
                own Tensor value = tensor(values=[2.0])
                List<float> output = values(tensor=value)
                assert(output.get(index=0) == 2.0)
            tensor(values=[3.0])
            unsafe:
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
```

```aug [Braces]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor from bindings
import TensorError from contracts
extern C _tensor(List<float> values) returns own Tensor unless TensorError
extern C _add(Tensor left, Tensor right) returns own Tensor unless TensorError
extern C _sum(Tensor tensor) returns float unless TensorError
extern C _values(Tensor tensor) returns List<float> unless TensorError
/** Copy a list of float64 values into a CPU tensor. */
tensor(List<float> values) returns own Tensor {
    unsafe {
        return _tensor(values)
    }
}
/** Add tensors without changing either input. */
add(Tensor left, Tensor right) returns own Tensor {
    unsafe {
        return _add(left, right)
    }
}
/** Sum every element. */
sum(Tensor tensor) returns float {
    unsafe {
        return _sum(tensor)
    }
}
/** Copy tensor values into an August list. */
values(Tensor tensor) returns List<float> {
    unsafe {
        return _values(tensor)
    }
}
extern C _liveTensors() returns int
extern C _liveBuffers() returns int
_consumeAndFail(own Tensor value) unless TensorError {
    throw TensorError(code=99, message="expected cleanup test")
}
interface _TensorContainer {
    total() returns float unless TensorError
}
_TensorHolder(mutable own Tensor item) implements _TensorContainer {
    total() returns float {
        return sum(tensor=item)
    }
}
_replace(borrow _TensorHolder holder, own Tensor replacement) {
    holder.item = replacement
}
test tensor {
    when "cpu" {
        it "adds_real_tensors" {
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            assert(sum(tensor=result) == 21.0)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
        }
    }
    when "ownership" {
        it "transfers_into_a_field_and_releases_the_old_tensor" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            scope {
                own Tensor initial = tensor(values=[1.0])
                own _TensorHolder holder = _TensorHolder(item=initial)
                own Tensor replacement = tensor(values=[7.0])
                borrow holder {
                    _replace(holder, replacement)
                }
                assert(holder.total() == 7.0)
                unsafe {
                    assert(_liveTensors() == before + 1)
                }
            }
            unsafe {
                assert(_liveTensors() == before)
            }
        }
        it "preserves_native_error_methods" {
            bool caught = false
            own Tensor left = tensor(values=[1.0, 2.0])
            own Tensor right = tensor(values=[1.0, 2.0, 3.0])
            try {
                add(left, right)
            }
            catch TensorError error {
                caught = error.explain().length() > 0
            }
            assert(caught)
        }
        it "releases_a_transferred_tensor_when_the_callee_fails" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            bool caught = false
            try {
                own Tensor value = tensor(values=[1.0])
                _consumeAndFail(value)
            }
            catch TensorError error {
                caught = error.code == 99
            }
            assert(caught)
            unsafe {
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
            }
        }
        it "releases_scoped_and_unused_results" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            scope {
                own Tensor value = tensor(values=[2.0])
                List<float> output = values(tensor=value)
                assert(output.get(index=0) == 2.0)
            }
            tensor(values=[3.0])
            unsafe {
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
            }
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `tensor` · [source](api.md#code) {#symbol-tensor}

Copy a list of float64 values into a CPU tensor. It takes `values` as `List<float>`. It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Within an unsafe block, it returns [`_tensor`](api.md#symbol-_tensor) with `values`. Native operations must satisfy their declared C contracts.

### `add` · [source](api.md#code) {#symbol-add}

Add tensors without changing either input. It takes `left` and `right` as [`Tensor`](bindings.md#symbol-Tensor). It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Within an unsafe block, it returns [`_add`](api.md#symbol-_add) with `left` and `right`. Native operations must satisfy their declared C contracts.

### `sum` · [source](api.md#code) {#symbol-sum}

Sum every element. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Within an unsafe block, it returns [`_sum`](api.md#symbol-_sum) with `tensor`. Native operations must satisfy their declared C contracts.

### `values` · [source](api.md#code) {#symbol-values}

Copy tensor values into an August list. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Within an unsafe block, it returns [`_values`](api.md#symbol-_values) with `tensor`. Native operations must satisfy their declared C contracts.

### `_tensor` · [source](api.md#code) {#symbol-_tensor}

It is private to its defining scope. It takes `values` as `List<float>`. It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_from_f64_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The caller owns the returned handle. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_add` · [source](api.md#code) {#symbol-_add}

It is private to its defining scope. It takes `left` and `right` as [`Tensor`](bindings.md#symbol-Tensor). It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_add_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `left` lends read access for this call; `right` lends read access for this call. The caller owns the returned handle. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_sum` · [source](api.md#code) {#symbol-_sum}

It is private to its defining scope. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). It returns `float`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_sum_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `tensor` lends read access for this call. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_values` · [source](api.md#code) {#symbol-_values}

It is private to its defining scope. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). It returns `List<float>`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_values_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `tensor` lends read access for this call. August copies the returned buffer, then calls `aug_torch_values_release_v1` to release it. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_liveTensors` · [source](api.md#code) {#symbol-_liveTensors}

It is private to its defining scope. It returns `int`.

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_probe_live_tensors_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_liveBuffers` · [source](api.md#code) {#symbol-_liveBuffers}

It is private to its defining scope. It returns `int`.

Native implementation: `@greenpandastudios/aug-pytorch@0.1.4`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_probe_live_buffers_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_consumeAndFail` · [source](api.md#code) {#symbol-_consumeAndFail}

It is private to its defining scope. It takes `value` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. Failures can raise [`TensorError`](contracts.md#symbol-TensorError). It raises a [`TensorError`](contracts.md#symbol-TensorError) with `code` `99` and `message` `"expected cleanup test"`.

### `_TensorContainer` · interface · [source](api.md#code) {#symbol-_TensorContainer}

It is private to this file.

#### `_TensorContainer.total` · [source](api.md#code) {#symbol-_TensorContainer.total}

It returns `float`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

### `_TensorHolder` · class · [source](api.md#code) {#symbol-_TensorHolder}

It implements [`_TensorContainer`](api.md#symbol-_TensorContainer). It is private to this file. It takes `item` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred, kept mutable.

#### `_TensorHolder.total` · [source](api.md#code) {#symbol-_TensorHolder.total}

Failures can raise [`TensorError`](contracts.md#symbol-TensorError). It returns [`sum`](api.md#symbol-sum) with `tensor` from `item`.

### `_replace` · [source](api.md#code) {#symbol-_replace}

It is private to its defining scope. It takes `holder` as [`_TensorHolder`](api.md#symbol-_TensorHolder) with permission to mutate it during the call and `replacement` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. It may change `holder`. It sets `holder.item` to `replacement`.

### `test tensor` · [source](api.md#code) {#symbol-test-20-tensor}

Tests [`tensor`](api.md#symbol-tensor). Each case gets fresh setup and dependencies.

#### `cpu`

##### `adds_real_tensors` · [source](api.md#code)

It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`add`](api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](bindings.md#symbol-Tensor)). The test requires [`sum`](api.md#symbol-sum) with `tensor` from `result` equals `21.0`.

It sets `output` of type `List<float>` to [`values`](api.md#symbol-values) with `tensor` from `result`. The test requires `output.length` equals `3`.

#### `ownership`

##### `transfers_into_a_field_and_releases_the_old_tensor` · [source](api.md#code)

It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. Within a task and ownership scope, it calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0` and stores the result in owned `initial` ([`Tensor`](bindings.md#symbol-Tensor)).

It creates [`_TensorHolder`](api.md#symbol-_TensorHolder) with `item` from `initial` and stores the result in owned `holder` ([`_TensorHolder`](api.md#symbol-_TensorHolder)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `7.0` and stores the result in owned `replacement` ([`Tensor`](bindings.md#symbol-Tensor)). With temporary permission to change `holder`, it calls [`_replace`](api.md#symbol-_replace) with `holder` and `replacement`. The test requires [`holder.total`](api.md#symbol-_TensorHolder.total) equals `7.0`.

Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals (`before` plus `1`). Native operations must satisfy their declared C contracts. On leaving this scope, join its child tasks and release its local values. Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`.

Native operations must satisfy their declared C contracts.

##### `preserves_native_error_methods` · [source](api.md#code)

It sets `caught` to `false`. It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0` and stores the result in owned `left` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `right` ([`Tensor`](bindings.md#symbol-Tensor)).

It tries to call [`add`](api.md#symbol-add) with `left` and `right`. If this work raises [`TensorError`](contracts.md#symbol-TensorError) as `error`, it sets `caught` to `length` on `error.explain` is positive. The test requires `caught` is true.

##### `releases_a_transferred_tensor_when_the_callee_fails` · [source](api.md#code)

It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. It sets `caught` to `false`.

It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0` and stores the result in owned `value` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`_consumeAndFail`](api.md#symbol-_consumeAndFail) with `value`. If this work raises [`TensorError`](contracts.md#symbol-TensorError) as `error`, it sets `caught` to `error.code` equals `99`. The test requires `caught` is true.

Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`; then the test requires [`_liveBuffers`](api.md#symbol-_liveBuffers) equals `0`. Native operations must satisfy their declared C contracts.

##### `releases_scoped_and_unused_results` · [source](api.md#code)

It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. Within a task and ownership scope, it calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `2.0` and stores the result in owned `value` ([`Tensor`](bindings.md#symbol-Tensor)); then it sets `output` of type `List<float>` to [`values`](api.md#symbol-values) with `tensor` from `value`; then the test requires `output.get` with `index` `0` equals `2.0`.

On leaving this scope, join its child tasks and release its local values. It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `3.0`. Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`; then the test requires [`_liveBuffers`](api.md#symbol-_liveBuffers) equals `0`. Native operations must satisfy their declared C contracts.

### Dependencies

It uses [`Tensor`](bindings.md#symbol-Tensor) from `bindings`. It uses [`TensorError`](contracts.md#symbol-TensorError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

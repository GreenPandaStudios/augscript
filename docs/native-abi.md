# Native ABI 1

`aug-native-abi-1` is the public contract between August and a native adapter. It uses the target's C calling convention. It does not expose August heap objects, tagged values, classes or task storage. C++ and Rust libraries provide a C adapter; using LLVM in both languages does not make their object layouts compatible.

The [adapter header](https://github.com/GreenPandaStudios/augscript/blob/main/native/aug-native-abi-1.h) records the existing fixed error layout and caller-thread cancellation probe. **Unreleased:** this header ships in the next CLI under `native/aug-native-abi-1.h`. Use it when authoring an adapter instead of redeclaring the error record. Consumers import the package's August declarations and need no headers or native compiler.

## Values and arguments

A descriptor lists August's parameter labels in declaration order. Native arguments follow that order, regardless of the order used by an August caller. The binding checker validates the physical signature against a C header. These mappings are fixed for ABI 1:

| Descriptor kind | C representation |
| --- | --- |
| `i64` | `int64_t` |
| `i32` | `int32_t`; the August integer must fit its checked bounds |
| `f64` | `double` |
| `bool` | `uint8_t`, not C `_Bool` |
| `utf8`, `bytes` | Input `const void *` and `uint64_t` byte length |
| `f64-list` | Input `const double *` and `uint64_t` element count |
| `utf8-list` | Input `const void *const *`, `const uint64_t *` lengths and `uint64_t` element count |
| `resource` | Opaque pointer; its incomplete record or `void` pointer agrees with the release function |

Inputs are valid only for the duration of the call. The adapter cannot retain an August buffer, list, string or managed wrapper. Empty inputs have length zero; never dereference them. Native outputs are copied into managed August values before their declared release function is called. Byte/string output has `void **` and `uint64_t *` output arguments; a float-list output has `double **` and `uint64_t *`. Its release function takes the returned pointer and, when `releaseLength` is true, its length. String-list outputs are unsupported.

Use opaque resources for native classes and aggregate data. Passing native structs by value, templates, variadic functions, arbitrary pointers and callbacks is outside ABI 1. A new profile is required before these contracts can become package APIs.

## Errors and results

A `status: "direct"` function returns a scalar or void directly and has no checked native failure. A `status: "i32"` function returns `int32_t`: zero means success; nonzero means failure. After its inputs, it receives the result's output pointer when needed, followed by `aug_native_error_v1 *`. A void result needs no output pointer. An owned resource result uses an opaque pointer-to-pointer.

The error record has `int32_t code` at offset 0, `uint32_t message_length` at offset 4 and `unsigned char message[512]` at offset 8. Its size is 520 bytes and alignment is 4. Initialize outputs and return a nonzero status with a code and bounded UTF-8 message on failure. Release partial allocations inside the adapter before returning a failure; August has not acquired the failed result. The descriptor names the August checked error. Its constructor receives the native code and copied message. August bounds the message copy to 512 bytes; it does not read a native NUL terminator to find its length.

C++ exceptions and Rust panics must be contained inside the adapter. They must never unwind through August. A release function returns void and must complete without raising a foreign exception. Native crashes and violated pointer/allocator promises are not converted into checked August errors.

## Resources and threads

An owned native result creates a fresh August wrapper. The adapter owns every native reference it needs independently of the input wrappers. August releases the resource once when its owner leaves scope or replaces it. A transfer moves that responsibility to the new owner. The descriptor's release function must pair with that adapter's allocation; the compiler cannot infer the allocator.

A `read` input lends a resource for the call. `borrow` permits mutation under the checked exclusive loan. `consume` transfers ownership to the adapter. Neither loans nor handles cross worker heaps. All calls and release operations run on the caller's thread. A function may run within an isolated worker only when its descriptor explicitly declares `workerSafe: true`; omission means false. Package authors must qualify library global state, independent instances and release behavior before making that promise.

During an original caller-thread call, `uint8_t aug_native_cancelled_v1(void)` reports whether its current task or worker is cancelled. It does not allocate, yield or enter a callback. A native operation must also enforce its own deadline and drain or discard its work safely. Calling the probe from a foreign thread is unsupported.

## What is checked

August checks labels, types, ownership, checked errors, capabilities, declared mutation, worker permission and agreement with the hashed descriptor. `aug bind header` additionally checks real C signatures, signedness, pointer constness, releases and error layout. Neither check proves pointer retention, allocator pairing, native thread safety or exception containment. Adapter tests and sanitizers must exercise those promises.

Package artifacts state their OS, architecture, CPU baseline, minimum OS/libc, linking and C++ runtime requirements. An incompatible artifact is rejected before compilation, and installation never starts a package build script. Keep the executable and its selected `lib` and `share` directories together. See [native packages](native-packages.md) for authoring and [package compatibility](package-compatibility.md) for the lock and upgrade contract.

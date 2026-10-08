# Explain a failure without losing its cause

Catch an error where you can explain the failed operation, then deliberately throw it with context. The caller sees the original cause type and fields. No logging or recovery policy is added automatically.

## Add context at the operation

Put startup in **main.aug**:

```aug project=error-context-guide file=main.aug
import load and ReadFailure from settings
import ContextError from august.errors

try:
    load(fail=true)
catch ContextError<ReadFailure> failure:
    print(value=failure.operation)
    print(value=failure.cause.path)
```

Keep the operation and its tests in **settings.aug**:

```aug project=error-context-guide file=settings.aug
import ContextError and errorContext from august.errors

error ReadFailure(string path)

load(bool fail):
    try:
        if fail:
            throw ReadFailure(path="config.json")
        return "ready"
    catch ReadFailure failure:
        throw errorContext(
            cause=failure,
            operation="read settings",
            location=sourceLocation()
        )

test load:
    when settings:
        it "returns the loaded value":
            assertEqual(actual=load(fail=false), expected="ready")
        it "keeps the failed path":
            try:
                load(fail=true)
                assert(false)
            catch ContextError<ReadFailure> failure:
                assertEqual(actual=failure.cause.path, expected="config.json")
                assertEqual(actual=failure.operation, expected="read settings")
```

Run `aug run .`. It prints `read settings` and `config.json`. Run `aug test .` to check successful loading and the retained cause. `errorContext` constructs a value; `throw` is the application’s decision. `load` infers `ContextError<ReadFailure>` as its escaping error, so callers must catch or propagate that concrete contract.

## Capture the location you mean

`sourceLocation()` returns `(file, line, column)`. Lines and columns start at one and refer to the checked source that produced the executable, including August’s managed spec pointer. Application paths are relative to the project; package paths are `name@version/path` within the package source. Host directories and cache locations stay out of the value.

Call it at the operation you want to identify, and pass the result into a helper. Calling it inside a helper identifies that helper’s call expression. It does not inspect the runtime stack, open a source file or log a message. A stale executable retains its compiled location; use the matching source revision when debugging it.

The location tuple is immutable data and can cross a worker boundary. A cause keeps its ordinary ownership and worker-copy rules. Context does not turn behavioral objects or native handles into copied worker data.

## Choose the public error

`ContextError<E>` exposes `operation`, `cause` and `location`. The cause retains its original identity; nested wrapping is explicit. Its fields grant reading under the ordinary class rules, without making a mutable cause deeply immutable.

Wrap a failure when the caller benefits from that context. At a stable public boundary, an application can instead construct its own domain error with a typed cause and location. Keep the operation description useful and avoid secrets in error fields. Decide separately which fields belong in an HTTP response or log.

The compiler checks the resulting error and catch types. It does not convert every failure into `Error`, select a status code, retry the operation or serialize a cause chain for you.

## Catch the stored cause safely

For a short generic error, a catch checks the error declaration and every field that stores a type parameter. `ContextError<ReadFailure>` therefore checks its actual cause before exposing `path`; nested contexts check each cause in the chain. Static generic contracts remain invariant. A deliberately widened `ContextError<Error>` needs a matching broad catch or an ordinary `catch Error`, even when a narrower catch can recognize its stored value.

Each type parameter must appear directly in non-null, read-only managed fields. Concrete error arguments and up to 128 nested supported short errors work. Phantom arguments, nullable or collection fields containing a parameter, unresolved parameters in generic catch bodies, and generic errors with custom behavior produce `ERROR_MATCH`. Use a non-generic domain error when its contract needs those forms.

An HTTP status mapping uses a non-generic error. Catch a context in the endpoint body and choose that domain error explicitly; the compiler rejects a generic status mapping rather than using an erased declaration name.

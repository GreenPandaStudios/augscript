# Try a snippet

The scratch command checks an entry fragment without creating a permanent project. It is implemented in the unreleased candidate; published August 0.23.0 does not contain it. Until the containing release, use `aug init` to make a small project.

Save this entry fragment as `experiment.aug`:

```text
value = 20 + 22
print(value=$"result: {value}")
```

Check it first:

```sh
aug scratch experiment.aug
```

The command reports `Scratch check passed` without printing the program's result. Add `--json` for the source digest, diagnostics, and separate checking and preparation statuses. Check diagnostics name `experiment.aug` and retain its original line numbers.

Run it when you want to execute the program:

```sh
aug scratch experiment.aug --run
```

It prints `result: 42`. Arguments after `--` go to the program. The process runs in a temporary folder; use absolute paths for files outside it. Compilation, execution, and dependency preparation use the same rules as `aug run`. On ordinary completion or a reported failure, temporary source, locks, specs, and build output are removed. Your scratch file stays unchanged. Downloaded package and native caches remain available for later projects.

## Try a package

A standalone scratch file can use standard-library imports and direct repository imports. This entry fragment uses the native zlib package:

```text
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"

try:
    input = "scratch zlib".bytes()
    compressed = compress(input)
    restored = decompress(input=compressed, maximumOutput=4096)
    print(value=restored.text())
catch CompressionError error:
    exit(status=1)
catch ConversionError error:
    exit(status=1)
```

Save it as `compression.aug`. Default checking does not download dependencies; a missing-import diagnostic points to `--prepare`. Prepare them explicitly to check the imported interfaces without executing the program:

```sh
aug scratch compression.aug --prepare
aug scratch compression.aug --run
```

The run prints `scratch zlib`. `--run` also prepares dependencies, so it can be used on its own. Installation verifies the normal source and native artifact contracts and does not run package build scripts. The native package's supported hosts still apply. `--offline` prevents dependency downloads; it does not prevent the program from using the network.

## Grow it into a project

The fragment becomes a normal `main.aug`. It contains entry statements, imports, and bindings. Functions, records, classes, and same-file tests belong in neighboring modules, just as they do in a project. Scratch checking does not read neighboring files or inherit the parent's `main.yaml` and aliases.

When you need those files or a persistent dependency lock, create a project with `aug init`, move the fragment into its `main.aug`, and add ordinary modules beside it. Use [values and functions](../learn/values-and-functions.md) for declarations and [packages](../packages.md) for aliases and locked dependencies.

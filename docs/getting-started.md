# Getting started

August is a statically checked language for programs that a new teammate or an LLM can understand from nearby code. It makes public boundaries, inputs, dependencies, state changes, and errors visible. The compiler generates C11 and builds a native executable.

This guide builds a small greeting application. Each command runs from the project directory unless a path is shown.

## 1. Prepare the toolchain

You need Node.js 24 or later, npm, and a C11 compiler. Start from a [release tarball or checkout](packages.md). Native runs also need the portable minicoro source. From the August checkout:

```sh
npm ci
node scripts/bootstrap-native.mjs --extract-only --only minicoro,yyjson
node bin/aug.mjs init hello-august
cd hello-august
node ../bin/aug.mjs check .
```

If the checkout is elsewhere, use its absolute `bin/aug.mjs` path. A globally installed CLI uses `aug` in place of `node ../bin/aug.mjs`. Once the npm release is published, the one-command starter will be `npx @greenpandastudios/aug-cli@next init hello-august`. The npm package is not published yet; the [package page](packages.md) tracks distribution.

The starter refuses a nonempty destination, so it will not replace your work. It creates `main.aug`, `greeting.aug`, a README, and `.gitignore`.

## 2. Read the startup file

`main.aug` is the one entry point. It imports the names it needs, binds an interface to a class, resolves it, and starts the program:

```aug project=getting-started file=main.aug
import Greeter and SimpleGreeter from greeting

implement Greeter with SimpleGreeter
resolve Greeter to greeter
print(value=greeter.greet(name="August"))
```

Every call input has a label. You can reorder labeled inputs without changing their meaning. `implement` makes a dependency choice at startup; other files do not fetch a hidden global service. `resolve` asks for the bound interface explicitly. Run `aug run .` to print `Hello, August!`.

## 3. Read the module beside it

`greeting.aug` keeps the public contract, implementation, explanation, and tests together:

```aug project=getting-started file=greeting.aug
/** Build a greeting for a named person. */
interface Greeter:
    /** Return a greeting for the named person. */
    greet(string name) returns string

/** A plain-language greeting. */
SimpleGreeter() implements Greeter:
    greet(string name) returns string:
        return "Hello, " + name + "!"

test SimpleGreeter greeter:
    when greetings:
        greeter = SimpleGreeter()
        it greets_a_person:
            assert(greeter.greet(name="August") == "Hello, August!")
```

The interface states what callers can expect. The class names the interface it implements. Its constructor has no inputs, so `SimpleGreeter()` needs no labels. The `test` lives in the same file as the class it describes. Use `aug test .` to run it, or `aug test . greetings` to select the group.

## 4. Let the checker explain mistakes

Run `aug check .` after an edit. Try changing `greet(name="August")` to `greet(person="August")` in `main.aug`; the checker reports that `person` is not an input. Restore the name and check again. `aug format . --write` formats either indentation or braces consistently. Both block styles express the same program; [the project gallery](examples/developer-workflow/index.md) lets you switch views.

Names beginning with `_` are private to their scope. Other names can be imported from a sibling file. Across folder boundaries, an `export.aug` file lists the public names; [the module guide](reference.md#modules-and-exports) explains this boundary.

## 5. Generate the explanation

Run `aug spec .`. August writes `main.aug.md` and `greeting.aug.md` beside the source. These deterministic specifications explain the behavior, dependencies, tests, and linked public surfaces, including Javadoc when present. They can be regenerated at any time. `aug spec . --check` fails if committed specs are stale.

The [example gallery](examples/index.md) shows actual formatted August files beside their generated specifications. Start with [Hello world](examples/hello/index.md) and then [a tested application](examples/developer-workflow/index.md).

## 6. Grow the program in small modules

As a project grows, keep public contracts narrow. Import only the names used in a file. Put tests beside declarations. Mark side effects on interfaces; implementation and private helper effects are inferred and available in editor hover and generated specs. Mutable access uses `borrow`; read-only access does not need a copy. Checked failures use `unless ErrorType` and `try`/`catch`. These rules and examples are in the [language guide](reference.md), [testing guide](testing.md), and [web guide](web.md).

For an application with multiple files, capabilities, errors, and unit tests, work through [the complete developer workflow example](examples/developer-workflow/index.md). The [package guide](packages.md#author-a-package) then shows how to publish a reusable source library and import only its exported surface.

## 7. Build an executable

`aug build .` checks the project, emits C11, and invokes the native compiler. It prints the executable path under `.aug-build`. `aug run .` builds and runs in one step. [Docker build and run images](docker.md) cover core, web, and crypto programs on Linux. The [native bootstrap](tooling.md) builds web and crypto dependencies on macOS and Linux; [production readiness](production-readiness.md) lists the remaining platform and operational work.

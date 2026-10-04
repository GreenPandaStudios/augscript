---
prev:
  text: The August book
  link: /learn/
next:
  text: Values and functions
  link: /learn/values-and-functions
---

# Your first project

Create a greeting application, run it, and check its test. Then read the explanation generated from the same code.

You need Node.js 24 or later and npm on macOS 14+ with Apple Silicon, or GNU/Linux x64/ARM64 with glibc 2.36+. August downloads its own LLVM compiler and prebuilt runtime. You do not install Clang, LLVM, or an SDK.

You can run the compiler and native libraries in [a VS Code Dev Container](dev-containers.md). The [Docker guide](docker.md) covers container builds and deployment. The smaller starter below is in the unreleased compiler. With published August 0.23.0, replace its two source files with the versions shown here; they also work with that release.

## Create and run the starter

Install August once, then create and run the starter:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init hello-august
cd hello-august
aug run
```

`init` creates a starter, including `AGENTS.md`, and refuses to replace a nonempty destination. npm supplies the CLI and its core I/O library. `aug run` defaults to the current folder: it checks the project, prepares its dependencies, compiles it, and starts it. It prints:

```text
Hello, August!
```

Keep the terminal in `hello-august` for the rest of this chapter. The first run downloads the compiler; later runs reuse it. August also downloads libraries when a project needs them. [Packages and installation](packages.md) explains version pinning, offline use, and the optional `npx` workflow.

## Read the startup file

The starter's `main.aug` imports a function and prints its result:

```aug project=getting-started file=main.aug
import greet from greeting

print(value=greet(name="August"))
```

`main.aug` is the application entry point. Its import names the public declaration in the sibling file `greeting.aug`. The last line asks for a greeting and prints the result.

The call labels its input `name`. You can read what the string is for without opening the declaration. Labels also let you reorder inputs when a call has several of them.

## Read the module beside it

Open `greeting.aug`. These are the important declarations:

```aug project=getting-started file=greeting.aug
/** Return a greeting for the named person. */
greet(string name):
    return "Hello, " + name + "!"

test greet:
    when greetings:
        it greets_a_person:
            assert(greet(name="August") == "Hello, August!")
```

`greet` accepts a string named `name`. It joins that name with `Hello, ` and `!`. The compiler infers its string result, and the editor shows that result beside the header.

The test calls the same function and checks its returned string. The comment also appears in editor help. The later [modules chapter](learn/modules-and-dependencies.md) introduces interfaces and dependency injection for replaceable behavior.

## Change the greeting

In `main.aug`, change `name="August"` to `name="Ada"`. Run:

```sh
aug check .
aug run .
aug test .
```

The application should print `Hello, Ada!`. The existing test should still pass: it calls the function with its own input and checks the greeting for August. Application startup does not run during the test.

Now deliberately change the call's label from `name` to `person`. `check` should fail because `greet` has no input named `person`. Restore `name` and check again. The checker catches the wrong label before the program runs.

## Read the generated explanation

```sh
aug spec .
aug spec . --check
```

Open `main.aug.md` and `greeting.aug.md`. They describe the import, call, greeting behavior, and test. Their dependency links lead to the used declarations. The compiler generates this text offline. The same source produces the same explanation.

After an edit, regenerate before committing the explanation. `--check` reports stale files and does not write them. [Compiled specifications](specifications.md) explains the full workflow and its limits.

## Continue with a calculation

Continue with [Values and functions](learn/values-and-functions.md) to write a calculation and use labeled shorthand and conditions.

For a service, try [the weather API starter](weather-api.md). You can also [browse complete projects](examples/index.md) with code and actual compiled specs beside each other. The gallery's Indentation and Braces controls display the same checked program in either block style.

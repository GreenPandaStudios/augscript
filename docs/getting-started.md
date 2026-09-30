---
prev:
  text: The August book
  link: /learn/
next:
  text: Values and functions
  link: /learn/values-and-functions
---

# Your first project

Build a greeting application, run its test, and read its generated explanation. You will see how an August project starts and how a small module keeps its contract, implementation, and test together.

You need Node.js 24 or later and npm. To run native programs, you also need a C11 compiler on macOS or Linux. On macOS, install Xcode Command Line Tools for Clang; on Linux, install a C toolchain.

You can run the compiler and native libraries in [a VS Code Dev Container](dev-containers.md) instead of installing a host C toolchain. The [Docker guide](docker.md) covers container builds and deployment.

## Create and run the starter

Create the starter with one command:

```sh
npx @greenpandastudios/aug-cli@next init hello-august
```

`init` creates a starter and refuses to replace a nonempty destination. npm supplies the CLI and its matching libraries. The rest of this book invokes the same published CLI through `npx`.

Enter your new project and check it:

```sh
cd hello-august
npx @greenpandastudios/aug-cli@next check .
```

Checking needs no native dependency build. Before your first native run, prepare the small task and JSON source dependencies, then run the program:

```sh
npx --package=@greenpandastudios/aug-cli@next aug-native --extract-only --only minicoro,yyjson
npx @greenpandastudios/aug-cli@next run .
```

The bootstrap downloads pinned portable C sources into a shared cache. It does not install system tools, and you can reuse that cache for subsequent projects. `run` checks, compiles, and executes the program. It prints:

```text
Hello, August!
```

Keep the terminal in `hello-august` for the rest of this chapter. [Packages and installation](packages.md) explains version pinning and the additional native dependencies used by web and crypto programs.

## Read the startup file

The starter's `main.aug` contains its imports, dependency choice, and startup work:

```aug project=getting-started file=main.aug
import Greeter and SimpleGreeter from greeting

implement Greeter with SimpleGreeter
resolve Greeter to greeter
print(value=greeter.greet(name="August"))
```

`main.aug` is the application entry point. It imports two public declarations from the sibling file `greeting.aug`. `implement` selects the provider for `Greeter`, and `resolve` obtains it as `greeter`. The last line asks for a greeting and prints the result.

The call labels its input `name`. You can read what the string is for without opening the declaration. Labels also let you reorder inputs when a call has several of them.

## Read the module beside it

Open `greeting.aug`. These are the important declarations:

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

The interface is the caller's contract: give `greet` a string named `name`, and receive a string. `SimpleGreeter` implements that contract. Its constructor has no inputs. The method builds a string and returns it.

The test lives beside the class. Its group constructs a greeter, and its case checks an exact result. The comments explain intent and supply editor help. The code describes what happens when the operation runs.

## Change the greeting

In `main.aug`, change `name="August"` to `name="Ada"`. Run:

```sh
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next run .
npx @greenpandastudios/aug-cli@next test .
```

The application should print `Hello, Ada!`. The existing test should still pass: it constructs its own subject and checks the greeting for August. Application startup does not run during the test.

Now deliberately change the call's label from `name` to `person`. `check` should fail because `greet` has no input named `person`. Restore `name` and check again. The checker verifies the contract; the test verifies a behavior you chose to exercise.

## Read the generated explanation

```sh
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next spec . --check
```

Open `main.aug.md` and `greeting.aug.md`. They describe the bindings, call, greeting behavior, and test. Their dependency links lead to the used declarations. Generation is deterministic and offline; it does not ask a model to summarize your application.

After an edit, regenerate before committing the explanation. `--check` reports stale files and does not write them. [Compiled specifications](specifications.md) explains the full workflow and its limits.

## Continue with a calculation

You have created, checked, run, tested, and explained an August application. In [Values and functions](learn/values-and-functions.md), you will write a calculation without an injected dependency and learn how labeled shorthand and conditions read.

You can also [browse complete projects](examples/index.md) with code and actual compiled specs beside each other. The gallery's Indentation and Braces controls display the same checked program in either block style.

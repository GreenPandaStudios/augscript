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

You need Node.js 24 or later, npm, and a C11 compiler on macOS or Linux. On macOS, install Xcode Command Line Tools for Clang; on Linux, install a C toolchain. This chapter uses the published npm CLI. [Packages and installation](packages.md) also covers release archives and source checkouts.

## Create and run the starter

Run these commands from a terminal:

```sh
npx @greenpandastudios/aug-cli@next init hello-august
npm install --global @greenpandastudios/aug-cli@next
aug-native --extract-only --only minicoro,yyjson
cd hello-august
aug check .
aug run .
```

The native bootstrap downloads the pinned portable task and JSON sources needed for this program. It does not install system tools. `init` creates a starter and refuses to replace a nonempty destination. `check` verifies the project; `run` checks, compiles, and executes it. The program prints:

```text
Hello, August!
```

Keep the terminal in `hello-august` for the rest of this chapter. The global install supplies `aug` and `aug-native`, with the CLI's three matching library packages. A source checkout can use `node /absolute/path/to/augscript/bin/aug.mjs` in place of `aug`.

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
aug check .
aug run .
aug test .
```

The application should print `Hello, Ada!`. The existing test should still pass: it constructs its own subject and checks the greeting for August. Application startup does not run during the test.

Now deliberately change the call's label from `name` to `person`. `check` should fail because `greet` has no input named `person`. Restore `name` and check again. The checker verifies the contract; the test verifies a behavior you chose to exercise.

## Read the generated explanation

```sh
aug spec .
aug spec . --check
```

Open `main.aug.md` and `greeting.aug.md`. They describe the bindings, call, greeting behavior, and test. Their dependency links lead to the used declarations. Generation is deterministic and offline; it does not ask a model to summarize your application.

Generation also adds a source comment pointing to each file's spec. After an edit, regenerate before committing the explanation. `--check` reports stale files and does not write them. [Compiled specifications](specifications.md) explains the full workflow and its limits.

## Continue with a calculation

You have created, checked, run, tested, and explained an August application. In [Values and functions](learn/values-and-functions.md), you will write a calculation without an injected dependency and learn how labeled shorthand and conditions read.

You can also [browse complete projects](examples/index.md) with code and actual compiled specs beside each other. The gallery's Indentation and Braces controls display the same checked program in either block style.

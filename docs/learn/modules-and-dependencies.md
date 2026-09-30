---
prev:
  text: Data and failures
  link: /learn/data-and-errors
next:
  text: State and tests
  link: /learn/state-and-tests
---

# Modules and dependencies

An import should lead a reader to a small public contract. This project moves the greeting into its own folder and selects its implementation in the application entry point.

Create a `greeting` folder beside `main.aug`:

```text
hello/
  main.aug
  greeting/
    export.aug
    greeter.aug
```

**main.aug**

```aug project=book-modules file=main.aug
import Greeter and FriendlyGreeter from greeting

implement Greeter with FriendlyGreeter
resolve Greeter to greeter
print(value=greeter.greet(name="August"))
```

**greeting/export.aug**

```aug project=book-modules file=greeting/export.aug
export Greeter from greeter
export FriendlyGreeter from greeter
```

**greeting/greeter.aug**

```aug project=book-modules file=greeting/greeter.aug
/** Provide a greeting for a named person. */
interface Greeter:
    greet(string name) returns string

FriendlyGreeter() implements Greeter:
    greet(string name):
        return "Hello, " + name + "!"
```

Run `aug check .` and `aug run .`. The output is `Hello, August!`.

## Choose what the folder exposes

`export.aug` is the folder's public boundary. A file outside `greeting` can import the names listed there. It cannot reach other declarations in that folder merely by knowing their paths. Within a folder, sibling files also need explicit imports. A folder without `export.aug` exposes no names across its boundary.

Try removing the export line for `FriendlyGreeter`. The import in `main.aug` should fail. Restore it after running `aug check .`. This is a boundary check; a private name beginning with `_` cannot be exported at all.

## Select behavior at startup

The interface describes the operation available to the caller. `FriendlyGreeter` implements that contract. `implement Greeter with FriendlyGreeter` selects the provider, and `resolve Greeter to greeter` obtains it for startup work.

Elsewhere in an application, injected dependencies appear as `resolve` inputs in a class or function header. For example, `Worker(resolve Logger logger)` receives the configured logger without a caller supplying that argument. An ordinary `Logger logger` input must be passed by label. See [a complete constructor-injection example](../examples/new-syntax/index.md).

Reading the entry point tells you the application's dependency choices. Reading a callable's header tells you its required dependencies. The compiler checks the binding graph before execution; a missing or cyclic dependency fails checking.

## Follow a dependency

Run `aug spec .` and read `main.aug.md`. Follow its links to the greeting's explanation, then read `greeting/export.aug.md` to see the public surface. In VS Code, Ctrl-click `from` or the module path to open the source or export file. This is the workflow you can use in a larger unfamiliar project too.

Keep exports narrow as a folder grows. Add an implementation to the public surface when its caller needs to compose it. Keep helpers private and explain design intent beside the declaration. [The next chapter](state-and-tests.md) adds state and tests while preserving that local view.

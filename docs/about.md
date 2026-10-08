# Why August exists

August is a statically checked language for native applications, designed around **understanding at every resolution**. Its code reads like pseudocode; its compiler also produces connected explanations and diagrams. Developers and coding agents can work from the project down to an operation without reading every implementation.

The language's two tenets are **simplicity** and **developer scalability**. Write the code needed for the operation. Let the compiler infer repeated information. Keep the module small enough that a new reader can follow its behavior and find its dependencies.

## Understand before changing

When you review an agent's implementation, begin with the generated views. The project overview explains startup and service wiring. A folder view shows its exports and the data it exchanges. An operation's sequence follows possible calls, decisions and exits; its prose supplies the detailed behavior and dependency contracts. Open the linked source when an expression needs changing or a boundary needs investigation.

[Follow the greeting example](guides/understand-a-project.md) to try that reading path. The homepage shows its actual code, compiled spec and diagrams together.

The generated explanation describes the current implementation. Authored requirements and tests describe what it should do. Review them together when accepting a change. [Compiled specifications](specifications.md) explains the reading workflow and the boundaries of each view.

## Code that reads like pseudocode

A call such as `total(price=7, quantity=3)` names the role of each value. Inputs can appear in any order. `and`, `or`, `not`, `unless`, and `wait for` use ordinary words for conditions, failures, and task coordination.

A folder publishes selected names through `export.aug`. Other folders can import those names; helpers remain internal. Class and function headers identify injected dependencies with `resolve`. When an operation changes an object or performs I/O, the checker tracks that behavior and the editor displays it.

Tests live beside the code they exercise. `aug spec` writes the module's explanation to `.aug.md`, including links to the dependencies it uses. Read the spec before changing an unfamiliar module, then review the updated explanation with the patch. [Change a module](guides/change-a-module.md) walks through this process.

## Who should try it

Try August in a small application if you want to explore this way of organizing code. [The book](learn/index.md) starts with a greeting and builds toward modules, errors, state, and tests. Teams using coding agents can use the same examples to assess whether the source and specs help their own review process.

The [research notes](research/understanding-at-every-resolution.md) connect this design to work on program comprehension, graph abstraction, traceability and deterministic language generation. The compiler tests check facts and links. Developer studies must separately measure whether these views improve understanding and change accuracy; comparative productivity claims need that evidence.

## Where it stands

August compiles through LLVM to native executables. [The performance reports](performance.md) compare complete programs with C, Node, and Python, including the source and measurements.

The published tools include a CLI, VS Code extension, standard libraries, and native-library packages. August 1.x defines a source, package, CLI and native ABI compatibility contract. Check [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap](roadmap.md) before choosing it for a deployment.

# Why August exists

August is a statically checked language for native applications. It is designed to help developers and coding agents understand and change large codebases. You can start with a project overview, follow data through its folders and modules, examine an API sequence, then read the compiled explanation or inspect the source. These views come from the checked program and link to each other. The diagram views are unreleased work for 1.0.

The language's two tenets are **simplicity** and **developer scalability**. Write the code needed for the operation. Let the compiler infer repeated information. Keep the module small enough that a new reader can follow its behavior and find its dependencies.

## Understand before changing

When you review an agent's implementation, you need to find the relevant module, understand its dependencies and decisions, and check the proposed behavior. August organizes that reading at several levels of detail. Use the overview to locate a responsibility, a sequence to follow possible calls, and the source to inspect or adjust the expression that matters.

The generated explanation describes the current implementation. Authored requirements and tests describe what it should do. Review them together when accepting a change. [Compiled specifications](specifications.md) explains the reading workflow and the boundaries of each view.

## Code that reads like pseudocode

A call such as `total(price=7, quantity=3)` names the role of each value. Inputs can appear in any order. `and`, `or`, `not`, `unless`, and `wait for` use ordinary words for conditions, failures, and task coordination.

A folder publishes selected names through `export.aug`. Other folders can import those names; helpers remain internal. Class and function headers identify injected dependencies with `resolve`. When an operation changes an object or performs I/O, the checker tracks that behavior and the editor displays it.

Tests live beside the code they exercise. `aug spec` writes the module's explanation to `.aug.md`, including links to the dependencies it uses. Read the spec before changing an unfamiliar module, then review the updated explanation with the patch. [Change a module](guides/change-a-module.md) walks through this process.

## Who should try it

Try August in a small application if you want to explore this way of organizing code. [The book](learn/index.md) starts with a greeting and builds toward modules, errors, state, and tests. Teams using coding agents can use the same examples to assess whether the source and specs help their own review process.

August's design is intended to make code easier to change. Comparative productivity studies are still needed to measure that effect.

## Where it stands

August compiles through LLVM to native executables. [The performance reports](performance.md) compare complete programs with C, Node, and Python, including the source and measurements.

The published tools include a CLI, VS Code extension, standard libraries, and native-library packages. August remains experimental and has no stable 1.0 compatibility promise. Check [supported platforms](compatibility.md), [production readiness](production-readiness.md), and the [roadmap](roadmap.md) before choosing it for a deployment.

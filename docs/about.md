# Why August exists

Software gets harder to change when its behavior depends on knowledge scattered across a large codebase. A function looks small, yet it reaches a global service, changes shared state, or fails in a way its caller did not expect. A new teammate has to reconstruct those relationships. A coding agent faces the same problem with a limited view of the project.

August's two tenets are **simplicity** and **developer scalability**. A reader should be able to understand a module from its source and a few nearby, linked contracts. The language makes dependencies and behavior visible so a team can review a change without first learning every implementation detail in the application.

## Code that reads like pseudocode

Calls use labels, such as `total(price=7, quantity=3)`. You can read the role of each input at the call site. Files import the names they use, and folders expose their public surface through `export.aug`. An underscore keeps a name private to its scope.

Interfaces state the operations that callers can use. Application startup selects their implementations, and `resolve` inputs show which dependencies construction or a call requires. Capability contracts describe I/O. The checker infers mutation and checked failures from executable bodies; editor hints and compiled specs display them. Bodyless contracts use `changes` and `unless` to state those limits. Read access can share an object; mutation requires permission expressed in code.

Tests live with the declaration they describe. `aug spec` produces a neighboring Markdown explanation from checked code and links to the exact dependency surfaces. It includes comments when they are present. The explanation supports review; tests and compiler checks still have their own jobs.

The [book](learn/index.md) introduces these choices in runnable programs. The [module review guide](guides/change-a-module.md) shows how to use them when you arrive in an unfamiliar project.

## Who should try it

August is for developers exploring how language design can make modular applications easier to understand and maintain. Teams working with coding agents can try its explicit contracts, bounded context tools, and compiled specs in a small project. Hobbyists can start with the same tools and a short application.

The project does not yet have evidence that August makes every team or coding agent more productive than another language. Demonstrations show how the tools work. Compiler tests show particular rules being checked. Benchmarks measure particular programs. Broader claims need reproducible studies and experience with real projects.

## Where it stands

August compiles to a native executable through LLVM and uses a managed runtime. You can measure its execution against C with the [published programs and results](performance.md). The repository also contains the CLI, VS Code extension, standard library, web and crypto libraries, tests, and this documentation. [Packages](packages.md) explains how to install a matching set and create your own source libraries.

August is a public preview. It has cooperative tasks, explicit ownership operations, checked errors, HTTP endpoints, and source packages, but no stable 1.0 compatibility promise. Read the [readiness review](production-readiness.md), [library gaps](web-library-gaps.md), and [1.0 roadmap](roadmap.md) for the limits that matter to your project.

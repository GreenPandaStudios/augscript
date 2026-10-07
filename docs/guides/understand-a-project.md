# Understand a project at every resolution

You should be able to answer most questions about an August application from its generated explanations and diagrams. Begin with the whole application, then open only the part your question needs.

The diagram views and this expanded workflow are unreleased work for 1.0. You can explore their actual generated output in the wiki. The public preview already supports neighboring compiled specifications.

## Begin with a question

| Your question | Start here | What to follow |
| --- | --- | --- |
| How does the application start? | Project overview | Providers, startup and folder boundaries |
| What can another folder use? | Folder view | The exports and their linked contracts |
| What data crosses this boundary? | Folder data flow | Inputs, results and exact contributing call sites |
| What happens in this API? | Operation sequence | Decisions, calls, responses, failures and cleanup |
| What does this implementation do? | Neighboring specification | The complete prose and dependency surfaces |
| Which expression needs changing? | A linked source location | The affected implementation and same-file tests |

These are different views of the same checked program. Moving to a more detailed view should add facts, without changing the meaning of the facts you already saw.

## Follow a greeting

Open the [greeting project's overview](../examples/hello/diagrams/index.md). Its startup explanation says which implementations provide the console, logger and application. The data flow shows calls from startup to the application, and from the application to logging.

Open [Greeter.greet](../examples/hello/app/greeter-diagrams.md#sequence-Greeter.greet). Its sequence passes a personalized message to the logger. The [compiled explanation](../examples/hello/app/greeter.md#symbol-Greeter.greet) gives the input, injected console and message in prose. It also links the logging contract used by the call.

The logger is an interface boundary. To understand this application's selected implementation, follow the provider from the [startup spec](../examples/hello/main.md#specification) to [ConsoleLogger.log](../examples/hello/logging/console-diagrams.md#sequence-ConsoleLogger.log). That operation writes through the configured console.

You can explain the greeting's path from these views: startup resolves the application, the greeter supplies the message, and the selected logger writes it. Each view has its own scope. The folder graph groups calls made by several operations; it does not establish a single execution path through every connected arrow.

## Open a larger application

The [login application's overview](../examples/oidc-login/diagrams/index.md) separates its client, provider and common code. Its HTTP API list lets you start at a route rather than guess a filename. Open the provider's [authorization operation](../examples/oidc-login/provider/authorization-diagrams.md#sequence-authorize), or its [token operation](../examples/oidc-login/provider/token-diagrams.md#sequence-token).

First read the operation's visible contract and sequence. Follow each validation branch and early exit. Check which store, crypto or HTTP operation is called, what it receives, and what comes back. The [authorization explanation](../examples/oidc-login/provider/authorization.md) supplies the detailed behavior; its dependency links describe only the surfaces it uses.

Return to a folder view when a sequence crosses into another logical unit. **Inputs, results and call sites** opens the complete contracts behind a grouped connection. The caller and source links explain where each relation comes from. Several calls with the same signature share a contract, while their separate call sites remain listed.

Long sequences continue in smaller views with their active branch frames. An interface call remains an interface call. Native internals, deferred callbacks and browser submissions are identified where they enter the sequence. Follow a native package's declared contract for its ownership and failure rules; source-derived diagrams cannot inspect the foreign implementation.

## Read behavior before changing it

The spec describes the current implementation, including private helpers and same-file tests. Use it to answer what happens on success, on a checked failure, and on leaving a scope. Owned resources, state changes, task joins and cleanup need the same attention as return values.

An author comment can explain why the operation exists. A generated sentence explains the source behavior. A declared native contract describes a promise made by foreign code. A test case describes an expected outcome; an executed test report is evidence that the selected case passed. Keep those distinctions when reviewing an agent's work.

Open source when you are ready to change an expression, need a detail the current view does not express, or must investigate an unresolved runtime boundary. Give a coding agent the same starting point:

> Read the project overview and the specs for the affected operations. Follow their dependency contracts and failure paths. Open the source locations you need to edit. Keep the requested behavior in independently reviewed tests. Regenerate the explanations and diagrams, then report the source changes and concrete check results.

[Change an unfamiliar module](change-a-module.md) walks through a small edit. [Make a checked change](../checked-changes.md) describes revision-bearing compiler operations.

## Keep the views current

From a project folder, use the installed CLI:

```sh
aug check .
aug test .
aug spec .
aug spec . --check
```

The compiler writes `.aug.md` and `.aug.diagrams.md` beside source files, with the project and eligible folder overviews under `.aug-spec/diagrams/`. Generation is deterministic and does not execute the application. Commit these artifacts with the source. The check command detects drift without writing.

The [compiled-spec reference](../specifications.md) explains file locations, generation limits and dependency copies. The [research and validation notes](../research/understanding-at-every-resolution.md) explain how this reading workflow is being evaluated.

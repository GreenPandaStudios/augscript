[homepage-generated]: #

## This is August

A greeting is small enough to read in full. The same compiler that checks this code also writes its explanation and diagrams.

::::: example-compare
:::: example-code
### Readable code

This component belongs to the [complete greeting project](examples/hello/index.md). Its logger comes from the application’s bindings.

::: code-group

```aug [Indentation]
import Console from august.io
import Logger from logging
Greeter(resolve Logger logger) implements IGreeter:
    greet(resolve Console console, string name):
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces]
import Console from august.io
import Logger from logging
Greeter(resolve Logger logger) implements IGreeter {
    greet(resolve Console console, string name) {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    greet(resolve Console console, string name) uses Console.write
}
```

:::
::::

:::: example-spec
### Its compiled specification

**This text is generated from that component by `aug spec`.** The compiler follows the calls and links the dependency contracts. Author comments supply the description of its purpose.

### `Greeter` · class · [source](examples/hello/app/greeter.md#source-L8) {#symbol-Greeter}

Welcomes a user through the configured logger. It implements [`IGreeter`](examples/hello/app/greeter.md#symbol-IGreeter). The `logger` dependency is injected as [`Logger`](examples/hello/logging/logger.md#symbol-Logger) and stored read-only (the application logger, injected when resolved).

#### `Greeter.greet` · [source](examples/hello/app/greeter.md#source-L13) {#symbol-Greeter.greet}

Prints a personalized greeting. It takes `name` as a string. It gets `console` ([`Console`](examples/hello/dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](examples/hello/dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

It passes the text `Hello, {name}!` to [`logger.log`](examples/hello/logging/logger.md#symbol-Logger.log), using injected `console`. [source](examples/hello/app/greeter.md#source-L14)

::: details Checked interface

```text
greet(resolve Console console, string name) returns void uses Console.write
```

It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](examples/hello/dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](examples/hello/dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

[Read the full explanation](examples/hello/app/greeter.md#specification)
::::
:::::

The application resolves `Greeter` and calls `greet(name="AugScript")`. The configured logger prints:

```text
Hello, AugScript!
```

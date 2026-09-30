// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
import Audit from interceptors
import Positive from interceptors
import AddOne from interceptors
/**
* Prints a number and returns its label.
* @param x The numeric input, validated and incremented by the chain.
* @param label Text forwarded through each layer unchanged.
*/
[Audit]
[Positive(y=x)]
[AddOne(y=x)]
describe(resolve Logger logger, resolve Console console, int x, string label) returns string uses Console.write {
    console.write(value=x)
    return label
}
interface IGreeter {
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
}
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter {
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write {
        return "Hello, " + name + "!"
    }
}

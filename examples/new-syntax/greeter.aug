// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter {
    greet(resolve Console console, string name) uses Console.write {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    greet(resolve Console console, string name) uses Console.write
}

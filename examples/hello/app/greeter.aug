// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
/**
* Welcomes a user through the configured logger.
* @param logger The application logger, injected when resolved.
*/
Greeter(resolve Logger logger) implements IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write
}

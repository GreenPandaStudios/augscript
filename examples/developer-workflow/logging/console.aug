import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) uses Console.write {
        console.write(value=message)
    }
}

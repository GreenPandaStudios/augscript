import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) uses Console.write {
        console.write(value=message)
    }
}

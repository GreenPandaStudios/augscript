import Console from august.io
/** Writes a message to the application log. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}
/** Console logger shared by interceptor instances and the application. */
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) uses Console.write {
        console.write(value=message)
    }
}

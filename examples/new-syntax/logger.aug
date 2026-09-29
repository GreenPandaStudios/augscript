import Console from august.io
/** Displays application messages. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}

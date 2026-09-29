import Console from august.io
/** Receives a message describing an application operation. */
interface Logger {
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
}

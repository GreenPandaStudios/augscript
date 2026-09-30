// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Writes messages to an application log. */
interface Logger {
    /**
    * Writes one message.
    * @param message Text to write.
    */
    log(resolve Console console, string message) uses Console.write
}

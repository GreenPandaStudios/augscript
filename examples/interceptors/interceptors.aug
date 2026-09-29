import Console from august.io
import Logger from logging
/** Raised when a numeric input fails validation. */
ValidationError(string message) implements Error {
    pass
}
/**
* Logs before and after a successful call.
* Generic T is inferred from the annotated function or constructor.
* @param logger Shared application logger, injected for each fresh instance.
*/
interceptor Audit<T>(resolve Logger logger) {
    /** Wrap a call without changing its result. */
    around(resolve Console console) returns T uses Console.write {
        logger.log(message="before")
        T result = next()
        logger.log(message="after")
        return result
    }
}
/** Rejects negative numbers before the target executes. */
interceptor Positive<T>() {
    /**
    * @param y The target argument selected by a mapping such as y=x.
    * @throws ValidationError When the selected value is negative.
    */
    around(int y) returns T unless ValidationError {
        if y < 0 {
            throw ValidationError(message="value must be nonnegative")
        }
        return next()
    }
}
/** Adds one to the selected input before forwarding the call. */
interceptor AddOne<T>() {
    /** @param y The input to increment. */
    around(int y) returns T {
        return next(y=y + 1)
    }
}

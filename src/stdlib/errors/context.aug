// aug-spec: "context.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Keep the original typed error with an operation name and an authored source location.
 * Concrete catches check the stored cause identity, including nested contexts.
 * @param operation Describe the failed application operation; do not include secrets.
 * @param cause Original checked error; its identity and public fields are retained.
 * @param location Source identity, one-based line and column captured with sourceLocation().
 */
error ContextError<E implements Error>(string operation, E cause, Tuple<string, int, int> location)

/** Add context deliberately. Constructing context does not throw or log; the caller chooses to throw the result.
 * @param cause Retain the concrete cause type; no blanket Error conversion occurs.
 * @param operation Name the operation whose failure you are explaining.
 * @param location Capture sourceLocation() at the caller, not inside this helper.
 */
errorContext<E implements Error>(E cause, string operation, Tuple<string, int, int> location):
    return ContextError<E>(operation, cause, location)

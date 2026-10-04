// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
import ServerControl from web
import block and observe from work
/** A disposable qualification endpoint; the body holds synthetic test configuration. */
endpoint POST "/slow" as slow(HttpRequest request from request) returns string:
    configuration = request.body.text()
    scope:
        pending = start worker block(configuration)
        wait for pending
    return "finished"
endpoint POST "/stop" as stop(resolve ServerControl control) returns string:
    control.stop(milliseconds=100)
    return "stopping"

endpoint POST "/observe" as observing(HttpRequest request from request) returns bool:
    configuration = request.body.text()
    scope:
        observation = start worker observe(configuration)
        return wait for observation

// aug-spec: "work.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Pool and Connection and Result and NativeDatabaseStorage and acquire and query and text from postgres
/** Resources are created and disposed on the worker; HTTP remains on its event loop. */
block(string configuration):
    storage = NativeDatabaseStorage()
    own Pool pool = storage.open(configuration=configuration + " application_name=aug-qualification-http", maximum=1, connectMilliseconds=2000, cleanupMilliseconds=100)
    borrow pool:
        own Connection connection = acquire(pool)
        borrow connection:
            own Result result = query(connection, sql="SELECT pg_sleep(5)", parameters=[], milliseconds=6000, maximumRows=1, maximumBytes=4096)

observe(string configuration) returns bool:
    storage = NativeDatabaseStorage()
    own Pool pool = storage.open(configuration, maximum=1, connectMilliseconds=2000, cleanupMilliseconds=100)
    borrow pool:
        own Connection connection = acquire(pool)
        borrow connection:
            own Result result = query(connection, sql="SELECT count(*) FROM pg_stat_activity WHERE application_name='aug-qualification-http' AND state='active' AND query='SELECT pg_sleep(5)'", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            return text(result, row=0, column=0) == "1"

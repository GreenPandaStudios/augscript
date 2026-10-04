import Pool and Connection and Result and NativeDatabaseStorage and acquire and query and rows and text and isNull and sqlState and PostgresError from postgres
verify(bool condition):
    if not condition:
        throw FileError()
abandon(borrow Pool pool):
    own Connection connection = acquire(pool)
    borrow connection:
        own Result created = query(connection, sql="CREATE TEMP TABLE rollback_probe (id int)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
        own Result begin = query(connection, sql="BEGIN", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
        own Result inserted = query(connection, sql="INSERT INTO rollback_probe VALUES (9)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
exerciseTransactions(string configuration) returns string:
    storage = NativeDatabaseStorage()
    own Pool pool = storage.open(configuration, maximum=1, connectMilliseconds=2000, cleanupMilliseconds=200)
    borrow pool:
        abandon(pool)
        own Connection connection = acquire(pool)
        borrow connection:
            own Result rolledBack = query(connection, sql="SELECT count(*) FROM rollback_probe", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            verify(condition=text(result=rolledBack, row=0, column=0) == "0")
            full = false
            try:
                own Connection second = acquire(pool)
            catch PostgresError error:
                full = error.code == -4
            verify(condition=full)
            own Result created = query(connection, sql="CREATE TEMP TABLE transaction_probe (id int PRIMARY KEY)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result begin = query(connection, sql="BEGIN", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result inserted = query(connection, sql="INSERT INTO transaction_probe VALUES (1)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result saved = query(connection, sql="SAVEPOINT attempt", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            rejected = false
            try:
                own Result duplicate = query(connection, sql="INSERT INTO transaction_probe VALUES (1)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            catch PostgresError error:
                rejected = sqlState(error) == "23505"
            verify(condition=rejected)
            own Result restored = query(connection, sql="ROLLBACK TO SAVEPOINT attempt", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result locked = query(connection, sql="SELECT pg_advisory_xact_lock(23)", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result committed = query(connection, sql="COMMIT", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            own Result selected = query(connection, sql="SELECT count(*), NULL::text, ''::text FROM transaction_probe", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            verify(condition=rows(result=selected) == 1 and text(result=selected, row=0, column=0) == "1" and isNull(result=selected, row=0, column=1) and not isNull(result=selected, row=0, column=2))
    return "PostgreSQL transaction recovery passed"
timeout(borrow Pool pool):
    own Connection connection = acquire(pool)
    borrow connection:
        rejected = false
        try:
            own Result delayed = query(connection, sql="SELECT pg_sleep(5)", parameters=[], milliseconds=50, maximumRows=1, maximumBytes=4096)
        catch PostgresError error:
            rejected = error.code == -3
        verify(condition=rejected)
exerciseDeadline(string configuration) returns string:
    storage = NativeDatabaseStorage()
    own Pool pool = storage.open(configuration, maximum=1, connectMilliseconds=2000, cleanupMilliseconds=200)
    borrow pool:
        timeout(pool)
        own Connection connection = acquire(pool)
        borrow connection:
            own Result healthy = query(connection, sql="SELECT 42", parameters=[], milliseconds=1000, maximumRows=1, maximumBytes=4096)
            verify(condition=text(result=healthy, row=0, column=0) == "42")
    return "PostgreSQL deadline and reconnect passed"

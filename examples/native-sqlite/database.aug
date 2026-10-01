// aug-spec: "database.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2"

/** Store a bound value in an in-memory SQLite database and read it back. */
storedName() returns string unless SqliteError:
    own Database database = openMemory()
    borrow database:
        execute(database, sql="CREATE TABLE users (name TEXT NOT NULL)", parameters=[])
        execute(database, sql="INSERT INTO users (name) VALUES (?)", parameters=["August"])
    return queryScalar(database, sql="SELECT name FROM users", parameters=[])

test storedName:
    when database:
        it inserts_and_queries_bound_data:
            assert(storedName() == "August")

// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.3"

try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)

// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310"

try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)

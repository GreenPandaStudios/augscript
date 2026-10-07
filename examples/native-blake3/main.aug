// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"

try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)

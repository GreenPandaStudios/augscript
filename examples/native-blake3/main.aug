// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.1"

try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)

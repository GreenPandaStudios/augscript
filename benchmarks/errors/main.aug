// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import validate from operations
int iterations = 20000
int index = 0
int checksum = 0
int failures = 0
while index < iterations:
    try:
        checksum = checksum + validate(value=index)
    catch FileError error:
        failures = failures + 1
    index = index + 1
print(value=checksum)
print(value=failures)

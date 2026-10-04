// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
validate(int value) returns int unless FileError:
    if value - (value / 16) * 16 == 0:
        throw FileError()
    return value

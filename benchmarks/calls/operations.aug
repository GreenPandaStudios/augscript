// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
step(int value) returns int:
    int product = value * 48271 + 1
    return product - (product / 2147483647) * 2147483647

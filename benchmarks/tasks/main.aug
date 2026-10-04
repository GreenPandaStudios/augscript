// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import compute from operations
int iterations = 2000
int index = 0
int checksum = 0
while index < iterations:
    scope:
        first = start compute(value=index)
        second = start compute(value=index + 1)
        wait for first and second to left and right
        checksum = checksum + left + right
    index = index + 1
print(value=checksum)

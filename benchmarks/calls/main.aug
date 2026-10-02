// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import step from operations
int iterations = 200000
int state = 123
int index = 0
while index < iterations:
    state = step(value=state)
    index = index + 1
print(value=state)

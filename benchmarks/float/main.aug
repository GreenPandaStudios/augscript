// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 1000000
float sum = 0.0
int index = 0
while index < iterations:
    int remainder = index - (index / 8) * 8
    sum = sum + remainder * 0.125 + 0.5
    index = index + 1
print(value=sum == 937500.0)
print(value=iterations)

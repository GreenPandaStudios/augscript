// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 100000
own List<int> values = []
int index = 0
while index < iterations:
    values.append(value=index * 3)
    index = index + 1
int checksum = 0
for value in values:
    checksum = checksum + value
print(value=checksum)

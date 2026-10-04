// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 4000
own Map<int, int> entries = {}
int index = 0
while index < iterations:
    entries.set(key=index, value=index * 3)
    index = index + 1
index = 0
while index < iterations:
    entries.take(key=index)
    index = index + 2
index = 0
while index < iterations:
    entries.set(key=index, value=index * 7)
    index = index + 1
int checksum = 0
int position = 1
for (key, value) in entries:
    checksum = checksum + key * position + value
    position = position + 1
print(value=checksum)
print(value=entries.length())

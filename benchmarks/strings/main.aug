// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 20000
int index = 0
int checksum = 0
while index < iterations:
    parts = "August,clear,local,checked".split(separator=",")
    for part in parts:
        checksum = checksum + part.length()
    index = index + 1
print(value=checksum)

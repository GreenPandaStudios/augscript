// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Item from data
int iterations = 50000
own List<Item> values = []
int index = 0
while index < iterations:
    values.append(value=Item(id=index, name="August"))
    index = index + 1
int checksum = 0
for item in values:
    checksum = checksum + item.id
print(value=checksum)

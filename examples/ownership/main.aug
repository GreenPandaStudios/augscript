// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())

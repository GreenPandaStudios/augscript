// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter {
    counter.value = 2
}
print(value=counter.value)

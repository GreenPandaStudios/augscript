// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
Counter(mutable int value) implements ICounter {
    increment() {
        borrow self {
            value = value + 1
        }
    }
    read() {
        return value
    }
}
interface ICounter {
    increment() changes self
    read() returns int
}

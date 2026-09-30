// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
Counter(mutable int value) implements ICounter {
    increment() changes self {
        borrow self {
            value = value + 1
        }
    }
    read() returns int {
        return value
    }
}
interface ICounter {
    increment() changes self
    read() returns int
}

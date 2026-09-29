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

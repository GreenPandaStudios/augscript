// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter {
    format<T>(T value) returns string
    title() {
        return "formatted"
    }
}
TextFormatter() implements Formatter {
    format<T>(T value) {
        return "generic method called"
    }
}
Box<T>(T value) implements IBox<T> {
    get() {
        return value
    }
}
interface IBox<T> {
    get() returns T
}

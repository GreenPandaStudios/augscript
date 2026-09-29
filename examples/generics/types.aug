interface Formatter {
    format<T>(T value) returns string
    title() returns string {
        return "formatted"
    }
}
TextFormatter() implements Formatter {
    format<T>(T value) returns string {
        return "generic method called"
    }
}
Box<T>(T value) implements IBox<T> {
    get() returns T {
        return value
    }
}
interface IBox<T> {
    get() returns T
}

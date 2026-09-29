load(bool fail) returns string unless FileError {
    if fail {
        throw FileError()
    }
    return "loaded"
}

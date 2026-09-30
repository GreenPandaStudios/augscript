// aug-spec: "errors.aug.md" explains this file. Read it before changes; refresh with aug spec.
load(bool fail) {
    if fail {
        throw FileError()
    }
    return "loaded"
}

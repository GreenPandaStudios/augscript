// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
Resource() implements IResource {
    drop() {
        pass
    }
}
interface IResource {
    pass
}
make() returns own Resource {
    own Resource value = Resource()
    return value
}
consume(resolve Console console, own Resource value) {
    console.write(value="consumed")
}

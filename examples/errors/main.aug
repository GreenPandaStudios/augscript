// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import load from errors
try {
    print(value=load(fail=true))
}
catch FileError error {
    print(value="caught FileError")
}

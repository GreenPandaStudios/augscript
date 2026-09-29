import load from errors
try {
    print(value=load(fail=true))
}
catch FileError error {
    print(value="caught FileError")
}

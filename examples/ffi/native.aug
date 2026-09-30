// aug-spec: "native.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C puts(string message) returns c_int
announce() uses C.puts {
    unsafe {
        puts(message="hello from C FFI")
    }
}

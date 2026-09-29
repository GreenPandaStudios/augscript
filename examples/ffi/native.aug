extern C puts(string message) returns c_int
announce() uses C.puts {
    unsafe {
        puts(message="hello from C FFI")
    }
}

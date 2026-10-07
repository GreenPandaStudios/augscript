// aug-spec: "hashing.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"

/** Hash UTF-8 text with the real Rust BLAKE3 implementation. */
hashText(string value) returns string unless HashError:
    return hash(input=value.bytes())

test hashText:
    when vectors:
        it matches_the_published_abc_vector:
            assert(hashText(value="abc") == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85")

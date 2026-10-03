// aug-spec: "compression.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"

/** Compress text with zlib, then restore its bytes within a fixed output limit. */
roundTrip() returns Bytes unless CompressionError:
    Bytes input = "The world runs on language".bytes()
    Bytes compressed = compress(input)
    return decompress(input=compressed, maximumOutput=4096)

test roundTrip:
    when compression:
        it preserves_the_original_bytes:
            Bytes restored = roundTrip()
            assert(restored.text() == "The world runs on language")
            assert(restored.length() == 26)

// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"

try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")

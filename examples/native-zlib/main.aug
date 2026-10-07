// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"

try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")

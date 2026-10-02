// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4"

try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)

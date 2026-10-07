// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702"

try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)

// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"

try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)

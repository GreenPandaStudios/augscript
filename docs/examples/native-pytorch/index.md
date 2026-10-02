---
title: "CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU tensors with PyTorch

Add two CPU tensors with LibTorch and check the elements and sum. Owned tensors are released at scope exit.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

This project runs with August `0.21.0` on macOS 14+ with Apple Silicon, or GNU/Linux x64 or ARM64 with glibc 2.36+. The CLI obtains the verified compiler and library artifacts automatically.

## Project files

- [`main.aug`](main.md)
- [`tensors.aug`](tensors.md)


## Try this project

[Download this project](/downloads/native-pytorch.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-pytorch
aug install .
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

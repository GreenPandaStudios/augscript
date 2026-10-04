# GPU workers

This example adds two pairs of vectors on a real Metal GPU. It requires the August 0.23.0 preview, Apple Silicon, macOS 14 or later, and an available Metal device.

With that preview installed, run `aug run` in this folder. August obtains the source package and verified native adapter through the ordinary public repository import. You do not need Xcode or a separate native compiler.

The output is `5`, `7`, `9`, `11`, and `22`, each on its own line. Each worker owns its device and buffers and returns copied values. A native failure prints its checked error and exits unsuccessfully. There is no CPU fallback.

`compute.aug.md` and `main.aug.md` explain the checked source. The package documentation and supported targets are at https://github.com/GreenPandaStudios/aug-gpu.

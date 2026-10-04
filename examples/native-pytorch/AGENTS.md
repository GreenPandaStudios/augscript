# Working on this August project

Read each file's adjacent `.aug.md` before editing; change `.aug` source and regenerate with `aug spec .`.
This project imports real CPU LibTorch through a tagged public package. Keep dependency versions and native ownership explicit. Do not replace native operations with a mock.
Use the August 0.21.0 LLVM preview on macOS 14+ ARM64. Run `aug install .`, `aug check .`, `aug test .`, and `aug run .`. Consumer installation must not invoke native build scripts.

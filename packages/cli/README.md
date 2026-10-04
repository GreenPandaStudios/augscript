# August CLI

Install the compiler with Node.js 24 or later and npm:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init my-app
cd my-app
aug run
```

The starter includes an interface, implementation, same-file test, and AGENTS.md. `aug run` installs source dependencies, checks the project, prepares its verified LLVM/runtime pack, compiles it, and starts it. Supported hosts are macOS 14+ ARM64 and GNU/Linux x64/ARM64 with glibc 2.36+. Consumers need no separate native compiler, LLVM installation, or SDK. `--backend c` retains the migration reference for contributor comparisons.

Use `aug init weather --template weather` for the simulated weather API, or `aug package init arithmetic` for a library. Add public Git sources with `aug add URL --as NAME`, or import a quoted URL directly. Optional JSON, web, and crypto libraries use this package system; core I/O remains under `august.io`.

The package supplies `aug`, `aug-cli`, and `aug-native`. Pin a release for reproducible builds and commit aug.lock.json. Read [the book](https://greenpandastudios.github.io/augscript/learn/), [packages](https://greenpandastudios.github.io/augscript/packages), and [the weather guide](https://greenpandastudios.github.io/augscript/weather-api). August is experimental; check [readiness](https://greenpandastudios.github.io/augscript/production-readiness) before deploying it.

# August qualification gyms

Run `npm run test:gyms` with a prepared LLVM maintainer pack in `AUG_LLVM_HOME`. The default seed is 877966 and each generator adds 256 vectors to fixed edge cases. Use `--seed NUMBER --vectors NUMBER` to vary the bounded domain. Invalid or empty domains fail rather than reporting success.

`npm run test:gyms:full` also runs source mutation, ownership/concurrency, native boundaries, package integrity, HTTP boundaries and sanitizer circuits. The sanitizer circuit needs the maintainer Clang selected with `AUG_SANITIZER_CC`.

Reports go to ignored `.aug-build/gyms/results.json`; sources and expected output are saved under `.aug-build/gyms/replays`. A report embeds source units, seed, generator version, compiler source identity, platform, outcomes and mutations. Reproduce a case with the normal CLI: `node bin/aug.mjs run PATH --backend llvm`. A different source revision requires a fresh report.

Do not derive an oracle from compiler output or compiled specs. Each positive program and valid behavioral mutant must run safely in both modes. The original must match its independent result; the mutant must differ. Keep rejected contracts and instrumented-memory checks separate. Record skips and unsupported areas explicitly. A passing finite gym is not a proof of arbitrary program safety.

See the [public explanation](../docs/safety-gyms.md) and [maintainer workflow](../docs/contributing-benchmarks.md#run-the-safety-gyms).

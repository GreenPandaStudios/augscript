# Publish an August library

An August release is a tagged source repository. Consumers use its public URL, and their lock records the selected commit. Your repository owns the API, tests, license and any native artifact requirements.

Use August 1.0 for the maintainer commands below. A generated workflow pins the compiler that created it; review that pin before enabling CI.

## Prepare the source

Create a library with `aug package init arithmetic`. Put its public declarations in `src/export.aug`, document them with Javadoc, and keep tests beside their implementations. Choose a license and include it in the repository. The starter does not choose a license for you.

Run these commands from the library folder:

```sh
aug install
aug check
aug test
aug spec
aug package check
```

Review and commit the source, `main.yaml`, `aug-package.json`, `aug.lock.json`, adjacent `.aug.md` files and `.aug-spec` output. Commit `package.json` if you use npm transport. Generated specs must be present in the tag, even if your local ignore rules would hide them. Keep `.aug-build` and `.aug-packages` out of Git.

`package check` checks public documentation, exports, license, compiler compatibility and test bodies. It does not execute tests. `aug test` provides that separate behavioral result.

## Add CI

Preview a repository-root workflow, then create it:

```sh
aug package workflow
aug package workflow --write
```

The default prints YAML without changing the project. `--write` creates `.github/workflows/august.yml` and refuses to replace an existing file or write through a linked directory. Review the template and commit it. A nested monorepo package needs an explicit workflow with its own working directory; this template diagnoses that case.

The workflow pins the compiler that generated it and reviewed GitHub Actions commits. It restores the committed dependency graph with `aug install --frozen`, checks source and spec drift, then runs same-file tests through LLVM. Tests run in a copy under the runner's temporary directory, so host-specific compiler-pack additions do not change the tagged lock. Failed jobs retain the available reports. The workflow has read-only repository permissions and neither publishes packages nor executes native build recipes.

Source libraries start with a GNU/Linux x86-64 job. Native libraries get jobs for their declared macOS ARM64 and GNU/Linux ARM64/x86-64 targets. The matrix selects a runner; passing tests provide evidence for that runner. A declaration alone does not qualify its CPU, operating-system or C++ runtime requirements. The bounded template accepts baseline CPUs, macOS artifact floors through 15.0, and GNU/Linux artifacts requiring at most glibc 2.36. It checks the ordinary C++ ABI selector and rejects explicit hardware features. Other requirements need a maintainer-written workflow.

Before tagging a native library, run `aug spec` followed by `aug install` on each supported host and commit the resulting host selections in the lock. Frozen CI rejects absent or stale selections. Publish the pinned native archives before enabling consumer qualification. Artifact production, ABI header checks, allocator tests and redistribution review belong in the library's native maintainer workflow; this template checks consumption of those artifacts.

## Review the tag

Set the manifest version, finish verification, and commit before making the tag. For a `0.1.0` package:

```sh
# Commit the reviewed files first.
git tag v0.1.0
aug package release --tag v0.1.0
aug package release --tag v0.1.0 --json
```

The tag must match the package version and point to `HEAD`. The report rejects uncommitted or untracked release inputs, stale specs, changed source inventories, and mismatched native host selections. It records source hashes, the semantic revision, the exact dependency lock, expanded public contracts, declared native requirements and verified cached host files. Missing or damaged native bytes make the review fail without downloading replacements.

The report does not run tests or publish anything. Its JSON records those limits, including platforms that this machine has not qualified. Tagged CI retains the report alongside its concrete test results. Review both before publishing. Passing a finite test suite does not establish every possible behavior.

Once you decide to publish, push the reviewed commit and tag through your normal repository process. Consumers can then use an ordinary import. This fragment uses a placeholder repository URL:

```text
import add from "https://github.com/example/arithmetic#v0.1.0"
```

They can also give that URL a [local alias](packages.md#use-a-package). You do not need a separate August package registry.

# Package compatibility

A package states which compilers can check its source and which machines can run its native libraries. The project lock records the exact inputs used. These are different promises: a library can support several compiler releases, while an application build still uses one exact compiler.

**Unreleased:** compiler ranges, immutable source snapshots and interrupted-install recovery described here are implemented in the next compiler. Published August 0.23.0 accepts only an exact `compiler` value. The public ABI below records its existing native calling convention; the adapter header ships with the next CLI.

## State a compiler requirement

`aug package init` writes the current exact compiler version. Keep that value until you have tested another compiler. To support more releases, edit `compiler` in `aug-package.json`. This is a manifest fragment:

```json
{
  "format": 1,
  "name": "@example/arithmetic",
  "version": "0.1.0",
  "compiler": "~0.23.0",
  "source": "src",
  "dependencies": {}
}
```

| Requirement | Accepted compilers |
| --- | --- |
| `0.23.0` | Exactly 0.23.0. An exact prerelease such as `1.0.0-rc.1` is also allowed. |
| `~0.23.0` | 0.23.0 and later patches below 0.24.0. |
| `^0.23.0` | The same preview minor: 0.23.0 through versions below 0.24.0. `^0.0.3` accepts only 0.0.3. |
| `^1.2.3` | 1.2.3 and later releases below 2.0.0. |
| `>=0.23.0 <0.25.0` | The explicitly bounded interval, including 0.24 releases. Use it only after testing both preview minors. |

Ranges exclude prereleases. Wildcards, partial versions, unbounded intervals, build metadata and alternative ranges are rejected. A range declares the author's compatibility promise; it does not make source from another compiler valid. August still checks the entire imported program.

First-party CLI and bundled stdlib packages retain their exact shared version. Compiler/runtime packs also remain exact. A public native adapter that satisfies `aug-native-abi-1` can be reused when its package's compiler requirement, binding descriptor and target requirements all permit it. The managed runtime's internal ABI cannot be reused this way.

## Upgrade without changing dependency revisions

Install the new compiler, then run `aug install`. The installer checks each library's compiler requirement, preserves already locked Git commits and checks the selected native artifacts. It replaces the lock's exact compiler identity and discards compiler/runtime pack selections from the old compiler. The next build records the new pack.

Use `aug install --update` when you also intend to select newer repository revisions. Adding a dependency preserves the commits of existing requests. A frozen install requires the current compiler and dependency declarations to match the lock; it cannot perform a compiler upgrade. An incompatible library reports its name, requirement and installed compiler. Choose a compatible library release or compiler before retrying.

After upgrading, run the application's checks and tests and rebuild its executable. Native deployment consists of that executable and its neighboring `lib` and `share` directories; do not substitute libraries from another build. The [native package guide](native-packages.md) explains target selection and relocation.

## Published formats

These versioned formats are the candidate contracts for 1.0. Changing a native calling convention requires a new ABI profile. Changing the meaning of a required manifest or lock field requires a new format. A new compiler must diagnose an unsupported format rather than guessing its meaning.

| File | Format | Required information |
| --- | --- | --- |
| `aug-package.json` | `1`, source package | Package `name`, exact package `version`, `compiler` requirement and relative `source` folder containing `export.aug`. Optional `dependencies` maps local aliases to package requests. |
| `aug-package.json` | `2`, native package | The source fields plus `native`: ABI profile, binding file/digest, upstream identity, platform artifacts and optional explicit source-build metadata. |
| `native.abi.json` | `1`, profile `aug-native-abi-1` | Resource/release declarations and function contracts: physical symbol, labeled inputs, outputs, status, error, ownership, capabilities, mutation and thread permission. |
| `aug.lock.json` | `1` | Exact `compiler`, requested `specifications`, root aliases, checked package entries with source digests and resolved dependency paths, registry integrity, and Git revisions. `native` optionally records target and compiler/runtime selections. |
| Native artifact file manifest | `1` | Exact regular-file paths and SHA-256 digests. The downloaded archive has its own SHA-256 and size bounds. |

Package versions and registry requests stay exact; compiler requirements do not introduce package-version resolution ranges. An installed path is an opaque, project-relative address under `.aug-packages`. Tools must read it from the lock rather than construct it. Cache paths, layout and temporary recovery files are not public formats.

Two copies of the same package name and version must have identical source and resolved dependency identities. Conflicting copies reject installation. Native libraries also reject incompatible required components with the same compatibility key. August does not choose a different library version or execute a repair script to resolve these conflicts.

## Interrupted installs and readers

The installer builds a complete source candidate and verifies its native artifacts before accepting the new lock. New source generations have separate directories. The lockfile changes with one rename after the generation is available, so a compiler that already read the old lock can finish reading its old source. Downloads and extraction failures leave that accepted revision unchanged. If the accepted lock or dependency declarations change while a candidate is being prepared, publication stops and preserves that edit.

The next install can recover a terminated writer. `aug add` also journals its configuration change: recovery restores the previous aliases if no new lock was published, or retains the aliases if publication completed. If you edited the journaled configuration or lock afterward, recovery stops and names the files to inspect. It does not overwrite those edits. Read-only checks never perform recovery; use `aug install` or `aug run` first.

The process-interruption tests kill installers on both sides of publication. They do not qualify storage-device failure or sudden power loss. Older format-1 locks with fixed cache paths remain readable and can be restored with `--frozen`, including repeated identical native selections; conflicting selections still fail. Run an ordinary install to move them to immutable generations. Do not run different CLI versions as concurrent writers in one project.

Old generations and abandoned staging directories are retained. When no build or editor is using the project, removing `.aug-packages` and `.aug-install-*` reclaims them; `aug install --frozen` restores the active graph from its original sources or verified caches. Keep `aug.lock.json`. A local folder dependency still requires that folder, and offline restoration requires every requested input to have been cached.

Changed installed source is an error during checking and running. An explicit install can restore it from verified inputs. Native caches are immutable by archive digest and are checked again before use; a corrupted native cache must be removed and installed again.

## Qualification

Contributors run `npm run test:compatibility`. Its regressions cover bounded compiler requirements, preserved revisions during upgrades and additions, package conflicts, offline/frozen restoration, concurrent terminated-writer recovery, source readers, native download rejection and configuration recovery. Maintainer header tests compare the public ABI to actual C declarations and reject layout/signature changes. Linux qualification requires these header checks to run with the selected Clang.

The release workflows also run real repository imports and LLVM programs on macOS ARM64 and GNU/Linux ARM64/x86-64, then execute relocated deployment bundles without consumer toolchains. Installed npm tests check compiler ranges from a packed library and ensure the ABI header ships. Those platform gates must pass again for the 1.0 candidate; passing local regressions alone does not complete release qualification.

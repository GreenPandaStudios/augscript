# Release validation

A release must validate the language, native runtime, installed packages, editor, and documentation together. This page describes the review requirements; the [release process](releasing.md) supplies the publication commands and platform jobs.

Review source changes against their intended behavior and contributor standards. Resolve findings with concrete regressions where behavior is affected. A review summary names its scope and remaining limitations; it does not claim correctness for code or platforms that were not examined.

The release gates include type checking, language and runtime regressions, LLVM backend parity, sanitizer circuits, clean installed-CLI/native-library consumers, package and extension checks, executable documentation examples, and documentation drift/site checks. Preserve the exact candidate identity and failed reports when a gate rejects a release. Run the repaired candidate through the required gates again.

August 0.23.0 is a published preview. Its [platform matrix](compatibility.md) covers three qualified hosts; [performance](performance.md) and [safety gyms](safety-gyms.md) publish measured results. HTTP conformance, identity-provider hardening and unsupported targets remain subject to the [known limits](web-library-gaps.md) and [roadmap](roadmap.md).

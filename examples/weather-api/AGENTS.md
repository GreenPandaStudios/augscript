# Working on this August project

Start in main.aug. It shows the imports, dependency bindings, and application startup.
Read the adjacent .aug.md specification before changing a source file. Generate missing
or stale explanations with aug spec; they describe checked behavior and link dependencies.

Keep tests in the file that declares the behavior. Run aug check, aug test, and aug spec
after a change, and use aug run to compile and run the application. Run prepares required
source packages and native libraries. Commit aug.lock.json; do not edit .aug-packages.

Use labeled inputs, narrow export.aug files, and underscore-prefixed private helpers.
Leave return types, effects, and errors to inference when an executable body provides
the answer. Bodyless interfaces still declare their contracts. Use borrow for mutation,
and keep unsafe native calls inside small adapters. Explain intent in Javadoc when it
is not evident from the code. Follow the existing indentation or brace style.

Language guide: https://greenpandastudios.github.io/augscript/

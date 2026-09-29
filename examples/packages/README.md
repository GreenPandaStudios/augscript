# Author and consume an August package

From the repository root:

```sh
node bin/aug.mjs check examples/packages/math
node bin/aug.mjs test examples/packages/math
node bin/aug.mjs package pack examples/packages/math
node bin/aug.mjs install examples/packages/app --offline
node bin/aug.mjs run examples/packages/app
```

The application prints `42`. It imports the library through the `math` alias in `main.yaml` and sees only `math/src/export.aug`. Installation copies a snapshot into `.aug-packages`; reinstall after editing the local library. Commit the generated `app/aug.lock.json` when adopting this pattern in your own project; this teaching example intentionally creates its lock on your host.

To create your own library, use `aug package init my-library --name @your-npm-name/my-library`. Test it and pack it, then publish the resulting `.tgz` with npm if you own that namespace. Consumers use an exact `npm:@your-npm-name/my-library@0.1.0` specification and keep the same August import spelling. See [the package guide](../../docs/packages.md).

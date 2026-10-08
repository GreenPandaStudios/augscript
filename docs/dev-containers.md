# Develop in a VS Code Dev Container

The August build image also serves as a development container. It includes the CLI, matching standard library and prepared LLVM compiler/runtime. You need Docker with a running Linux engine, VS Code and Microsoft's [Dev Containers extension](https://code.visualstudio.com/docs/devcontainers/containers).

Open an existing August project, create one with [the CLI](getting-started.md), or download a [complete example](examples/index.md). Save one file, `.devcontainer/devcontainer.json`, in that project:

```json
{
  "name": "August",
  "image": "ghcr.io/greenpandastudios/aug-build:1.0.0",
  "remoteUser": "node",
  "updateRemoteUserUID": true,
  "init": true,
  "postCreateCommand": "aug install . && aug check .",
  "customizations": {
    "vscode": {
      "extensions": ["augscript.augscript"]
    }
  },
  "forwardPorts": [8080],
  "portsAttributes": {
    "8080": { "label": "August HTTP" }
  }
}
```

## Open and run it

Choose **Dev Containers: Reopen in Container** from VS Code's Command Palette. Docker pulls the correct ARM64 or x86-64 image. The creation command installs your project's dependencies and checks it; the compiler is already in the image. VS Code installs the August extension in the container.

Use the terminal in that window:

```sh
aug run
aug test
aug spec
aug spec . --check
```

The starter prints `Hello, August!`, its test passes and spec generation writes the neighboring explanations. The image's `node` user owns its compiler cache. On Linux, Dev Containers adjusts that user's ID and home-directory ownership to match the local user. See [non-root containers](https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user).

Keep the project in a writable directory shared with your Docker engine. A remote engine cannot mount a directory that exists only on your client; see [bind mount constraints](https://docs.docker.com/engine/storage/bind-mounts/#considerations-and-constraints). Edits and generated specifications stay in the mounted project. Linux executables built there run inside the container.

To update the environment, change the image tag and choose **Dev Containers: Rebuild Container**. Keep the editor's bundled compiler compatible with your project's CLI. Container rebuilding can discard downloads added after image creation; the base compiler remains prepared, and `aug install` restores project packages.

## Run an HTTP service

Run `aug run` for the [health service](docker.md#deploy-an-http-application). The configuration forwards port 8080; follow its address in VS Code's **Ports** view. Add other ports to `forwardPorts` as needed. The weather starter uses 8787 instead.

VS Code forwarding and Docker's deployed port mapping are separate. A deployed service needs `web.host: 0.0.0.0`, as shown in [the Docker guide](docker.md). See the [Dev Container reference](https://containers.dev/implementors/json_reference/#general-devcontainerjson-properties) for lifecycle and forwarding options.

When the project's Linux dependency graph is already locked, use `aug install . --frozen && aug check .` as the creation command. To deploy the application, use the same two-stage [Dockerfile](docker.md#compile-an-existing-project).

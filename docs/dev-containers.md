# Develop in a VS Code Dev Container

Edit your project in VS Code and run the compiler and tests in a Linux container. Your files stay on your machine. The CLI downloads its compiler pack into the container, so no separate native toolchain is needed. These instructions use August 0.21.0.

You need Docker with a running Linux engine, VS Code, and Microsoft's [Dev Containers extension](https://code.visualstudio.com/docs/devcontainers/containers). Creating a new project also needs Node.js 24 and npm on the host. You can instead open an existing project or a [downloaded example](examples/index.md).

Keep your project in a writable folder shared with the Docker engine. If container creation reports that the bind source path does not exist, enable that folder in your engine's file-sharing settings. A remote Docker engine needs a separate workspace-sharing setup; [Docker's bind mount guide](https://docs.docker.com/engine/storage/bind-mounts/#considerations-and-constraints) explains the constraint.

## Create the project and container files

Start a project:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init hello-august
cd hello-august
mkdir .devcontainer
```

Save `.devcontainer/Dockerfile` with these contents. It installs the CLI; the first run obtains the matching compiler/runtime pack and package artifacts.

```dockerfile
FROM node:24-bookworm
ARG AUG_VERSION=0.21.0
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global --ignore-scripts --no-audit --no-fund \
       @greenpandastudios/aug-cli@${AUG_VERSION}
WORKDIR /workspace
USER node
CMD ["sleep", "infinity"]
```

Save `.devcontainer/devcontainer.json` beside it:

```json
{
  "name": "August",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "."
  },
  "remoteUser": "node",
  "updateRemoteUserUID": true,
  "init": true,
  "postCreateCommand": ["aug", "check", "."],
  "forwardPorts": [8080],
  "portsAttributes": {
    "8080": { "label": "August HTTP" }
  }
}
```


## Open and run it

Open `hello-august` in VS Code. From the Command Palette, choose **Dev Containers: Reopen in Container**. The first image build installs the CLI; the first `aug run` downloads its compiler pack. Later opens and runs reuse these inputs. When the container is ready, the configured creation command checks your project.

After opening the container, download the matching 0.21.0 VSIX from [GitHub Releases](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.21.0). Run **Extensions: Install from VSIX…** in that VS Code window and install it in the container. Check the extension version against the CLI; Marketplace availability can lag a release. The bundled compiler and terminal CLI use the same artifact cache. Terminal commands run as the image's `node` user. On Linux, the Dev Container tooling adjusts that user's ID to match your local files. The [non-root user guide](https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user) explains this behavior.

Open a terminal **in that VS Code window** and run:

```sh
aug check .
aug run .
aug test .
aug spec .
aug spec . --check
```

The starter prints `Hello, August!`, its test passes, and spec generation writes the neighboring explanations. You can use `aug` directly because the CLI is installed in the image. Follow [Your first project](getting-started.md) to understand and change the source.

Edits, generated specs, and `.aug-build` remain in the mounted project folder. Native programs built here are Linux executables; run them inside the container. Rebuilding the container keeps your source files and rebuilds the environment. After changing the Dockerfile or CLI version, choose **Dev Containers: Rebuild Container**. Keep the toolchain and editor versions compatible with your project.

## Run an HTTP service

Use the [small HTTP service](docker.md#deploy-an-http-application) or a downloaded [web project](examples/index.md). Run `aug run .` in the container terminal. For a service on port 8080, the configuration forwards that port to your host. Open VS Code's **Ports** view and follow its local address; VS Code may choose a different local port if 8080 is occupied.

Add other listening ports to `forwardPorts` when your application needs them. Editor forwarding and Docker's `--publish` are different mechanisms: VS Code can forward a service listening on the container's loopback address, while a deployed Docker service needs the listening address shown in [the Docker guide](docker.md#deploy-an-http-application). The [Dev Container configuration reference](https://containers.dev/implementors/json_reference/#general-devcontainerjson-properties) describes port forwarding and lifecycle commands.

If the project imports source packages, run `aug install . --frozen` before checking it, and change `postCreateCommand` to `"aug install . --frozen && aug check ."`. Commit the manifest and lockfile. See [packages](packages.md#reproducible-builds) for the workflow.

To package the application for a server, follow [Build and deploy with Docker](docker.md).

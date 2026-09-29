# Docker build and run images

The repository supplies two base images. The **build** image contains Node.js 24, the August compiler, Clang, and portable task/JSON sources. The **run** image is a small Debian userland that runs a compiled August executable as an unprivileged user. Both images currently target core, JSON, and task programs. Full `august.web` and `august.crypto` native dependency bootstrap is macOS-only; the Linux Docker images cannot build or run those applications yet.

Build the images from the repository root:

```sh
docker build -f docker/Dockerfile.build -t augscript/build:0.19.0 .
docker build -f docker/Dockerfile.run -t augscript/run:0.19.0 .
```

Create a project with `aug init my-app`, then compile it for Linux. The mount is writable because `aug build` writes `.aug-build` and generated specifications into the project. The following commands assume your Docker engine can bind-mount your working directory:

```sh
docker run --rm \
  --user "$(id -u):$(id -g)" \
  --mount type=bind,source="$PWD/my-app",target=/workspace \
  augscript/build:0.19.0 build . --out /workspace/.aug-build/program
```

Run that exact executable in the run image:

```sh
docker run --rm \
  --mount type=bind,source="$PWD/my-app/.aug-build",target=/app,readonly \
  augscript/run:0.19.0
```

The run image uses Debian bookworm's C runtime; a binary built with this build image uses the matching base distribution. The run image has no shell command in its entry point and contains no compiler, source, package manager, or application secrets. Supply environment, network, ports, and data mounts for your application when needed. These images are source recipes, not published registry tags. Build or publish them under your own registry name while August's Linux native web/crypto and release pipeline are being completed.

For a reproducible image build without a host bind mount, use a multistage Dockerfile: start with `FROM augscript/build:0.19.0 AS build`, copy the application into `/workspace`, run `aug build /workspace --out /tmp/program`, then start with `FROM augscript/run:0.19.0` and copy `/tmp/program` to `/app/program` with `--chown=august:august`. The repository's [`Dockerfile.smoke`](../docker/Dockerfile.smoke) exercises this pattern with the generated starter.

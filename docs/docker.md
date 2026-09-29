# Docker build and run images

The repository supplies two base images. The **build** image contains Node.js 24, the August compiler, Clang, and the pinned native task, JSON, web, and crypto dependencies. The **run** image is a small Debian userland with the matching native shared libraries and CA certificates. It runs a compiled August executable as an unprivileged user. Build the run image after the build image so both use the same native dependency build.

Build the images from the repository root:

```sh
docker build -f docker/Dockerfile.build -t augscript/build:local .
docker build -f docker/Dockerfile.run -t augscript/run:local .
docker build -f docker/Dockerfile.crypto-smoke -t augscript/crypto-smoke:local .
docker run --rm augscript/crypto-smoke:local
docker build -f docker/Dockerfile.web-smoke -t augscript/web-smoke:local .
docker run --rm -p 127.0.0.1:8080:8080 augscript/web-smoke:local
```

Create a project with `aug init my-app`, then compile it for Linux. The mount is writable because `aug build` writes `.aug-build` and generated specifications into the project. The following commands assume your Docker engine can bind-mount your working directory:

```sh
docker run --rm \
  --user "$(id -u):$(id -g)" \
  --mount type=bind,source="$PWD/my-app",target=/workspace \
  augscript/build:local build . --out /workspace/.aug-build/program
```

Run that exact executable in the run image:

```sh
docker run --rm \
  --mount type=bind,source="$PWD/my-app/.aug-build",target=/app,readonly \
  augscript/run:local
```

The crypto smoke command prints the SHA-256 digest of `abc`. The web smoke image serves `GET /health` on port 8080 and returns `{"status":"ok"}`. The run image uses Debian bookworm's C runtime; a binary built with this build image uses the matching base distribution. The run image has no shell command in its entry point and contains no compiler, source, package manager, or application secrets. Supply environment, network, ports, and data mounts for your application when needed. These images are source recipes, not published registry tags.

For a reproducible image build without a host bind mount, use a multistage Dockerfile: start with `FROM augscript/build:local AS build`, copy the application into `/workspace`, run `aug build /workspace --out /tmp/program`, then start with `FROM augscript/run:local` and copy `/tmp/program` to `/app/program` with `--chown=august:august`. The repository's [`Dockerfile.smoke`](../docker/Dockerfile.smoke) exercises this pattern with the generated starter.

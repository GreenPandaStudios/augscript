# Docker build and run images

Build two local images from the published npm CLI. The **build** image contains Node.js 24, the August compiler, Clang and its sanitizer runtime, and the pinned native task, JSON, web, and crypto dependencies. The **run** image is a small Debian userland with matching native shared libraries and CA certificates. It runs a compiled August executable as an unprivileged user. These are local image recipes; August does not currently publish registry tags for them.

Save this as `Dockerfile.build` in an empty working folder. It installs the published toolchain, then prepares its native dependencies. Pin `AUG_VERSION` to the version used by your application:

```dockerfile
FROM node:24-bookworm
ARG AUG_VERSION=0.19.0
ENV AUG_NATIVE_HOME=/opt/augscript/.aug-native
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       clang libclang-rt-14-dev make cmake m4 autoconf \
       automake libtool python3 zlib1g-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global --ignore-scripts --no-audit --no-fund \
       @greenpandastudios/aug-cli@${AUG_VERSION} \
    && aug-native
WORKDIR /workspace
ENTRYPOINT ["aug"]
CMD ["--help"]
```

Save this as `Dockerfile.run` beside it. Keeping the same native library path preserves the executable's runtime search path:

```dockerfile
FROM augscript/build:local AS native
FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates zlib1g \
    && rm -rf /var/lib/apt/lists/*
COPY --from=native /opt/augscript/.aug-native/prefix/lib /opt/augscript/.aug-native/prefix/lib
RUN groupadd --system august \
    && useradd --system --gid august --home-dir /app august
WORKDIR /app
USER august
ENTRYPOINT ["/app/program"]
```

Build them in that order:

```sh
docker build -f Dockerfile.build -t augscript/build:local .
docker build -f Dockerfile.run -t augscript/run:local .
```

Create your application with the [npx starter](getting-started.md) or download a [complete project](examples/index.md), then compile it for Linux. The mount is writable because `aug build` writes `.aug-build` and generated specifications into the project. The following commands assume your project is named `my-app` and your Docker engine can bind-mount your working directory:

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

The run image uses Debian bookworm's C runtime; a binary built with this build image uses the matching base distribution. It contains the compiled application and native shared libraries. Supply environment, network, ports, and data mounts for your application when needed. The image runs `/app/program`; it has no compiler or application source.

For an application image, save this `Dockerfile` in your project's folder:

```dockerfile
FROM augscript/build:local AS build
COPY . /workspace
RUN aug build /workspace --out /tmp/program
FROM augscript/run:local
COPY --from=build --chown=august:august /tmp/program /app/program
```

Add `.aug-build`, `.aug-packages`, and `node_modules` to `.dockerignore`. Keep keys, credentials, and other local secrets out of the build context. A project with source packages must install them during its build before compiling; see [frozen package installs](packages.md#reproducible-builds).

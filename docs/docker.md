# Build and deploy with Docker

Compile an August application in a Linux build container, then deploy its executable in a separate runtime image. You need Docker with a running Linux engine and a POSIX shell for these commands. The application does not need Node.js or a compiler in its deployed container. For editing and testing inside VS Code, use [a Dev Container](dev-containers.md).

## Prepare the toolchain images

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

The first build downloads and compiles native dependencies; later builds can reuse Docker's cached layers. Keep these local images on the same Docker engine that builds your application.

## Compile an existing project

Create your application with the [npx starter](getting-started.md) or download a [complete project](examples/index.md), then compile it for Linux. The mount is writable because `aug build` writes `.aug-build` and generated specifications into the project. Run the commands below from the parent of `my-app`.

Keep the project in a directory shared with your Docker engine. If Docker reports that the bind source path does not exist, check the engine's file-sharing settings. A remote engine cannot mount a folder that exists only on your client machine; see [bind mount constraints](https://docs.docker.com/engine/storage/bind-mounts/#considerations-and-constraints).

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

The two images use the same Debian distribution and native library paths. A Linux executable built here runs inside the runtime container, including when your host is macOS or Windows.

## Deploy an HTTP application

Start a project using Node.js 24 and npm on your host:

```sh
npm install --global @greenpandastudios/aug-cli@next
aug init my-api
cd my-api
```

Replace `main.aug` and add `endpoints.aug`. The starter's unused greeting module can remain. This service has one endpoint that returns a record as JSON.

**main.aug**

```aug project=docker-http file=main.aug
import health from endpoints

serve health on port 8080
```

**endpoints.aug**

```aug project=docker-http file=endpoints.aug
record Health(string status)

/** Confirm that the HTTP handler can answer a request. */
endpoint GET "/health" as health() returns Health:
    return Health(status="ok")

test endpoint health client:
    when health_checks:
        it answers_successfully:
            response = client.request(method="GET", path="/health")
            assert(condition=response.status == 200)
```

Save `main.yaml` beside `main.aug`:

```yaml
optimization: release
web:
  host: 0.0.0.0
```

`web.host` must accept connections through the container's network interface. August's default, `127.0.0.1`, only accepts connections inside that container. The port comes from the `serve` statement; `main.yaml` selects the listening address and release compilation.

Save this `Dockerfile` in `my-api`. Docker's [multi-stage build](https://docs.docker.com/build/building/multi-stage/) copies the compiled executable into the runtime image:

```dockerfile
FROM augscript/build:local AS build
COPY . /workspace
RUN aug test /workspace \
    && aug build /workspace --out /tmp/program
FROM augscript/run:local
COPY --from=build --chown=august:august /tmp/program /app/program
```

Save `.dockerignore` in the same folder:

```text
.git
.aug-build
.aug-native
.aug-packages
node_modules
.devcontainer
.env
.env.*
*.key
*.pem
```

Keep credentials out of the build context. Mount runtime files at the paths your application uses. The compiler reads `main.yaml` while building; environment variables configure your application only when its code reads them. If your application imports source packages, commit its manifest and `aug.lock.json`, then add `RUN aug install /workspace --frozen` before the test/build step. [Frozen installs](packages.md#reproducible-builds) restore the locked dependency graph; include local package sources in the build context when the manifest references them.

Build and start your application image. The build runs the endpoint test before compiling. Keep your terminal in `my-api`:

```sh
docker build -t my-api:0.1.0 .
docker run --detach --name my-api --init \
  --restart unless-stopped \
  --publish 127.0.0.1:8080:8080 \
  my-api:0.1.0
curl --fail http://127.0.0.1:8080/health
```

The test passes, and the HTTP request returns `{"status":"ok"}`. The published port is available on the Docker host's loopback address. Change the mapping deliberately if clients must connect directly from other hosts; omitting `127.0.0.1` publishes on all host interfaces. See [Docker's port publishing guide](https://docs.docker.com/engine/network/port-publishing/).

Inspect output and stop this deployment with:

```sh
docker logs my-api
docker stop my-api
docker rm my-api
```

## Move the image to a server

Tag and push the **application** image to your registry. Replace `registry.example.com/team` with your registry and namespace, and sign in using that registry's instructions:

```sh
docker tag my-api:0.1.0 registry.example.com/team/my-api:0.1.0
docker push registry.example.com/team/my-api:0.1.0
```

On a Linux Docker server with access to that registry, pull and run it:

```sh
docker pull registry.example.com/team/my-api:0.1.0
docker run --detach --name my-api --init \
  --restart unless-stopped \
  --publish 127.0.0.1:8080:8080 \
  registry.example.com/team/my-api:0.1.0
```

Place a TLS reverse proxy on that server in front of `127.0.0.1:8080`, or configure the application's [native TLS](web.md#openapi-configuration). For native TLS, use stable absolute container paths for the certificate and private key in `main.yaml`, then mount those files at the same paths when starting the container. Build for the server's CPU architecture: an ARM64 image does not become an x86-64 executable when pushed. These recipes build for the Docker engine's default platform; run the build on the target architecture or use a separately verified cross-platform build setup.

Pin the CLI version and retain the application image digest for each deployment. The base tags and Debian package versions can change; use reviewed base-image digests and controlled dependency updates when reproducing a release. Redistributed native libraries also have [license and notice obligations](production-readiness.md#dependencies-and-licenses). August remains experimental; use the [readiness review](production-readiness.md) when assessing a trial deployment.

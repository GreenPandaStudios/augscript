# Build and deploy with Docker

Use two August base images. The build image has the released CLI and its verified LLVM compiler/runtime already prepared. The runtime image runs your compiled application without Node.js or a compiler.

| Image | Use |
| --- | --- |
| `ghcr.io/greenpandastudios/aug-build:0.23.0` | Build, run and test August projects; develop in a container. |
| `ghcr.io/greenpandastudios/aug-runtime:0.23.0` | Deploy the compiled executable with its libraries and notices. |

Both tags contain Linux ARM64 and x86-64 variants. Docker selects the variant for your engine. They work on Linux and Docker Desktop for Mac, including Apple Silicon and Intel Macs. Applications built in these containers are Linux executables. Use the [native CLI](getting-started.md) to build a macOS executable. See [Docker's platform guide](https://docs.docker.com/build/building/multi-platform/) for architecture selection and emulation.

## Prepare the toolchain images

Pull the bases; there are no toolchain Dockerfiles to create:

```sh
docker pull ghcr.io/greenpandastudios/aug-build:0.23.0
docker pull ghcr.io/greenpandastudios/aug-runtime:0.23.0
```

The version is the bundled compiler version. The build image has Node.js 24, the CLI, its matching standard library and a prepared compiler cache. Application-specific source packages and native artifacts are installed during the application build. Source code and compiler development tools are not required on your host.

## Compile an existing project

Save this `Dockerfile` beside your project's `main.aug`:

```dockerfile
FROM ghcr.io/greenpandastudios/aug-build:0.23.0 AS build
COPY --chown=node:node . .
RUN aug install . \
    && aug test . \
    && aug build . --out /tmp/deploy/program

FROM ghcr.io/greenpandastudios/aug-runtime:0.23.0
COPY --from=build --chown=august:august /tmp/deploy/ /app/
```

Save `.dockerignore` beside it:

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

Build and run it from that directory:

```sh
docker build -t my-app .
docker run --rm my-app
```

The build installs project dependencies, runs same-file tests and compiles the program. The final image contains the deployment directory: `program`, `lib` and `share`. Copy the whole directory so shared libraries, licenses and source provenance stay with the executable. Both bases use Debian Bookworm and run their normal commands as unprivileged users.

Commit `aug.lock.json` to retain exact package revisions. For a deployment with an established Linux lock, change the install step to `aug install . --frozen`. Native package locks must include the Linux target you deploy; a lock created only on macOS may need its first Linux install before it can be frozen. See [reproducible builds](packages.md#reproducible-builds).

## Deploy an HTTP application

Use the [weather starter](weather-api.md) or a [downloaded web example](examples/index.md), then add the Dockerfile above. Here is a complete health service.

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

**main.yaml**

```yaml project=docker-http file=main.yaml
optimization: release
web:
  host: 0.0.0.0
```

`web.host` lets the service accept connections through the container interface. The `serve` statement selects the port. The default address, `127.0.0.1`, accepts connections only inside the container.

```sh
docker build -t my-api .
docker run --detach --name my-api --init \
  --publish 127.0.0.1:8080:8080 my-api
curl --fail http://127.0.0.1:8080/health
```

The request returns `{"status":"ok"}`. The port is published on your host's loopback address. Change the mapping when clients need to connect directly from another host; see [port publishing](https://docs.docker.com/engine/network/port-publishing/).

```sh
docker logs my-api
docker stop my-api
docker rm my-api
```

## Move the image to a server

Push your application image to a registry your server can access:

```sh
docker tag my-api registry.example.com/team/my-api:0.1.0
docker push registry.example.com/team/my-api:0.1.0
```

On the server:

```sh
docker pull registry.example.com/team/my-api:0.1.0
docker run --detach --name my-api --init \
  --restart unless-stopped \
  --publish 127.0.0.1:8080:8080 \
  registry.example.com/team/my-api:0.1.0
```

Build for the server's architecture. On an ARM64 Mac targeting an x86-64 Linux server, use `docker build --platform linux/amd64 -t my-api .`; Docker Desktop runs the build under emulation. Native ARM64 and x86-64 CI runners qualify the base images separately. August does not cross-compile a macOS binary inside these containers.

For a release, retain the application image digest and pin reviewed base-image digests in its Dockerfile. Numbered base tags select the August compiler version; a rebuild can update Debian runtime packages. Use a TLS reverse proxy or [August's native TLS configuration](web.md#openapi-configuration), and mount application data or credentials at the paths its code expects. See [production readiness](production-readiness.md) for workload and dependency limits.

For editing in the build image, use [a Dev Container](dev-containers.md).

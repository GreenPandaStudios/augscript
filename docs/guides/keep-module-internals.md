# Keep module internals

**Unreleased:** this guide requires the compiler containing internal folder contracts. Published 0.23.0 does not accept `internal` entries.

An application should depend on the service it needs. The repository and concrete service that provide it can stay inside the service folder. `export.aug` declares both surfaces; each source file still imports what it uses.

```yaml project=internal-service file=main.yaml
strict_modules: true
```

```aug project=internal-service file=main.aug
import Greeter and Services from service

include Services
resolve Greeter to greeter
print(value=greeter.message())
```

The application can import two names. The other three entries permit collaboration between sibling files; they do not expose those declarations outside the folder.

```aug project=internal-service file=service/export.aug
export Greeter from greeting
export Services from providers
internal Service from greeting
internal Repository from repository
internal MemoryRepository from repository
```

The service promises a message. Its implementation gets a repository from the explicit composition and keeps it in private storage.

```aug project=internal-service file=service/greeting.aug
import Repository from repository

interface Greeter:
    message() returns string

Service(resolve Repository repo to _repo) implements Greeter:
    message():
        return _repo.read()
```

```aug project=internal-service file=service/repository.aug
interface Repository:
    read() returns string

MemoryRepository() implements Repository:
    read():
        return "Hello, Ada!"
```

The composition selects both providers. Including it in `main.aug` supplies the public service and its internal dependency. It does not make the repository importable.

```aug project=internal-service file=service/providers.aug
import Greeter and Service from greeting
import Repository and MemoryRepository from repository

composition Services:
    implement Repository with MemoryRepository
    implement Greeter with Service
```

Run the project with `aug run` and generate its explanation with `aug spec`. It prints `Hello, Ada!`. A package can publish the same folder structure through its ordinary `export.aug`; consumers import `Greeter` and `Services` from the package alias or repository URL.

## Keep the boundary usable

An exported callable must not require an internal type as an input or return it to its caller. The check also follows inferred results and errors, nested generic types, constructors, interface contracts and public fields. A `resolve` input remains a constructor requirement, even when its field is private. Export the required interface/data type or keep that concrete class internal behind an exported interface and composition.

Private initialized state can use internal types because the caller neither supplies nor reads that storage. Every source file still needs an explicit import. `_` names remain private to their declaring scope and cannot be internal entries.

Changing `export Name from file` to `internal Name from file` removes an outward promise. Review that removal with `aug package diff` before publishing. The compiler never changes an export into an internal entry automatically.

# HTTP, server pages, and crypto

Build a service by declaring its routes in August and serving them from `main.aug`. The declarations describe how HTTP inputs become typed values and how results become responses. Your application selects authentication, authorization, and logging capabilities explicitly. `august.web` and `august.crypto` provide adapters for native transport and cryptographic operations.

This guide builds a service with JSON, a server-rendered page, a form action, and an event stream. Learn [modules and dependencies](learn/modules-and-dependencies.md) first if `implement` and `resolve` are unfamiliar. Full web and crypto runs need the [native bootstrap](tooling.md#native-standard-libraries). The service uses demonstration authentication; [the gap ledger](web-library-gaps.md) describes what remains before a production service claim.

## A complete service

Copy the following files into one folder. `aug check .` checks the contracts and `aug test .` runs the three endpoint cases. `aug run .` starts the server on port 8080. The documentation gate builds the service and runs its tests; it does not leave a server running.

Read `main.aug` first. It supplies the authentication and request-logging implementations, then serves the four named endpoints. Read `api.aug` for the JSON route and stream, `actions.aug` for the POST, and the page/view files for HTML.

**main.aug**

```aug project=web-guide file=main.aug
import readUser and events from api
import home from pages
import save from actions
import DemoAuthentication from auth
import Authentication and RequestLogger and WebRequestLogger from august.web

implement Authentication with DemoAuthentication
implement RequestLogger with WebRequestLogger scoped
serve readUser and events and home and save on port 8080
```

**models.aug**

```aug project=web-guide file=models.aug
record User(int id, string name)
record UserInput(string name)
```

**auth.aug**

```aug project=web-guide file=auth.aug
import Authentication and Principal from august.web

/** A demonstration adapter. Replace its credential check for a real application. */
DemoAuthentication() implements Authentication:
    authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError:
        match request.headers.get(name="authorization"):
            when null:
                return null
            when some value:
                if value == "Bearer demo":
                    return Principal(subject="ada", permissions=["users.read"])
                return null
```

**api.aug**

```aug project=web-guide file=api.aug
import User from models
import DemoAuthentication from auth
import Authentication and RequestLogger and WebRequestLogger from august.web

/** Look up one user. Authentication runs before the identifier is decoded. */
[LogRequest(logger=logger)]
[RequireLogin(authentication=auth)]
[RateLimit(requests=100, seconds=60)]
[Timeout(milliseconds=1000)]
[Compress]
endpoint GET "/users/{id}" as readUser(int id from path, resolve Authentication auth, resolve RequestLogger logger) returns User uses auth.authenticate and logger.complete:
    return User(id, name="Ada")

test endpoint readUser client:
    when requests:
        implement Authentication with DemoAuthentication
        implement RequestLogger with WebRequestLogger scoped
        it requires_identity_before_decoding:
            response = client.request(method="GET", path="/users/not-an-integer")
            assert(condition=response.status == 401)
        it returns_a_user:
            headers = Headers().with(name="authorization", value="Bearer demo")
            response = client.request(method="GET", path="/users/7", headers)
            assert(condition=response.status == 200)
            assert(condition=response.body.text() == "{\"id\":7,\"name\":\"Ada\"}")

/** Each yield waits for transport capacity; disconnect cancels the producer. */
endpoint GET "/events" as events() streams ServerEvent<User> unless HttpError:
    yield ServerEvent(data=User(id=1, name="Ada"), event="user", id="first")
    yield ServerEvent(data=User(id=2, name="Grace"), event="user")

test endpoint events client:
    when streaming:
        it returns_events:
            response = client.request(method="GET", path="/events")
            assert(condition=response.status == 200)
            assert(condition=response.headers.get(name="content-type") == "text/event-stream")
```

**actions.aug**

```aug project=web-guide file=actions.aug
import UserInput from models
import redirect from august.web

/** Accept a typed form and redirect after handling it. */
endpoint POST "/users" as save(UserInput input from form) returns HttpResponse<string> unless HttpError:
    return redirect(location="/")
```

**views.aug**

```aug project=web-guide file=views.aug
import User from models
import save from actions

UserCard(User user) returns Html:
    return <article><h2>{user.name}</h2><p>User {user.id}</p></article>

NewUser() returns Html unless HttpError:
    return <form onSubmit={handle save(input from form)}><label>Name <input name="name" required /></label><button type="submit">Save</button></form>
```

**pages.aug**

```aug project=web-guide file=pages.aug
import User from models
import UserCard and NewUser from views

/** Render checked components; interpolated text and attributes are escaped. */
endpoint GET "/" as home() returns Html unless HttpError:
    return <html><head><title>August users</title></head><body><UserCard user={User(id=7, name="Ada")} /><NewUser /></body></html>
```

Use POST, PUT, PATCH, or DELETE for a write action. `handle remove(id=user.id)` describes a deferred HTTP request; it does not call `remove` while rendering. `input from form` maps form fields to a checked record. The generated same-origin browser transport submits the selected endpoint, follows its redirect, reloads successful writes, and displays failures as text. There is no August browser compiler in this version.

Captured values and form inputs preserve signed 64-bit integers, including identifiers beyond JavaScript's safe integer range. A form field containing a record, collection, or `Json` uses JSON text; for example, `[1,2]`, `{"id":7}`, or `"Ada"` for a string-valued `Json`. Ordinary string fields contain plain text. The transport encodes fields according to their declared types.

## Wire contracts and responses

Every ordinary endpoint input states its source: `from path`, `from query`, `from header`, `from cookie`, `from body`, `from form`, or `from request`. A source can specify a wire name. `resolve` inputs come from the application's explicit DI composition. Only endpoints selected by `serve` are reachable over HTTP.

JSON bodies decode into concrete immutable records. `optional T` allows a value or null. Omitted optional fields and inputs become null, including PATCH bodies. Match null/some before reading the value. Serializing a record includes null optional fields; it does not recreate whether a field was originally omitted. Unknown or incorrectly typed record fields are rejected. An absent required query/header/form value and invalid scalar syntax return 400; invalid JSON syntax returns 400, a valid JSON schema mismatch returns 422, unsupported media returns 415, and an oversized body returns 413.

An ordinary return becomes the documented status and a JSON, Html, or Bytes representation. `HttpResponse<T>` selects status and immutable `Headers` explicitly. `Headers.with` appends a value, preserving repeated headers such as Set-Cookie; singular wire inputs reject duplicates. The `redirect` and `cookie` helpers validate header values. Cookie callers explicitly choose Secure and lifetime settings.

Response status literals must range from 200 to 599; constructing a response with a dynamic status requires handling or declaring `HttpError`. Complex form fields use the same JSON schemas as body inputs: malformed JSON text returns 400 and a schema mismatch returns 422.

`unless ErrorType with status CODE` declares an error response. Unexpected failures produce 500 with server-side error reporting. Default failures use [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html). OAuth endpoints in the proof return their protocol's JSON errors explicitly. HEAD suppresses the body; 204 and 304 suppress body and Content-Length. See the [gap ledger](web-library-gaps.md) for unimplemented HTTP behavior; this is not a claim of full protocol conformance.

## Policies and interceptors

The first written HTTP policy is outermost. Policies execute before wire decoding; custom parameter interceptors execute after decoding. The compiler requires all HTTP policies before custom interceptors. Put `LogRequest` first to observe failures rejected by later guards.

| Policy | Inputs and behavior |
| --- | --- |
| RequireLogin | `authentication=auth` maps an explicit `resolve Authentication auth`; declare `uses auth.authenticate`. A null identity returns 401. The adapter validates credentials. |
| RequirePermission | Maps Authentication and Authorization dependencies plus a literal permission; denied access returns 403. Declare both capability operations. |
| LogRequest | Maps `resolve RequestLogger logger` and `uses logger.complete`. Calls completion in reverse layer order after transport completion or disconnect. Disconnect status is 499 for logging. WebRequestLogger emits escaped JSON metadata without credentials or query strings. |
| RateLimit | Literal requests and seconds; a bounded fixed-window counter per endpoint and trusted transport peer. It ignores client-supplied forwarding headers. Excess returns 429. |
| Timeout | Literal milliseconds; handler, scoped tasks, streaming and transport share the deadline. Before output, timeout returns 504; after headers it terminates output. C calls finish before cooperative cancellation is observed. Buffered request reception precedes this deadline. |
| Cors | Literal exact origins, optional request-header allowlist and credentials. A supplied disallowed origin returns 403. Preflight checks the selected route's method and requested headers. Wildcard cannot enable credentials. CORS is not authentication or CSRF protection. |
| Compress | Negotiates gzip, respects an existing Content-Encoding, and skips bodyless statuses. Stream items use complete concatenated gzip members as permitted by [RFC 1952](https://www.rfc-editor.org/rfc/rfc1952.html). |

Options are compile-time literals; dependency mappings must reference the canonical `august.web` capabilities. Cors and Compress may each appear once. Multiple deadlines choose the earliest. Custom interceptors retain their checked around/next contracts and written order.

## Streams and scoped tasks

An endpoint may `streams ServerEvent<T>`, `streams Bytes`, or `streams Html`. `yield` supplies one item. Each pending encoded item is bounded to 64 KiB and sent under transport backpressure. A response has one consumer. Errors before headers become HTTP responses; later failures terminate output without appending a second error representation. Disconnect cancels the request and its children; `always` cleanup runs. The request DI scope survives through response completion.

`start fetch(...)` creates a task owned by its lexical scope. `wait for loadingUsers and loadingOrders to users and orders` waits in the stated result order; `wait for taskList` returns an ordered result list. `to`, `as`, and `=` result assignments are supported where the grammar permits them. Scope exit joins children; an unhandled child failure cancels siblings. Read-only frozen values can be shared without copying. Mutable captures are loaned until the task is observed. `lock shared as value` grants exclusive mutation and forbids nested locks, I/O, task starts and waits inside the locked region.

Declare an owned resource directly in its task's `scope` block to keep it alive through implicit joining. A resource declared in a shorter nested block must be waited for before that block ends; the compiler rejects a live task borrow at that boundary. Unrelated owned cleanup does not join the enclosing scope's children. Pure loops under a lock finish or observe cancellation before another coroutine runs.

Scheduling checks receiver and argument errors immediately. A scheduled callee's errors are checked at waits and implicit joins. A wait can observe an unhandled sibling failure; grouped and collection waits finish observing every selected child before rethrowing the first error. Catch around the entire scope when handling failures from children that are not explicitly observed.

Scheduling currently uses cooperative coroutines on one OS thread. Outbound HttpClient I/O suspends the coroutine, so the same executable can call its own endpoints. Multicore workers, bounded channels/broadcasts, and inbound request streams remain gaps. The [gap ledger](web-library-gaps.md) records delivery status.

## OpenAPI configuration

Add to main.yaml:

```yaml
web:
  host: 127.0.0.1
  body_limit: 1048576
  response_limit: 4194304
  http3: false
openapi:
  enabled: true
  title: August users
  version: 1.0.0
  path: /openapi.json
  docs: /docs
  output: .aug-build/openapi.json
```

`web.tls` accepts certificate, private_key and optional outbound ca paths relative to the project. HTTP/3 requires TLS. Native HttpClient verifies peers and returns redirects for explicit handling. The private bootstrap enables libwebsockets HTTP/1.1, HTTP/2 and HTTP/3 on tested macOS ARM and Linux ARM hosts.

OpenAPI 3.2.1 includes selected endpoints, input sources, concrete record schemas, explicit response variants and Javadoc. Streams have item schemas. Unsupported contracts fail compilation when generation is enabled. `/docs` is the generated API explorer. [OpenAPI 3.2.1](https://spec.openapis.org/oas/v3.2.1.html) is the contract reference.

## Endpoint tests

`test endpoint NAME client` must live with that endpoint. The compiler supplies HttpTestClient; group bindings replace production dependencies explicitly. `client.request` exercises the shared native router, policies, wire binding, DI, handler and serialization. Stream collection is bounded by response_limit. Each case has fresh process state. Production startup is excluded.

This tests the application pipeline; socket parsing, TLS negotiation and transport disconnects need separate live-transport tests. Run `aug test FOLDER requests` to select the example's group. The [testing guide](testing.md) describes rows, filtering and coverage.

## Crypto and the login proof

Crypto is an injected capability with GnuTlsCrypto as its native adapter. It provides OS-backed randomness, SHA-256, constant-time content comparison, strict base64url, opaque RSA keys, RS256 signing/verification, RSA JWK import/export, and PBKDF2-HMAC-SHA256 password derivation. Private RSA material is scrubbed on reclamation; general secret-buffer lifecycle and key rotation APIs remain gaps.

`signJwt` requires an explicit key id and token type. `verifyJwt` accepts the configured RS256/key-id/type profile, rejects unsupported JOSE fields, verifies the signature before exposing claims, and follows no token-provided URL. The consuming protocol still validates issuer, audience, times, nonce and token purpose. The implementation follows the fixed-algorithm approach described in [JWT best current practices](https://www.rfc-editor.org/rfc/rfc8725.html).

The [same-app login example](examples/oidc-login/index.md) contains an OpenID Connect provider and relying party in one August application. It uses real loopback discovery, authorization, token, JWKS and UserInfo endpoints, Authorization Code with S256 PKCE, browser-bound state/nonce/CSRF, and a distinct application-session JWT with live revocation. The UI signs in and signs out through typed actions. See [OpenID Connect Core validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation) and [S256 PKCE](https://datatracker.ietf.org/doc/html/rfc7636).

Download and extract [the login project](examples/oidc-login/index.md#try-this-project). From the folder containing it:

```sh
cd oidc-login
npx --package=@greenpandastudios/aug-cli@next aug-native
npx @greenpandastudios/aug-cli@next run .
```

In another terminal, run the signed-claim tests from the same project folder:

```sh
npx @greenpandastudios/aug-cli@next test . --group signed_identity_claims
```

Open http://127.0.0.1:8787 and sign in as **ada** with **august-demo**. `/me` returns the protected identity; `/docs` exposes endpoint contracts. The [gap ledger](web-library-gaps.md) distinguishes this verified development profile from broader provider, library and runtime support.

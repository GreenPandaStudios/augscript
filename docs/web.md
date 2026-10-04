# HTTP, server pages, and crypto

Build a service by declaring its routes in August and serving them from `main.aug`. The declarations describe how HTTP inputs become typed values and how results become responses. Supply authentication, authorization, and logging through injected dependencies. Add the optional web and crypto packages when you need their adapters.

This guide builds a service with JSON, a server-rendered page, a form action, and an event stream. Learn [modules and dependencies](learn/modules-and-dependencies.md) first if `implement` and `resolve` are unfamiliar. On supported hosts, the CLI [obtains native components automatically](tooling.md#native-standard-libraries). The example authentication is for demonstration. Read [the HTTP and crypto limits](web-library-gaps.md) before adapting it for production.

## A complete service

Copy the following files into one folder and run `aug install`. `aug check .` checks the source and `aug test .` runs the three endpoint cases. `aug run .` starts the server on port 8080.

Read `main.aug` first. It supplies the authentication and request-logging implementations, then serves the four named endpoints. Read `api.aug` for the JSON route and stream, `actions.aug` for the POST, and the page/view files for HTML.

**main.yaml**

```yaml project=web-guide file=main.yaml
packages:
  web: "https://github.com/GreenPandaStudios/augscript/src/stdlib/web#v0.19.0"
```

**main.aug**

```aug project=web-guide file=main.aug
import readUser and events from api
import home from pages
import save from actions
import DemoAuthentication from auth
import Authentication and RequestLogger and WebRequestLogger from web

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
import Authentication and Principal from web

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
import Authentication and RequestLogger and WebRequestLogger from web

/** Look up one user. Authentication runs before the identifier is decoded. */
[LogRequest(logger=logger)]
[RequireLogin(authentication=auth)]
[RateLimit(requests=100, seconds=60)]
[Timeout(milliseconds=1000)]
[Compress]
endpoint GET "/users/{id}" as readUser(int id from path, resolve Authentication auth, resolve RequestLogger logger):
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
import redirect from web

/** Accept a typed form and redirect after handling it. */
endpoint POST "/users" as save(UserInput input from form):
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

## Request inputs and responses {#wire-contracts-and-responses}

Every ordinary endpoint input states its source: `from path`, `from query`, `from header`, `from cookie`, `from body`, `from form`, or `from request`. A source can specify a wire name. `resolve` inputs come from the application's explicit DI composition. Only endpoints selected by `serve` are reachable over HTTP.

JSON bodies decode into concrete immutable records. `optional T` allows a value or null. Omitted optional fields and inputs become null, including PATCH bodies. Match null/some before reading the value. Serializing a record includes null optional fields; it does not recreate whether a field was originally omitted. Unknown or incorrectly typed record fields are rejected. An absent required query/header/form value and invalid scalar syntax return 400; invalid JSON syntax returns 400, a valid JSON schema mismatch returns 422, unsupported media returns 415, and an oversized body returns 413.

An ordinary return becomes the documented status and a JSON, Html, or Bytes representation. `HttpResponse<T>` selects status and immutable `Headers` explicitly. `Headers.with` appends a value, preserving repeated headers such as Set-Cookie; singular wire inputs reject duplicates. The `redirect` and `cookie` helpers validate header values. Cookie callers explicitly choose Secure and lifetime settings.

Response status literals must range from 200 to 599. Constructing a response with a dynamic status can fail with `HttpError`; catch that failure or let it propagate through the inferred contract. Complex form fields use the same JSON schemas as body inputs: malformed JSON text returns 400 and a schema mismatch returns 422.

`unless ErrorType with status CODE` declares an error response. Unexpected failures produce 500 with server-side error reporting. Default failures use [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html). The login example returns OAuth errors in the JSON format required by that protocol. HEAD suppresses the body; 204 and 304 suppress body and Content-Length. See [HTTP limits](web-library-gaps.md) for unsupported behavior.

## Policies and interceptors

The first written HTTP policy is outermost. Policies execute before wire decoding; custom parameter interceptors execute after decoding. The compiler requires all HTTP policies before custom interceptors. Put `LogRequest` first to observe failures rejected by later guards.

| Policy | Inputs and behavior |
| --- | --- |
| RequireLogin | `authentication=auth` maps an explicit `resolve Authentication auth`. The compiler includes `auth.authenticate` in the handler's inferred contract. A null identity returns 401. The adapter validates credentials. |
| RequirePermission | Maps Authentication and Authorization dependencies plus a literal permission; denied access returns 403. Both capability operations appear in the inferred contract. |
| LogRequest | Maps `resolve RequestLogger logger` and adds `logger.complete` to the inferred contract. Calls completion in reverse layer order after transport completion or disconnect. Disconnect status is 499 for logging. WebRequestLogger emits escaped JSON metadata without credentials or query strings. |
| RateLimit | Literal requests and seconds; a bounded fixed-window counter per endpoint and trusted transport peer. It ignores client-supplied forwarding headers. Excess returns 429. |
| Timeout | Literal milliseconds; handler, scoped tasks, streaming and transport share the deadline. Before output, timeout returns 504; after headers it terminates output. C calls finish before cooperative cancellation is observed. Buffered request reception precedes this deadline. |
| Cors | Literal exact origins, optional request-header allowlist and credentials. A supplied disallowed origin returns 403. Preflight checks the selected route's method and requested headers. Wildcard cannot enable credentials. CORS is not authentication or CSRF protection. |
| Compress | Negotiates gzip, respects an existing Content-Encoding, and skips bodyless statuses. Stream items use complete concatenated gzip members as permitted by [RFC 1952](https://www.rfc-editor.org/rfc/rfc1952.html). |

Options are compile-time literals. Import the policy interfaces from the web source package; the compiler checks their signatures against the native adapter contract. Cors and Compress may each appear once. Multiple deadlines choose the earliest. Custom interceptors retain their checked around/next contracts and written order.

## Streams and scoped tasks

An endpoint may `streams ServerEvent<T>`, `streams Bytes`, or `streams Html`. `yield` supplies one item. Each pending encoded item is bounded to 64 KiB and sent under transport backpressure. A response has one consumer. Errors before headers become HTTP responses; later failures terminate output without appending a second error representation. Disconnect cancels the request and its children; `always` cleanup runs. The request DI scope survives through response completion.

A HEAD request sends the GET response headers without a body. For a stream, the first yield establishes the response, then the producer stops and runs its cleanup. Intentional completion keeps the response status; a real cleanup failure still produces an error response. [HTTP HEAD semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-head).

HEAD transport completes at its headers, including the stream-end flag for HTTP/2. Connection reuse does not turn a completed request into a disconnect log.

`start fetch(...)` creates a task owned by its lexical scope. `wait for loadingUsers and loadingOrders to users and orders` waits in the stated result order; `wait for taskList` returns an ordered result list. `to`, `as`, and `=` result assignments are supported where the grammar permits them. Scope exit joins children; an unhandled child failure cancels siblings. Read-only frozen values can be shared without copying. Mutable captures are loaned until the task is observed. `lock shared as value` grants exclusive mutation and forbids nested locks, I/O, task starts and waits inside the locked region.

Declare an owned resource directly in its task's `scope` block to keep it alive through implicit joining. A resource declared in a shorter nested block must be waited for before that block ends; the compiler rejects a live task borrow at that boundary. Unrelated owned cleanup does not join the enclosing scope's children. Pure loops under a lock finish or observe cancellation before another coroutine runs.

Scheduling checks receiver and argument errors immediately. A scheduled callee's errors are checked at waits and implicit joins. A wait can observe an unhandled sibling failure; grouped and collection waits finish observing every selected child before rethrowing the first error. Catch around the entire scope when handling failures from children that are not explicitly observed.

Tasks run cooperatively on one OS thread. Outbound `HttpClient` calls suspend their task, so a service can call its own endpoints. Multicore workers, channels, broadcasts, and inbound request streams are not yet supported.

## OpenAPI configuration

Add this to `main.yaml`:

```yaml
web:
  host: 127.0.0.1
  body_limit: 1048576
  headers_timeout: 30000
  request_timeout: 120000
  drain_timeout: 10000
  max_requests: 256
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

`web.tls` accepts certificate, private_key and optional outbound ca paths relative to the project. HTTP/3 requires TLS. Native HttpClient verifies peers and returns redirects for explicit handling. The native transport enables HTTP/1.1, HTTP/2, and HTTP/3 through libwebsockets.

The generated OpenAPI 3.2.1 document describes the endpoints selected by `serve`, their input sources, record schemas, response variants, and Javadoc. Streams have item schemas. Unsupported contracts fail compilation when generation is enabled. `/docs` is the generated API explorer. [OpenAPI 3.2.1](https://spec.openapis.org/oas/v3.2.1.html) defines the document format.

## Endpoint tests

`test endpoint NAME client` must live with that endpoint. The compiler supplies HttpTestClient; group bindings replace production dependencies explicitly. `client.request` exercises the shared native router, policies, wire binding, DI, handler and serialization. Stream collection is bounded by response_limit. Each case has fresh process state. Production startup is excluded.

This tests the application pipeline; socket parsing, TLS negotiation and transport disconnects need separate live-transport tests. Run `aug test FOLDER requests` to select the example's group. The [testing guide](testing.md) describes rows, filtering and coverage.

## Login with OpenID Connect {#crypto-and-the-login-proof}

Inject `Crypto` and bind it to `GnuTlsCrypto` for native cryptographic operations. It provides OS-backed randomness, SHA-256, constant-time content comparison, strict base64url, opaque RSA keys, RS256 signing/verification, RSA JWK import/export, and PBKDF2-HMAC-SHA256 password derivation. Private RSA material is scrubbed on reclamation; general secret-buffer lifecycle and key rotation APIs remain gaps.

`signJwt` requires an explicit key id and token type. `verifyJwt` accepts the configured RS256/key-id/type profile, rejects unsupported JOSE fields, verifies the signature before exposing claims, and follows no token-provided URL. The consuming protocol still validates issuer, audience, times, nonce and token purpose. The implementation follows the fixed-algorithm approach described in [JWT best current practices](https://www.rfc-editor.org/rfc/rfc8725.html).

The [same-app login example](examples/oidc-login/index.md) contains an OpenID Connect provider and relying party in one August application. It uses real loopback discovery, authorization, token, JWKS and UserInfo endpoints, Authorization Code with S256 PKCE, browser-bound state/nonce/CSRF, and a distinct application-session JWT with live revocation. The UI signs in and signs out through typed actions. See [OpenID Connect Core validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation) and [S256 PKCE](https://datatracker.ietf.org/doc/html/rfc7636).

Download and extract [the login project](examples/oidc-login/index.md#try-this-project). From the folder containing it:

```sh
cd oidc-login
aug run
```

In another terminal, run the signed-claim tests from the same project folder:

```sh
aug test --group signed_identity_claims
```

The first run prepares the native HTTP and crypto libraries automatically; later runs reuse them. [Install August](getting-started.md) first if `aug` is not available. Open http://127.0.0.1:8787 and sign in as **ada** with **august-demo**. `/me` returns the protected identity; `/docs` exposes endpoint contracts. The demo keeps accounts, sessions, and keys in memory. Read [the login limits](web-library-gaps.md) before extending it.

## Upload reception and shutdown

The runtime dispatches an endpoint at its headers. Authentication, authorization and other header checks run before typed body decoding. A raw handler can return a rejection without waiting for upload bytes. Reading `request.body` or binding a body or form waits for reception and can raise `HttpError`. `100 Continue` is sent only when an accepted handler requests the body. Unsupported media types are rejected before that invitation.

`headers_timeout` and `request_timeout` are absolute reception deadlines in milliseconds. The defaults are 30 seconds for headers and 120 seconds for the complete request. The request budget includes its header reception. The transport closes incomplete headers at their deadline and returns 408 for a stalled admitted upload. `max_requests` bounds admitted exchanges, including cleanup after a disconnected request; the default is 256. Incoming connections are capped at twice that limit while they receive headers. The body limit applies when a handler consumes the body, so an unauthenticated oversized upload can still receive 401. HTTP framing checks and libwebsockets' transport ceiling can reject malformed or very large messages earlier. Bytes already received by the transport are not a promise that the application has accepted an upload.

SIGTERM and SIGINT close the listener, stop admission on existing connections and allow active exchanges to finish for `drain_timeout` milliseconds. An application can resolve `ServerControl`, bound to `WebServerControl`, and call `stop(milliseconds=10000)` on the server thread to select its grace period. After it expires, the transport closes remaining exchanges and cancels their work. `serve` returns after request tasks and their children finish cleanup, so owned main-scope services can then be disposed. Native calls must provide their own bounded completion or cancellation: the network grace period cannot interrupt arbitrary foreign code.

See [native service boundaries](native-service-boundaries.md) for identity verification, legacy JSON, protocol helpers and worker-owned PostgreSQL connections.

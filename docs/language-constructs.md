---
generated: true
source: src/help.ts and src/builtins.ts
editLink: false
---

# Language constructs

Syntax and built-in operations. For complete programs, read [the language reference](reference.md). These descriptions also appear in VS Code help.

## -

```text
left - right
```

Subtract numbers. Unary `-` negates a number.

## ,

```text
first, second
```

Separate parameters, arguments, type arguments, or interfaces.

## ;

```text
statement;
```

Optional statement separator. Newlines, a closing block brace, or end of file also terminate statements. Use semicolons to separate several statements on one line. Expressions continue inside parentheses and collection literals, or after an unfinished operator.

## :

```text
if condition: ... or {1: "apples"}
```

After a block header, introduce a body indented with tabs or spaces. Dedenting ends that body. Each block may independently use braces or indentation. In a map literal, separate a key from its value; collection and parenthesis continuation indentation has no block meaning.

## !=

```text
left != right
```

Compare values for inequality; the result is `bool`.

## .

```text
receiver.member
```

Access a method or property. A member starting with `_` is private to its declaring type; other members are public. Mutable access still follows borrow rules.

## (

```text
(1, 2)
```

Start a tuple, grouped expression, call argument list, function parameters, or class header. A comma creates a tuple; a single expression without a comma is grouping.

## )

```text
( ... )
```

End a tuple, grouped expression, argument list, parameter list, or class header.

## [

```text
[1, 2] or [Validator(y=x)]
```

Start a list literal, or an interceptor annotation immediately before a callable declaration. Lists infer one element type. Interceptor mappings connect around inputs to target labels; stacked annotations enter in written order.

## ]

```text
[ ... ]
```

End a list literal or interceptor annotation.

## {

```text
{1, 2} or {1: "apples"}
```

Start a set literal, map literal, or statement block. Comma-separated values create a Set; key: value pairs create a Map. Empty {} needs a declared Set or Map type. Classes, interfaces, interceptors, tests, functions, and control flow use braces for blocks.

## }

```text
{ ... }
```

End a block, set literal, or map literal.

## @code

```text
{@code expression}
```

Show an inline fragment as code in generated editor help.

## @deprecated

```text
@deprecated reason
```

Explain why this declaration should no longer be used.

## @exception

```text
@exception ErrorType description
```

Alias of `@throws`.

## @inheritDoc

```text
{@inheritDoc}
```

Insert documentation from the implemented or extended interface method.

## @link

```text
{@link Type}
```

Show a related declaration name as code in generated editor help.

## @param

```text
@param name description
```

Document a parameter in the Javadoc comment immediately before a class, function, or method. The text appears in hover and signature help.

## @return

```text
@return description
```

Document the returned value of a function or method.

## @returns

```text
@returns description
```

Alias of `@return`.

## @see

```text
@see OtherSymbol
```

Point readers to related declarations or documentation.

## @throws

```text
@throws ErrorType description
```

Document a declared error and when it is raised.

## *

```text
left * right
```

Multiply numbers.

## /

```text
left / right
```

Divide numbers. Integer division truncates toward zero. A potentially zero divisor raises checked ArithmeticError; a literal nonzero divisor needs no error clause. MIN/-1 wraps to MIN.

## +

```text
left + right
```

Add numbers or join strings.

## <

```text
left < right
```

Compare compatible numbers. Inside type arguments, `<` starts a generic argument list.

## <=

```text
left <= right
```

Compare compatible numbers; the result is `bool`.

## =

```text
name = value;
```

Assign a value. `to` is an equivalent assignment spelling: `name to value;` or `Type name to value;`. Use `own Type name to value;` for exclusive ownership.

## ==

```text
left == right
```

Compare values for equality; the result is `bool`.

## >

```text
left > right
```

Compare compatible numbers. Inside type arguments, `>` ends a generic argument list.

## >=

```text
left >= right
```

Compare compatible numbers; the result is `bool`.

## always

```text
try: ... always: ...
```

Run cleanup on success, checked errors, returns and cancellation. Cancellation bypasses ordinary catch blocks; cleanup runs before the scope ends.

## and

```text
left and right
```

Logical AND on bool values. Skip the right operand when the left operand is false. Also join named imports, checked errors, contracts, and grouped task waits. Comparisons and not bind before and; and binds before or.

## arguments

```text
arguments() returns List<string>
```

Composition arguments. Other callables receive the Arguments capability.

## ArithmeticError

```text
ArithmeticError implements Error
```

Checked failure for division by zero. int arithmetic otherwise wraps in the signed 64-bit range.

## around

```text
around(Type input) returns Type { return next(); }
```

The required entry point of an interceptor. Its parameters select target arguments, and its result must fit the target return type. A forwarding body can omit returns and inherit the target result. It may validate, override mapped arguments, inspect the result, throw a checked error, or return early. Declare generic parameters on the interceptor header. Helper methods can be declared alongside around.

## as

```text
lock shared as state: ...
```

Name a local value, lock view, or HTTP endpoint. wait for accepts as or to for result names.

## assert

```text
assert(condition=bool) returns void
```

Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

## body

```text
User input from body
```

Decode a concrete JSON data type. Malformed JSON returns 400; valid JSON with a wrong schema returns 422; wrong media type returns 415; body limits return 413.

## bool

```text
bool
```

Boolean type used by conditions and logical operators.

## borrow

```text
borrow value { ... }
```

Take exclusive mutable access for the duration of this block. Ordinary reads need no borrow. Managed List, Set, and Map mutations require one. If a child task reads the value, wait for it before mutating the value again.

```text
borrow items { items.append(value=1) }
```

## Bytes

```text
Bytes
```

Immutable length-aware binary data. text() validates UTF-8; base64url() emits canonical unpadded URL-safe base64. slice(start, end) copies a checked half-open range and hex() returns lowercase hexadecimal.

## C

```text
extern C name(...);
```

Selects C as the foreign function interface for an `extern` declaration.

## c_int

```text
c_int
```

Signed 32-bit C int. Convert explicitly with c_int(value=number), which raises ConversionError on overflow. It widens to int without loss. AugScript int maps to int64_t at the C boundary.

## capability

```text
capability Console { write(string value) uses Console.write }
```

Declare an interface for I/O or other external effects. Import Console, FileReader, FileWriter, or Arguments from august.io, choose a provider in main, and receive it through resolve inputs. Tests can supply another provider.

## catch

```text
catch Error error { ... }
```

Handle a thrown error from the preceding `try` block. The caught value is available under the name after its type.

## changes

```text
increment() changes self
```

State which caller-visible values an operation may change. Bodies infer changes when omitted, but callers still need mutable access. Bodyless interfaces state permitted changes. Writes to local variables and fresh local objects do not change caller-owned state. An explicit clause limits the body.

## composition

```text
composition Services: implement Logger with Adapter
```

Collect dependency bindings in a named composition. Import and include it in main before startup statements. The composition’s file must import every interface and provider it uses.

## Compress

```text
[Compress]
```

Negotiate gzip from Accept-Encoding, respecting q=0. Buffered output and each bounded stream item are compressed with standard gzip members. Adds Content-Encoding and Vary; backpressure remains active.

## ConversionError

```text
ConversionError implements Error
```

Checked failure when c_int(value=number) cannot fit the signed 32-bit C int range. Catch it or let it propagate.

## cookie

```text
optional string session from cookie "session"
```

Bind one named cookie. Missing input is distinct from an empty string, and repeated cookies are rejected.

## Cors

```text
[Cors(origins=["https://example.test"], headers=["content-type"], credentials=true)]
```

Allow exact literal HTTP(S) origins and explicit request header names. OPTIONS preflight checks the selected method and headers. Wildcard origins cannot use credentials. Valid responses include CORS and Vary headers; disallowed origins return 403.

## Data

```text
Data
```

A constraint for deeply immutable data: primitives, immutable records and frozen data collections. Behavioral objects cannot satisfy it.

## else

```text
else { ... }
```

Run this block when the preceding `if` condition is false.

## endpoint

```text
endpoint GET "/users/{id}" as getUser(int id from path) returns User
```

Declare a typed HTTP route. Inputs name their wire source; dependencies use resolve. Main explicitly selects which endpoints to serve.

## Error

```text
Error
```

Root throwable interface. User defined error classes implement `Error`; `catch Error` handles any throwable type.

## everything

```text
import everything from logging
```

Import every public declaration defined by a sibling file, or every public export listed in a folder’s export.aug. Private names and transitive imports are excluded. Name conflicts are compile errors. Explicit named imports make dependencies easier to understand.

## exit

```text
exit(status=int) returns void
```

Exit from main with a status from 0 to 255 after cancellation and cleanup.

## export

```text
export Name from sibling;
```

Expose a public sibling declaration to other folders. Names, modules, and folders starting with `_` are private and cannot be exported. Export declarations belong only in `export.aug`.

```text
export Logger from logger;
```

## extends

```text
interface Child extends Parent, Other { ... }
```

Inherit methods from one or more interfaces. Class inheritance is not supported.

## extern

```text
extern C name(Type arg) returns Type
```

Declare a C function. Calls require unsafe and executable callers infer uses C.name. int maps to int64_t, c_int to signed 32-bit int, float to double, bool to C bool, and string to a temporary UTF-8 const char pointer. Foreign code must respect the declared ABI and cannot retain managed pointers.

## false

```text
false
```

Boolean false. and and or evaluate the right side only when needed. Conditions require bool values.

## FileError

```text
FileError
```

Checked failure from text file operations. Catch it or let it propagate.

## fixture

```text
fixture example() returns Data: ...
```

Declare a function that prepares reusable test data. Import it from other files like any other function. Dependencies and capability calls follow ordinary function rules.

## float

```text
float
```

Floating point number type. Arithmetic supports `+`, `-`, `*`, and `/`.

## folder

```text
export folder child;
```

Expose a public child folder through the current folder’s `export.aug`. A folder starting with `_` cannot be exported.

## for

```text
for item in items: ...
```

Traverse a List, Set, homogeneous Tuple, or Map. Map entries are tuples, so for (key, value) in map unpacks them. Iteration snapshots the collection in insertion order and gives elements read-only access.

## form

```text
Login input from form
```

Decode named application/x-www-form-urlencoded fields into a record. Unknown or repeated scalar fields are rejected. Typed handle actions supply form data with input from form.

## freeze

```text
freeze ownValue as immutableValue
```

Consume owned mutable data and share one deeply frozen object. Surviving aliases cannot mutate it. Literal data can be frozen directly.

## fresh

```text
implement Counter with CounterImpl fresh
```

Construct a new instance for each resolution. Stateful bindings use this lifetime by default, including objects that retain stateful dependencies.

## from

```text
import Name from module;
```

Names the source of an import or export. Dotted paths cross folders; each crossed folder must expose the next one with `export folder child;`. A module starting with `_` is private.

## handle

```text
handle updateUser(id=userId, input from form)
```

Describe a deferred call to a served endpoint. Inputs are checked against wire parameters; DI is resolved when the HTTP request runs. onSubmit and onClick accept HttpAction values, with automatic request transport.

## header

```text
optional string authorization from header "authorization"
```

Bind a case-insensitive HTTP field. Repeated scalar headers are rejected. Headers.all preserves repeated fields explicitly.

## Headers

```text
Headers
```

Immutable HTTP fields. with adds a checked field; get and all read case-insensitively. Duplicate Set-Cookie values remain separate.

## Html

```text
Html
```

Checked server markup produced with JSX elements and components. Interpolated text and attributes are escaped automatically.

## HttpAction

```text
HttpAction
```

An immutable deferred HTTP call created with handle endpoint(...). Bind it to a form onSubmit or button onClick. The browser sends the request; endpoint dependencies and application logic run on the server.

## HttpRequest

```text
HttpRequest
```

A request supplied through from request. Headers are available before upload reception. Reading body waits for the bounded upload and can raise HttpError; early rejection sends no 100 Continue. form<T>() allows protocol-specific form errors.

## HttpResponse

```text
HttpResponse<T>
```

A typed HTTP body with explicit status and headers. HttpResponse(body=value, status=201, headers=headers) constructs a response. Status literals range from 200 to 599; a dynamic status requires handling or declaring HttpError.

## HttpTestClient

```text
test endpoint getUser client: ...
```

A suite-supplied HTTP pipeline client. request(method="GET", path="/users/1", headers=..., body=...) returns HttpResponse<Bytes>. It exercises routing, decoding, request DI, policies, and serialization without a listening socket. Streaming collection is bounded by web.response_limit. Each it case runs with fresh test bindings.

## if

```text
if condition: ...
```

Run a block when its condition is bool. Use braces or a trailing colon and an indented body. Tabs or spaces are accepted; mixed indentation prefixes are rejected.

## implement

```text
implement Interface with Implementation
```

Register an implementation in main or test setup. Stateless bindings are shared by default; stateful bindings are fresh. Choose shared mutable or scoped mutable explicitly when retaining mutable state. Headers supply all construction dependencies; binding order is independent and cycles are checked.

## implements

```text
Name() implements Interface { ... }
```

Marks a declaration as a class and lists the interfaces it satisfies. Every class needs at least one interface. Method signatures must match. Conflicting default implementations require an override. Put constructor work in an initialize block inside the class.

## import

```text
import Logger and ConsoleLogger from logging
```

Bring public declarations into this file. Use `and` for several names, or `import everything from logging` for all public sibling declarations or folder exports. Imported dependencies are never re-exported implicitly. Names or modules starting with `_` stay private. A sibling module uses its filename without `.aug`; a folder exposes only names listed in `export.aug`. A quoted public repository URL declares a source dependency; `aug run` installs it and locks its commit. Use `aug add URL --as NAME` for a shorter import alias.

## in

```text
interface Consumer<in T>
```

Declare a contravariant interface type parameter. It may occur only in checked input positions. User-defined types are otherwise invariant. The same word is used by for iteration.

## include

```text
include Services
```

Expand an explicitly imported composition into the application root. Duplicate bindings and dependency cycles are checked after all includes are collected.

## IndexError

```text
IndexError implements Error
```

Checked failure for an invalid List.get position. Catch it or let it propagate. List.at returns a value or null instead.

## initialize

```text
initialize: ...
```

Run constructor work once after header inputs and local fields are initialized, before returning the class or record. Put this block inside the declaration, before class methods. Construction stays pure. Classes declare checked constructor failures with unless before implements; failed construction releases transferred owned fields. Records can infer validation failures but cannot replace immutable fields.

## input

```text
handle createUser(input from form)
```

Read named form controls into the endpoint’s record input when a browser submits the action. Labels, scalar conversion, optional fields, and server schema validation follow the endpoint contract.

## int

```text
int
```

Signed 64-bit integer, from -9223372036854775808 to 9223372036854775807. Literals retain their exact value. Addition, subtraction, multiplication and MIN/-1 division wrap modulo 2^64. Dynamic division requires ArithmeticError handling. Mixed float arithmetic may lose integer precision.

## interceptor

```text
interceptor Name<T>(resolve Dependency dependency) { around(...) returns T { ... } }
```

Declare a reusable wrapper for functions, methods, or class construction. Apply it with `[Name]` or `[Name(y=x)]`. Inputs match target labels automatically; explicit mappings rename them. Tags enter in written order and results unwind in reverse. Each layer creates a fresh instance; dependencies are forwarded from the target header. Effective contracts include every layer’s changes, capabilities, errors, and dependencies. Generic types are inferred from the target. Interceptors follow normal imports, exports, and underscore privacy.

## interface

```text
interface Name extends Parent { ... }
```

Declare a contract. Interfaces may extend several interfaces and may provide default method bodies. A class must implement every method without a default. Method signatures start with their name, for example `log(string message);`.

## it

```text
it TEST_NAME { assert(condition) }
```

Define a test case within a when group. Names may be identifiers or quoted descriptions. Group setup variables are visible, but other cases are not. Failed assertions and uncaught errors fail this case; the runner continues with the remaining cases. A case that executes no assertions fails.

## Json

```text
Json
```

Immutable JSON data. Import parse from the JSON source package, decode concrete records with decode<T>(), and stringify with lossless integer handling. has(name) distinguishes a missing field from JSON null; parseCompatible is a separate legacy-boundary parser.

## List

```text
List<T>
```

Ordered collection: `[1, 2]` infers List<int>. A typed declaration supplies empty or nested literal types: `List<int> numbers = []`. `List<T>(...)` also accepts positional elements. `append(value=...)` requires mutable access; `get(index=...)` reads; `length()` returns its size.

## lock

```text
lock sharedValue as state: ...
```

Grant exclusive mutation of Shared<T> for a short block. Waiting, starting tasks, nested locks and I/O are forbidden inside. Unlocking is guaranteed on return or error.

## LogRequest

```text
[LogRequest(logger=logger)]
```

Map a resolve RequestLogger parameter and infer its complete operation. Observe the final status and monotonic duration after output finishes, or status 499 on disconnect. Layers complete in reverse written order.

## Map

```text
Map<K,V>
```

Hash map: `{1: "apples", 2: "pears"}` infers Map<int, string>. A typed declaration supplies empty types: `Map<int, string> fruit = {}`. Duplicate keys keep the last value. `set(key=..., value=...)` requires mutable access; `get(key=...)` returns optional V; `contains(key=...)` and `length()` read. Primitive keys and tuples compare by value; other objects use identity.

## match

```text
match value: when ...
```

Choose a checked case. Cover true and false for bool, null and some for nullable values, or add else. Concrete class cases narrow the named value. Duplicate and unreachable cases are rejected.

## mutable

```text
Counter(mutable int initial to _count)
```

Declare mutable class storage. Header fields are otherwise read-only after construction. An explicit public argument label can initialize private storage with Type label to _field. Bodies infer changes self; callers provide mutable access.

## next

```text
next(mappedLabel=value) returns TargetResult
```

Continue to the next interceptor layer or the original function/constructor. Available only inside an interceptor around body. `next()` forwards original arguments unchanged; optional labeled overrides use the interceptor parameter names and map back to the target. Unselected arguments are forwarded automatically. The compiler requires at most one next call on each execution path. Target errors propagate through the chain; additional errors declared by around become checked errors of the tagged callable.

## not

```text
not count == 0
```

Negate a bool expression. Comparisons bind before not, so not count == 0 means not (count == 0). not binds before and and or. Use parentheses to negate only one comparison operand. Symbolic ! is rejected; != remains inequality.

## null

```text
null
```

The absent value of optional Type. Omitted optional inputs also become null. Narrow local values with if value != null, an early return guard, or match null/some before calling members. The checker narrows mutable fields conservatively because another alias may change them.

## optional

```text
optional T value
```

Allow a value of T or null. Omitted optional inputs and fields become null. Match null and some, or check != null, before reading the value. This is the only optional type spelling; Type? is rejected.

## or

```text
left or right
```

Logical OR on bool values. Skip the right operand when the left operand is true. This is the lowest-precedence boolean operator. Symbolic || is rejected.

## out

```text
interface Producer<out T>
```

Declare a covariant interface type parameter. It may occur only in checked output positions. Mutable containers are invariant; classes and interceptors cannot declare variance.

## own

```text
own Type name to expression;
```

Give a value exclusive ownership and deterministic cleanup at scope exit. Owned values cannot be copied; they can move into `own` parameters, fields, or returns. `=` is also accepted.

```text
own Resource resource to Resource();
```

## pass

```text
pass
```

An empty body. Use it inside an indented interface, class, function, or statement block. It performs no operation. Empty braced blocks may use {} instead.

## path

```text
int id from path
```

Bind a required path placeholder by name. A label after the source can select a different wire name: int userId from path "id".

## print

```text
print(value=any) returns void
```

Write application startup or test output. Other callables receive a Console dependency and call console.write; their bodies infer that capability use.

## pure

```text
extern C value pure operation(...)
```

A trusted native value adapter promises no effects or mutation. The foreign call still belongs inside unsafe; its declared errors remain checked.

## query

```text
optional string search from query
```

Bind one query parameter. Omitted optional input becomes null; repeated scalar parameters are rejected.

## RateLimit

```text
[RateLimit(requests=100, seconds=60)]
```

A bounded per-endpoint, per-peer fixed-window request limit. Uses the transport peer address, never an untrusted forwarding header. Rejected requests return 429 before body decoding. The table has 2048 entries and rejects new identities when full.

## read_file

```text
read_file(path=string) returns string unless FileError
```

Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError.

## record

```text
record Point(int x, int y)
```

Declare deeply immutable data with labeled construction and structural equality/hashing. Records contain primitives, tuples and other records. An initialize block validates inputs; its escaping errors are inferred; an explicit unless ErrorType limits permitted failures.

## request

```text
HttpRequest request from request
```

Receive the immutable raw request when a protocol requires its own binding and error responses.

## RequireLogin

```text
[RequireLogin(authentication=auth)]
```

Verify credentials before typed body decoding. Map auth to an explicit resolve Authentication parameter and infer its authenticate operation. null produces 401; the adapter validates the credential. HTTP policies precede custom parameter interceptors.

## RequirePermission

```text
[RequirePermission(authentication=auth, authorization=permissions, permission="users.read")]
```

Authenticate the request and authorize one literal permission before decoding. Receive both dependencies through resolve inputs. The handler infers their authenticate and authorize operations. Missing credentials produce 401 and a denied permission produces 403.

## resolve

```text
resolve Logger logger; resolve app to program
```

Declare a dependency in a class or callable header. Callers omit its argument and forward the matching header dependency. Only main and test setup retrieve bindings directly with resolve app to program. Assignment-form resolve is rejected. Scoped dependencies require a scope block.

## resource

```text
extern C resource Tensor
```

Declare an opaque native resource and its release operation. The descriptor must match the declaration. Store acquired resources in own bindings; scope exit releases them once. Declare resources in native packages, outside main.aug.

## return

```text
return expression;
```

Finish the current function or method and give its result to the caller. A `void` function can use `return;`.

## returns

```text
name() returns Type
```

Bodies infer their result from return expressions or their implemented interface when this clause is omitted. No returned value means void. Bodyless signatures still need non-void result types. Explicit result types are checked assertions; returns own Type explicitly transfers ownership. Recursive or ambiguous results may require a type anchor.

## scope

```text
scope: ...
```

Create a local DI and child-task lifetime. Children join before dependencies are reclaimed; unhandled failures cancel siblings. Scoped references cannot escape. Nested scopes have independent caches.

## scoped

```text
implement Counter with CounterImpl scoped mutable
```

Cache a binding within a composition scope. Nested scope blocks have independent caches and restore the parent cache on exit. Stateful caching requires the explicit mutable choice.

## serve

```text
serve getUser and createUser on port 8080
```

Start the native HTTP server with explicitly imported endpoints. Each request receives a separate DI and task scope.

## ServerEvent

```text
ServerEvent<T>
```

One SSE event containing concrete JSON data, plus optional id, event, and retry milliseconds. CR, LF and NUL are rejected in metadata. The endpoint streams ServerEvent<T> and yields each event under transport backpressure.

## Set

```text
Set<T>
```

Hash set of unique values: `{1, 2, 1}` infers Set<int> with two items. Use `Set<int> numbers = {}` or `Set<int>()` for an empty set. `add(value=...)` requires mutable access; `contains(value=...)` and `length()` read. Primitive values and immutable tuples use value equality; other objects use identity.

## shared

```text
implement Logger with Adapter shared
```

Cache one stateless binding for the process. Sharing stateful instances requires an explicit shared mutable choice. A process binding cannot retain a scoped dependency.

## Shared

```text
Shared<T>
```

Synchronized mutable state. Construction takes a fresh or owned value. Read and mutate the value only through lock shared as state. A child borrowing an owned Shared<T> pins the wrapper until it finishes; the parent cannot move it into another owner while the child uses it.

## some

```text
when some value: ...
```

Match the present case of a nullable value and introduce a read-only non-null name within the case body. Pair it with when null to cover absence explicitly.

## start

```text
task = start loadUsers()
```

Start a child Task in a scope. Receiver and arguments evaluate immediately. Cooperative tasks capture references; wait before mutating or moving captured objects. Use start worker calculate(values) to copy data to an isolated heap and run on an OS thread. Both forms use the same waits, sibling cancellation, and scope joins. Worker admission and copied-input limits can raise checked ConcurrencyError at start.

## streams

```text
endpoint GET "/events" as events() streams ServerEvent<Event>
```

Declare a bounded streaming HTTP response. Yield values in wire order; disconnect cancels the request scope.

## string

```text
string
```

Immutable valid Unicode encoded as UTF-8, without embedded NUL. Invalid literals are compile errors and invalid text files raise FileError. The + operator joins strings. C string pointers live only for the unsafe call.

## Task

```text
Task<T>
```

A child computation owned by a scope. wait for reads its result; the scope joins children before releasing dependencies.

## test

```text
test Calculator subject: ... or test add: ... or test endpoint getUser client: ...
```

Declare tests beside the class, function, or endpoint. Class suites initialize their subject; function suites omit a subject. Endpoint suites receive a native pipeline client. Parameterized it cases use for (inputs) in tuple rows. Tests are omitted from production executables; aug test selects groups/cases and --coverage records statement lines.

## throw

```text
throw error;
```

Raise a value whose class implements `Error`. An executable body infers uncaught errors; main must handle them with a matching catch.

## Timeout

```text
[Timeout(milliseconds=5000)]
```

Bound the request and its streaming producer with a monotonic deadline. Before output, return 504. After headers, terminate the stream. Cancellation joins children and runs always cleanup; native C operations finish before cancellation can be observed.

## to

```text
destination to value
```

Alternative to = in assignments, typed declarations, labeled call arguments and interceptor mappings. Type publicLabel to _storage separates a public constructor input from private storage. resolve app to program retrieves a binding using its declared lifetime. Configure assignment in main.yaml for consistent formatting.

## true

```text
true
```

Boolean true. Conditions and logical operators require `bool`.

## try

```text
try { ... } catch Error error { ... }
```

Run statements that may throw checked errors. Add a `catch` for each error, or use `catch Error` for any throwable error.

## Tuple

```text
Tuple<T1, T2, ...>
```

Fixed immutable positions: `(1, 2)` infers Tuple<int, int>, `(1, "apple")` infers Tuple<int, string>. `(1)` is grouping, `(1,)` is a singleton tuple, and `()` is empty. `get(index=0)` requires a constant index so its result type is known. `length()` reads its size. Tuples compare by their items; contained objects remain managed references.

## unless

```text
load(bool fail) unless FileError
```

State which checked errors may escape a call. Bodies and record validation infer uncaught errors when unless is omitted. Catch blocks handle errors; main must handle any that reach it. Bodyless interfaces state permitted errors explicitly. An explicit unless clause limits the body; unless Error permits any error type.

## unsafe

```text
unsafe { ... }
```

Permit calls to declared `extern C` functions within this block. The compiler does not verify the safety of foreign code.

## uses

```text
save(resolve FileWriter files, string path)
```

State which capability operations a callable may use. Executable bodies infer these operations when uses is omitted; the editor displays them as hints. Bodyless interfaces and extern declarations state them explicitly. An implementation cannot exceed its written uses clause or interface. Construction and cleanup remain pure.

## void

```text
void
```

No return value. A function can omit `returns void`.

## wait

```text
wait for usersTask and ordersTask as users and orders
```

Wait for scoped tasks without changing result order. A List<Task<T>> produces List<T> and joins every child in the list. Waiting for one dynamically selected task leaves possible siblings captured until their scope joins them. A wait may encounter an unhandled sibling failure. Grouped waits observe all selected children before rethrowing the first failure. Waiting for I/O suspends a task.

## when

```text
when GROUP_NAME { implement Dependency with Fake; ... }
```

Group related test cases and declare their test dependencies. Names may be identifiers or quoted descriptions. Put bindings first, then setup statements, then it cases. Each case re-runs setup with fresh bindings in a separate native process; production bindings and startup code do not run.

## while

```text
while condition { ... }
```

Repeat a block while its condition remains `bool`.

## with

```text
implement key with Class;
```

Separates a binding key from its implementing class. The class must satisfy an interface key.

## worker

```text
task = start worker calculate(values)
```

Run a standalone function on a worker with its own heap. Inputs and results are copied scalars, records, bytes, JSON, or collections of copied data. Construct dependencies and native resources inside the worker. Parent bindings, Shared values, behavior objects, tasks, own/borrow inputs, and native handles cannot cross the boundary. Native calls require an explicit workerSafe package contract. GPU operations belong in a native package; its handles stay on this worker.

## write_file

```text
write_file(path=string, content=string) returns void unless FileError
```

Root-only UTF-8 text output. Other callables receive FileWriter.

## yield

```text
yield value
```

Send a value from a streaming endpoint. Backpressure suspends the producer until the transport can accept it.

## HttpTestClient operations

### HttpTestClient.request

Run this suite’s endpoint through native routing, typed binding, request-scoped DI, policies, and response serialization. No listening socket is opened. Streaming output is collected up to the configured response limit.

## HttpRequest operations

### HttpRequest.form

Decode a form record inside a handler so protocol-specific error responses can be returned.

## Headers operations

### Headers.with

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

### Headers.get

Read the first case-insensitive header value, or null.

### Headers.all

Read every value of this header in wire order.

## Json operations

### Json.has

Test object-member presence. A present JSON null returns true; an absent member returns false.

### Json.stringify

Serialize this JSON value with checked UTF-8 escaping and exact int64 values.

### Json.get

Read an object member. An absent member or JSON null returns null.

### Json.require

Read a required object member or raise JsonError.

### Json.string

Require a JSON string.

### Json.integer

Require an exact signed 64-bit JSON integer.

### Json.boolean

Require a JSON bool.

### Json.items

Read an immutable JSON array.

### Json.decode

Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.

## float operations

### float.isFinite

Test whether this binary64 value is neither infinity nor NaN.

### float.float32

Round to IEEE 754 binary32 and return the rounded value as float. Reject nonfinite input or overflow.

## string operations

### string.trim

Remove ECMAScript whitespace and line terminators from both ends; preserve interior text.

### string.utf16Length

Count UTF-16 code units for JavaScript wire limits; supplementary characters count as two.

### string.isDecimal

Require a nonempty ASCII unsigned decimal string. Leading zeros are allowed.

### string.compareDecimal

Compare unsigned decimal strings without integer conversion. Leading zeros do not affect the result; return -1, 0, or 1.

### string.isToken

Require an ASCII RFC 3986 unreserved token with a bounded length.

### string.length

Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

### string.bytes

Encode this string as immutable UTF-8 bytes.

### string.split

Split at an exact separator, preserving empty parts.

### string.startsWith

Test an exact prefix.

## Bytes operations

### Bytes.length

Read the number of elements.

### Bytes.slice

Copy bytes in the half-open range [start, end). Require 0 <= start <= end <= length.

### Bytes.hex

Encode bytes as lowercase hexadecimal, including embedded zeros.

### Bytes.text

Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.

### Bytes.base64url

Encode immutable bytes as unpadded RFC 4648 URL-safe base64.

## List operations

### List.append

Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.

### List.get

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

### List.at

Read a zero-based position, returning null when it is absent. Narrow the result before using it.

### List.length

Read the number of elements.

## Set operations

### Set.add

Insert a unique element with exclusive mutable access.

### Set.contains

Test structural or identity equality with a stored element.

### Set.length

Read the number of elements.

## Map operations

### Map.take

Remove and return an entry under exclusive access. An absent key returns null.

### Map.set

Insert or replace an entry with exclusive mutable access.

### Map.get

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

### Map.contains

Check for a key, including entries whose value is null.

### Map.length

Read the number of elements.

## Tuple operations

### Tuple.get

Read a statically checked constant position. Prefer tuple destructuring when reading several positions.

### Tuple.length

Read the number of elements.

## Unsupported spellings

Use `and`, `or`, `not`, `unless`, `optional T`, `null`, `implement … with …`, and `initialize`. Declarations start with their name, without a class or function prefix. Symbolic booleans, arrow constructors, and `T?` are rejected. [Diagnostics](diagnostics.md) explains fixes and migration.

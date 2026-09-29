---
title: "august/0.19.0/web/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/web/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/web/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

## Code {#code}

::: code-group

```aug [Indentation]
/** Immutable identity returned by an explicitly injected authentication adapter. */
record Principal(string subject, List<string> permissions)
/** Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError. */
capability Authentication:
    authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError
/** Decide whether a verified identity has one named permission. */
capability Authorization:
    authorize(Principal identity, string permission) returns bool uses Authorization.authorize unless HttpError
/** Observe a completed HTTP exchange, including failures and disconnects. */
capability RequestLogger:
    complete(string method, string path, int status, int milliseconds) uses RequestLogger.complete
extern C value _aug_http_log(string method, string path, int status, int milliseconds) uses RequestLogger.complete
/** Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded. */
WebRequestLogger() implements RequestLogger:
    complete(string method, string path, int status, int milliseconds):
        unsafe:
            _aug_http_log(method, path, status, milliseconds)
/** An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller. */
capability HttpClient:
    /** Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack. */
    request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> uses HttpClient.request unless HttpError
extern C value _aug_http_request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> uses HttpClient.request unless HttpError
/** Native libwebsockets transport. No socket is opened by construction. */
WebHttpClient() implements HttpClient:
    request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> unless HttpError:
        unsafe:
            return _aug_http_request(method=method, url=url, headers=headers, body=body)
/** Return a redirect with an explicit status. Location is checked as a header value. */
redirect(string location, optional int status) returns HttpResponse<string> unless HttpError:
    code = 303
    match status:
        when null:
            pass
        when some value:
            code = value
    headers = Headers().with(name="location", value=location)
    return HttpResponse(body="", status=code, headers=headers)
extern C value pure _aug_http_url_encode(string input) returns string unless HttpError
/** Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters. */
urlEncode(string input) returns string unless HttpError:
    unsafe:
        return _aug_http_url_encode(input)
extern C value pure _aug_http_cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError
/** Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie. */
cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError:
    unsafe:
        return _aug_http_cookie(name, value, path, maxAge, secure)
```

```aug [Braces]
/** Immutable identity returned by an explicitly injected authentication adapter. */
record Principal(string subject, List<string> permissions)
/** Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError. */
capability Authentication {
    authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError
}
/** Decide whether a verified identity has one named permission. */
capability Authorization {
    authorize(Principal identity, string permission) returns bool uses Authorization.authorize unless HttpError
}
/** Observe a completed HTTP exchange, including failures and disconnects. */
capability RequestLogger {
    complete(string method, string path, int status, int milliseconds) uses RequestLogger.complete
}
extern C value _aug_http_log(string method, string path, int status, int milliseconds) uses RequestLogger.complete
/** Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded. */
WebRequestLogger() implements RequestLogger {
    complete(string method, string path, int status, int milliseconds) {
        unsafe {
            _aug_http_log(method, path, status, milliseconds)
        }
    }
}
/** An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller. */
capability HttpClient {
    /** Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack. */
    request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> uses HttpClient.request unless HttpError
}
extern C value _aug_http_request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> uses HttpClient.request unless HttpError
/** Native libwebsockets transport. No socket is opened by construction. */
WebHttpClient() implements HttpClient {
    request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> unless HttpError {
        unsafe {
            return _aug_http_request(method=method, url=url, headers=headers, body=body)
        }
    }
}
/** Return a redirect with an explicit status. Location is checked as a header value. */
redirect(string location, optional int status) returns HttpResponse<string> unless HttpError {
    code = 303
    match status {
        when null {
            pass
        }
        when some value {
            code = value
        }
    }
    headers = Headers().with(name="location", value=location)
    return HttpResponse(body="", status=code, headers=headers)
}
extern C value pure _aug_http_url_encode(string input) returns string unless HttpError
/** Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters. */
urlEncode(string input) returns string unless HttpError {
    unsafe {
        return _aug_http_url_encode(input)
    }
}
extern C value pure _aug_http_cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError
/** Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie. */
cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError {
    unsafe {
        return _aug_http_cookie(name, value, path, maxAge, secure)
    }
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `Principal` {#symbol-Principal}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Immutable identity returned by an explicitly injected authentication adapter.

**Inputs and dependencies**

- `subject`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `subject`. The field is read-only after initialization.
- `permissions`: `List<string>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `permissions`. The field is read-only after initialization.

### `Authentication` {#symbol-Authentication}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

#### `Authentication.authenticate` {#symbol-Authentication.authenticate}

[source](contracts.md#code)

**Inputs and dependencies**

- `request`: `HttpRequest`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`optional Principal`](contracts.md#symbol-Principal).

Capabilities: [`Authentication.authenticate`](contracts.md#symbol-Authentication.authenticate).

Possible failures: `HttpError`. The caller must catch or propagate them.

Interface contract. A selected implementation supplies the behavior.

### `Authorization` {#symbol-Authorization}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Decide whether a verified identity has one named permission.

#### `Authorization.authorize` {#symbol-Authorization.authorize}

[source](contracts.md#code)

**Inputs and dependencies**

- `identity`: [`Principal`](contracts.md#symbol-Principal). The caller supplies this labeled input. Read reference values without copying them.
- `permission`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Authorization.authorize`](contracts.md#symbol-Authorization.authorize).

Possible failures: `HttpError`. The caller must catch or propagate them.

Interface contract. A selected implementation supplies the behavior.

### `RequestLogger` {#symbol-RequestLogger}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Observe a completed HTTP exchange, including failures and disconnects.

#### `RequestLogger.complete` {#symbol-RequestLogger.complete}

[source](contracts.md#code)

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `status`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `milliseconds`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Interface contract. A selected implementation supplies the behavior.

### `WebRequestLogger` {#symbol-WebRequestLogger}

[source](contracts.md#code)

Behavioral class.

Satisfies [`RequestLogger`](contracts.md#symbol-RequestLogger).

**Author documentation**

Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded.

#### `WebRequestLogger.complete` {#symbol-WebRequestLogger.complete}

[source](contracts.md#code)

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `status`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `milliseconds`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Call [`_aug_http_log`](contracts.md#symbol-_aug_http_log) with `method` set to `method`; `path` set to `path`; `status` set to `status`; `milliseconds` set to `milliseconds`.

### `HttpClient` {#symbol-HttpClient}

[source](contracts.md#code)

Capability interface.

**Author documentation**

An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller.

#### `HttpClient.request` {#symbol-HttpClient.request}

[source](contracts.md#code)

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `url`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `headers`: `optional Headers`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `body`: `optional Bytes`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.

Result: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

Interface contract. A selected implementation supplies the behavior.

### `WebHttpClient` {#symbol-WebHttpClient}

[source](contracts.md#code)

Behavioral class.

Satisfies [`HttpClient`](contracts.md#symbol-HttpClient).

**Author documentation**

Native libwebsockets transport. No socket is opened by construction.

#### `WebHttpClient.request` {#symbol-WebHttpClient.request}

[source](contracts.md#code)

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `url`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `headers`: `optional Headers`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `body`: `optional Bytes`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.

Result: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_http_request`](contracts.md#symbol-_aug_http_request) with `method` set to `method`; `url` set to `url`; `headers` set to `headers`; `body` set to `body` and finish this operation.

### `redirect` {#symbol-redirect}

[source](contracts.md#code)

**Inputs and dependencies**

- `location`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `status`: `optional int`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.

Result: `HttpResponse<string>`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Return a redirect with an explicit status. Location is checked as a header value.

**Behavior when execution reaches this operation**

- Set `code` to `303`.
- Select the matching case for `status`:
  - A null value, including omitted optional input:
    - Continue without another operation.
  - A present, non-null value, named `value`:
    - Set `code` to `value`.
- Set `headers` to the result of call `with` on the result of call `Headers` with `name` set to `"location"`; `value` set to `location`.
- Return the result of call `HttpResponse` with `body` set to `""`; `status` set to `code`; `headers` set to `headers` and finish this operation.

### `urlEncode` {#symbol-urlEncode}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_http_url_encode`](contracts.md#symbol-_aug_http_url_encode) with `input` set to `input` and finish this operation.

### `cookie` {#symbol-cookie}

[source](contracts.md#code)

**Inputs and dependencies**

- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Author documentation**

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_http_cookie`](contracts.md#symbol-_aug_http_cookie) with `name` set to `name`; `value` set to `value`; `path` set to `path`; `maxAge` set to `maxAge`; `secure` set to `secure` and finish this operation.

### `_aug_http_log` {#symbol-_aug_http_log}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `status`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `milliseconds`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_http_request` {#symbol-_aug_http_request}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `method`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `url`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `headers`: `optional Headers`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `body`: `optional Bytes`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.

Result: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Possible failures: `HttpError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_http_url_encode` {#symbol-_aug_http_url_encode}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `HttpError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `_aug_http_cookie` {#symbol-_aug_http_cookie}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.

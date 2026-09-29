---
title: "august/0.19.0/web/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/web/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/web/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Principal`](contracts.md#symbol-Principal) is an immutable record.
- [`Authentication`](contracts.md#symbol-Authentication) is a capability interface.
- [`Authorization`](contracts.md#symbol-Authorization) is a capability interface.
- [`RequestLogger`](contracts.md#symbol-RequestLogger) is a capability interface.
- [`_aug_http_log`](contracts.md#symbol-_aug_http_log) is a function.
- [`WebRequestLogger`](contracts.md#symbol-WebRequestLogger) is a class implementing `RequestLogger`.
- [`HttpClient`](contracts.md#symbol-HttpClient) is a capability interface.
- [`_aug_http_request`](contracts.md#symbol-_aug_http_request) is a function returning `HttpResponse<Bytes>`.
- [`WebHttpClient`](contracts.md#symbol-WebHttpClient) is a class implementing `HttpClient`.
- [`redirect`](contracts.md#symbol-redirect) is a function returning `HttpResponse<string>`.
- [`_aug_http_url_encode`](contracts.md#symbol-_aug_http_url_encode) is a function returning `string`.
- [`urlEncode`](contracts.md#symbol-urlEncode) is a function returning `string`.
- [`_aug_http_cookie`](contracts.md#symbol-_aug_http_cookie) is a function returning `Headers`.
- [`cookie`](contracts.md#symbol-cookie) is a function returning `Headers`.

### `Principal` {#symbol-Principal}

[source](contracts.md#code)

Immutable record.

**Author documentation**

Immutable identity returned by an explicitly injected authentication adapter.

**Inputs**

- `subject` (`string`) — required labeled input — stored as `subject` and read-only after initialization.
- `permissions` (`List<string>`) — required labeled input — stored as `permissions` and read-only after initialization.

### `Authentication` {#symbol-Authentication}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

#### `Authentication.authenticate` {#symbol-Authentication.authenticate}

[source](contracts.md#code)

**Inputs**

- `request` (`HttpRequest`) — required labeled input.

Returns: [`optional Principal`](contracts.md#symbol-Principal).

Capabilities: [`Authentication.authenticate`](contracts.md#symbol-Authentication.authenticate).

Can fail with `HttpError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

### `Authorization` {#symbol-Authorization}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Decide whether a verified identity has one named permission.

#### `Authorization.authorize` {#symbol-Authorization.authorize}

[source](contracts.md#code)

**Inputs**

- `identity` ([`Principal`](contracts.md#symbol-Principal)) — required labeled input.
- `permission` (`string`) — required labeled input.

Returns: `bool`.

Capabilities: [`Authorization.authorize`](contracts.md#symbol-Authorization.authorize).

Can fail with `HttpError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

### `RequestLogger` {#symbol-RequestLogger}

[source](contracts.md#code)

Capability interface.

**Author documentation**

Observe a completed HTTP exchange, including failures and disconnects.

#### `RequestLogger.complete` {#symbol-RequestLogger.complete}

[source](contracts.md#code)

**Inputs**

- `method` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `status` (`int`) — required labeled input.
- `milliseconds` (`int`) — required labeled input.

Returns: no value.

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

**Inputs**

- `method` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `status` (`int`) — required labeled input.
- `milliseconds` (`int`) — required labeled input.

Returns: no value.

Capabilities: [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Call [`_aug_http_log`](contracts.md#symbol-_aug_http_log) with `method` = `method`; `path` = `path`; `status` = `status`; `milliseconds` = `milliseconds`.

### `HttpClient` {#symbol-HttpClient}

[source](contracts.md#code)

Capability interface.

**Author documentation**

An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller.

#### `HttpClient.request` {#symbol-HttpClient.request}

[source](contracts.md#code)

**Inputs**

- `method` (`string`) — required labeled input.
- `url` (`string`) — required labeled input.
- `headers` (`optional Headers`) — optional labeled input; omission becomes null.
- `body` (`optional Bytes`) — optional labeled input; omission becomes null.

Returns: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Can fail with `HttpError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

### `WebHttpClient` {#symbol-WebHttpClient}

[source](contracts.md#code)

Behavioral class.

Satisfies [`HttpClient`](contracts.md#symbol-HttpClient).

**Author documentation**

Native libwebsockets transport. No socket is opened by construction.

#### `WebHttpClient.request` {#symbol-WebHttpClient.request}

[source](contracts.md#code)

**Inputs**

- `method` (`string`) — required labeled input.
- `url` (`string`) — required labeled input.
- `headers` (`optional Headers`) — optional labeled input; omission becomes null.
- `body` (`optional Bytes`) — optional labeled input; omission becomes null.

Returns: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_http_request`](contracts.md#symbol-_aug_http_request) with `method` = `method`; `url` = `url`; `headers` = `headers`; `body` = `body`.

**Author documentation**

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

### `redirect` {#symbol-redirect}

[source](contracts.md#code)

**Inputs**

- `location` (`string`) — required labeled input.
- `status` (`optional int`) — optional labeled input; omission becomes null.

Returns: `HttpResponse<string>`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Set `code` to `303`.
- Select the matching case for `status`:
  - A null value, including omitted optional input:
    - Continue without another operation.
  - A present, non-null value, named `value`:
    - Set `code` to `value`.
- Set `headers` to call `with` on call `Headers` with `name` = `"location"`; `value` = `location`.
- Return call `HttpResponse` with `body` = `""`; `status` = `code`; `headers` = `headers`.

**Author documentation**

Return a redirect with an explicit status. Location is checked as a header value.

### `urlEncode` {#symbol-urlEncode}

[source](contracts.md#code)

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `string`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_http_url_encode`](contracts.md#symbol-_aug_http_url_encode) with `input` = `input`.

**Author documentation**

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters.

### `cookie` {#symbol-cookie}

[source](contracts.md#code)

**Inputs**

- `name` (`string`) — required labeled input.
- `value` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `maxAge` (`int`) — required labeled input.
- `secure` (`bool`) — required labeled input.

Returns: `Headers`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_http_cookie`](contracts.md#symbol-_aug_http_cookie) with `name` = `name`; `value` = `value`; `path` = `path`; `maxAge` = `maxAge`; `secure` = `secure`.

**Author documentation**

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

### `_aug_http_log` {#symbol-_aug_http_log}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `method` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `status` (`int`) — required labeled input.
- `milliseconds` (`int`) — required labeled input.

Returns: no value.

Capabilities: [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_http_request` {#symbol-_aug_http_request}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `method` (`string`) — required labeled input.
- `url` (`string`) — required labeled input.
- `headers` (`optional Headers`) — optional labeled input; omission becomes null.
- `body` (`optional Bytes`) — optional labeled input; omission becomes null.

Returns: `HttpResponse<Bytes>`.

Capabilities: [`HttpClient.request`](contracts.md#symbol-HttpClient.request).

Can fail with `HttpError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_http_url_encode` {#symbol-_aug_http_url_encode}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `string`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `_aug_http_cookie` {#symbol-_aug_http_cookie}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `name` (`string`) — required labeled input.
- `value` (`string`) — required labeled input.
- `path` (`string`) — required labeled input.
- `maxAge` (`int`) — required labeled input.
- `secure` (`bool`) — required labeled input.

Returns: `Headers`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### Built-in operations used by this file

- `Headers.with` (`name`: `string`, `value`: `string`) → `Headers`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. Can fail with `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::

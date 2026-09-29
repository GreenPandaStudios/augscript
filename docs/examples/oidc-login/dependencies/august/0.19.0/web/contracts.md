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

<a id="symbol-Principal"></a>
### `Principal` · immutable record · [source](contracts.md#code)

Immutable identity returned by an explicitly injected authentication adapter.

**Inputs:** Take `subject` (`string`); store read-only. Take `permissions` (`List<string>`); store read-only.

<a id="symbol-Authentication"></a>
### `Authentication` · capability interface · [source](contracts.md#code)

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

<a id="symbol-Authentication.authenticate"></a>
#### `Authentication.authenticate` · [source](contracts.md#code)

**Inputs:** Take `request` (`HttpRequest`).

Returns [`optional Principal`](contracts.md#symbol-Principal). Uses [`Authentication.authenticate`](contracts.md#symbol-Authentication.authenticate). Can fail with `HttpError`.

<a id="symbol-Authorization"></a>
### `Authorization` · capability interface · [source](contracts.md#code)

Decide whether a verified identity has one named permission.

<a id="symbol-Authorization.authorize"></a>
#### `Authorization.authorize` · [source](contracts.md#code)

**Inputs:** Take `identity` ([`Principal`](contracts.md#symbol-Principal)). Take `permission` (`string`).

Returns `bool`. Uses [`Authorization.authorize`](contracts.md#symbol-Authorization.authorize). Can fail with `HttpError`.

<a id="symbol-RequestLogger"></a>
### `RequestLogger` · capability interface · [source](contracts.md#code)

Observe a completed HTTP exchange, including failures and disconnects.

<a id="symbol-RequestLogger.complete"></a>
#### `RequestLogger.complete` · [source](contracts.md#code)

**Inputs:** Take `method` (`string`). Take `path` (`string`). Take `status` (`int`). Take `milliseconds` (`int`).

Uses [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

<a id="symbol-WebRequestLogger"></a>
### `WebRequestLogger` · class · [source](contracts.md#code)

Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded. Implements [`RequestLogger`](contracts.md#symbol-RequestLogger).

<a id="symbol-WebRequestLogger.complete"></a>
#### `WebRequestLogger.complete` · [source](contracts.md#code)

**Inputs:** Take `method` (`string`). Take `path` (`string`). Take `status` (`int`). Take `milliseconds` (`int`).

Uses [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

- Use native code with its declared contract:
  - Call [`_aug_http_log`](contracts.md#symbol-_aug_http_log) with `method`, `path`, `status`, `milliseconds`.

<a id="symbol-HttpClient"></a>
### `HttpClient` · capability interface · [source](contracts.md#code)

An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller.

<a id="symbol-HttpClient.request"></a>
#### `HttpClient.request` · [source](contracts.md#code)

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

**Inputs:** Take `method` (`string`). Take `url` (`string`). Take `headers` (`optional Headers`); omitted means null. Take `body` (`optional Bytes`); omitted means null.

Returns `HttpResponse<Bytes>`. Uses [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Can fail with `HttpError`.

<a id="symbol-WebHttpClient"></a>
### `WebHttpClient` · class · [source](contracts.md#code)

Native libwebsockets transport. No socket is opened by construction. Implements [`HttpClient`](contracts.md#symbol-HttpClient).

<a id="symbol-WebHttpClient.request"></a>
#### `WebHttpClient.request` · [source](contracts.md#code)

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

**Inputs:** Take `method` (`string`). Take `url` (`string`). Take `headers` (`optional Headers`); omitted means null. Take `body` (`optional Bytes`); omitted means null.

Returns `HttpResponse<Bytes>`. Uses [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Can fail with `HttpError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_http_request`](contracts.md#symbol-_aug_http_request) with `method`, `url`, `headers`, `body`.

<a id="symbol-redirect"></a>
### `redirect` · [source](contracts.md#code)

Return a redirect with an explicit status. Location is checked as a header value.

**Inputs:** Take `location` (`string`). Take `status` (`optional int`); omitted means null.

Returns `HttpResponse<string>`. Can fail with `HttpError`.

- Set `code` to `303`.
- Match `status`:
  - A null value, including omitted optional input:
    - Continue.
  - A present, non-null value, named `value`:
    - Set `code` to `value`.
- Set `headers` to the result of `with` on a new `Headers` with `name` as `"location"`, `value` as `location`.
- Return a new `HttpResponse` with `body` as `""`, `status` as `code`, `headers`.

<a id="symbol-urlEncode"></a>
### `urlEncode` · [source](contracts.md#code)

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters.

**Inputs:** Take `input` (`string`).

Returns `string`. Can fail with `HttpError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_http_url_encode`](contracts.md#symbol-_aug_http_url_encode) with `input`.

<a id="symbol-cookie"></a>
### `cookie` · [source](contracts.md#code)

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

**Inputs:** Take `name` (`string`). Take `value` (`string`). Take `path` (`string`). Take `maxAge` (`int`). Take `secure` (`bool`).

Returns `Headers`. Can fail with `HttpError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_http_cookie`](contracts.md#symbol-_aug_http_cookie) with `name`, `value`, `path`, `maxAge`, `secure`.

<a id="symbol-_aug_http_log"></a>
### `_aug_http_log` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `method` (`string`). Take `path` (`string`). Take `status` (`int`). Take `milliseconds` (`int`).

Uses [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_http_request"></a>
### `_aug_http_request` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `method` (`string`). Take `url` (`string`). Take `headers` (`optional Headers`); omitted means null. Take `body` (`optional Bytes`); omitted means null.

Returns `HttpResponse<Bytes>`. Uses [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Can fail with `HttpError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_http_url_encode"></a>
### `_aug_http_url_encode` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `input` (`string`).

Returns `string`. Can fail with `HttpError`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-_aug_http_cookie"></a>
### `_aug_http_cookie` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `name` (`string`). Take `value` (`string`). Take `path` (`string`). Take `maxAge` (`int`). Take `secure` (`bool`).

Returns `Headers`. Can fail with `HttpError`.

Native C implementation; only its declared contract is visible here.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

::::

:::::

---
generated: true
source: src/stdlib/web
editLink: false
---

# august.web

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/web --as web`, then import its public names from `web`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## Principal {#api-Principal}

```text
record Principal(string subject, List<string> permissions)
```

Immutable identity returned by the authentication adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L3)

## Authentication {#api-Authentication}

```text
capability Authentication
```

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L6)

### Authentication.authenticate

```text
authenticate(HttpRequest request) returns optional Principal unless HttpError
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L7)

## Authorization {#api-Authorization}

```text
capability Authorization
```

Decide whether a verified identity has one named permission.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L10)

### Authorization.authorize

```text
authorize(Principal identity, string permission) returns bool unless HttpError
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L11)

## RequestLogger {#api-RequestLogger}

```text
capability RequestLogger
```

Observe a completed HTTP exchange, including failures and disconnects.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L14)

### RequestLogger.complete

```text
complete(string method, string path, int status, int milliseconds)
```

Uses `RequestLogger.complete`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L15)

## WebRequestLogger {#api-WebRequestLogger}

```text
WebRequestLogger() implements RequestLogger
```

Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L19)

### WebRequestLogger.complete

```text
complete(string method, string path, int status, int milliseconds)
```

Uses `RequestLogger.complete`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L20)

## HttpClient {#api-HttpClient}

```text
capability HttpClient
```

Make outbound HTTP requests. TLS verifies the peer; callers handle redirects.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L25)

### HttpClient.request

```text
request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> unless HttpError
```

Perform an HTTP request with bounded bytes. Waiting for a response suspends the calling task.

Uses `HttpClient.request`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L27)

## WebHttpClient {#api-WebHttpClient}

```text
WebHttpClient() implements HttpClient
```

Native libwebsockets transport. No socket is opened by construction.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L32)

### WebHttpClient.request

```text
request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> unless HttpError
```

Perform an HTTP request with bounded bytes. Waiting for a response suspends the calling task.

Uses `HttpClient.request`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L33)

## redirect {#api-redirect}

```text
redirect(string location, optional int status) returns HttpResponse<string> unless HttpError
```

Return a redirect with an explicit status. Location is checked as a header value.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L38)

## urlEncode {#api-urlEncode}

```text
urlEncode(string input) returns string unless HttpError
```

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L50)

## cookie {#api-cookie}

```text
cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError
```

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L56)

## ServerControl {#api-ServerControl}

```text
capability ServerControl
```

Stop accepting requests, drain admitted exchanges up to the given milliseconds,
then cancel remaining work. serve returns after request cleanup has joined.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L62)

### ServerControl.stop

```text
stop(int milliseconds) unless HttpError
```

Uses `ServerControl.stop`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L63)

## WebServerControl {#api-WebServerControl}

```text
WebServerControl() implements ServerControl
```

Control the server on its event-loop thread. Owned services can be disposed after serve returns.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L67)

### WebServerControl.stop

```text
stop(int milliseconds) unless HttpError
```

Uses `ServerControl.stop`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L68)

---
generated: true
source: src/stdlib/web
editLink: false
---

# august.web

Public declarations exported by this module. Import names explicitly from `august.web`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [Principal](#api-Principal)
- [Authentication](#api-Authentication)
- [Authorization](#api-Authorization)
- [RequestLogger](#api-RequestLogger)
- [WebRequestLogger](#api-WebRequestLogger)
- [HttpClient](#api-HttpClient)
- [WebHttpClient](#api-WebHttpClient)
- [redirect](#api-redirect)
- [urlEncode](#api-urlEncode)
- [cookie](#api-cookie)

## Principal {#api-Principal}

```text
record Principal(string subject, List<string> permissions)
```

Immutable identity returned by an explicitly injected authentication adapter.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L3)

## Authentication {#api-Authentication}

```text
capability Authentication
```

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L6)

### Authentication.authenticate

```text
authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError
```

The signature declares inputs, result, effects and checked errors.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L7)

## Authorization {#api-Authorization}

```text
capability Authorization
```

Decide whether a verified identity has one named permission.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L10)

### Authorization.authorize

```text
authorize(Principal identity, string permission) returns bool uses Authorization.authorize unless HttpError
```

The signature declares inputs, result, effects and checked errors.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L11)

## RequestLogger {#api-RequestLogger}

```text
capability RequestLogger
```

Observe a completed HTTP exchange, including failures and disconnects.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L14)

### RequestLogger.complete

```text
complete(string method, string path, int status, int milliseconds) uses RequestLogger.complete
```

The signature declares inputs, result, effects and checked errors.

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

The signature declares inputs, result, effects and checked errors.

Inferred capabilities: `RequestLogger.complete`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L20)

## HttpClient {#api-HttpClient}

```text
capability HttpClient
```

An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/web/contracts.aug#L25)

### HttpClient.request

```text
request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> uses HttpClient.request unless HttpError
```

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

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

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

Inferred capabilities: `HttpClient.request`.

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

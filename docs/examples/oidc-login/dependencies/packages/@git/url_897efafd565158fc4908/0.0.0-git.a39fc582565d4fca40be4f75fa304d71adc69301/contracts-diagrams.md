---
title: "package/@git/url\\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

## Class interactions

```mermaid
flowchart TD
    n0["HttpClient"]
    n1["RequestLogger"]
    n2["WebHttpClient"]
    n3["WebRequestLogger"]
    n4["_aug_http_log"]
    n5["_aug_http_request"]
    n2 -->|"implements"| n0
    n2 -->|"calls"| n5
    n3 -->|"implements"| n1
    n3 -->|"calls"| n4
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Principal constructor {#sequence-Principal-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

Immutable identity returned by an explicitly injected authentication adapter.

It takes `subject` as a string, kept read-only and `permissions` as `List<string>`, kept read-only.

Receive fields: subject, permissions. [Explanation](contracts.md).

### Authentication.authenticate {#sequence-Authentication.authenticate}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L7)
:::

It takes `request` as `HttpRequest`.

It returns [`optional Principal`](contracts.md#symbol-Principal). It can call [`Authentication.authenticate`](contracts.md#symbol-Authentication.authenticate). Failures can raise `HttpError`.

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### Authorization.authorize {#sequence-Authorization.authorize}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L11)
:::

It takes `identity` as [`Principal`](contracts.md#symbol-Principal) and `permission` as a string.

It returns `bool`. It can call [`Authorization.authorize`](contracts.md#symbol-Authorization.authorize). Failures can raise `HttpError`.

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### RequestLogger.complete {#sequence-RequestLogger.complete}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L15)
:::

It takes `method` and `path` as strings and `status` and `milliseconds` as integers.

It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### \_aug\_http\_log {#sequence-_aug_http_log}

::: spec-paragraph specification-paragraph-5
[Source](contracts.md#source-L17)
:::

It is private to its defining scope.

It takes `method` and `path` as strings and `status` and `milliseconds` as integers.

It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

Native C implementation; only its declared contract is visible here.

Native implementation; only the declared contract is known. [Explanation](contracts.md).

### WebRequestLogger constructor {#sequence-WebRequestLogger-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](contracts.md#source-L19)
:::

Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded. It implements [`RequestLogger`](contracts.md#symbol-RequestLogger).

[Explanation](contracts.md).

### WebRequestLogger.complete {#sequence-WebRequestLogger.complete}

::: spec-paragraph specification-paragraph-7
[Source](contracts.md#source-L20)
:::

It takes `method` and `path` as strings and `status` and `milliseconds` as integers.

It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

```mermaid
sequenceDiagram
    participant p0 as WebRequestLogger.complete

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _aug_http_log(method=method, path=path, status=status,<br/>milliseconds=milliseconds) · native boundary
    Note over p0: Leave unsafe scope
    end
```

### HttpClient.request {#sequence-HttpClient.request}

::: spec-paragraph specification-paragraph-8
[Source](contracts.md#source-L27)
:::

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

It returns `HttpResponse<Bytes>`. It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`.

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### \_aug\_http\_request {#sequence-_aug_http_request}

::: spec-paragraph specification-paragraph-9
[Source](contracts.md#source-L29)
:::

It is private to its defining scope.

It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

It returns `HttpResponse<Bytes>`. It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`.

Native C implementation; only its declared contract is visible here.

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### WebHttpClient constructor {#sequence-WebHttpClient-20-constructor}

::: spec-paragraph specification-paragraph-10
[Source](contracts.md#source-L32)
:::

Native libwebsockets transport. No socket is opened by construction. It implements [`HttpClient`](contracts.md#symbol-HttpClient).

[Explanation](contracts.md).

### WebHttpClient.request {#sequence-WebHttpClient.request}

::: spec-paragraph specification-paragraph-11
[Source](contracts.md#source-L33)
:::

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack.

It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`.

```mermaid
sequenceDiagram
    participant p0 as WebHttpClient.request

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _aug_http_request(method=method, url=url,<br/>headers=headers, body=body) · native boundary
    p0-->>p0: _aug_http_request result: HttpResponse‹Bytes›
    Note over p0: Return _aug_http_request(method=method, url=url,<br/>headers=headers, body=body)； required cleanup runs<br/>before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HttpError
```

### redirect {#sequence-redirect}

::: spec-paragraph specification-paragraph-12
[Source](contracts.md#source-L38)
:::

Return a redirect with an explicit status. Location is checked as a header value.

It takes `location` as a string and `status` as `optional int`. Omitted optional inputs are null.

Failures can raise `HttpError`.

```mermaid
sequenceDiagram
    participant p0 as redirect

    Note over p0: Set code to 303
    alt Match when null:
    Note over p0: No operations in this branch
    else Match when some value:
    Note over p0: Set code to value
    end
    p0->>p0: Headers()
    p0-->>p0: Headers result: Headers
    p0->>p0: Headers result.with(name=”location”, value=location)
    p0-->>p0: headers: Headers
    p0->>p0: HttpResponse(body=””, status=code, headers=headers)
    p0-->>p0: HttpResponse result: HttpResponse‹string›
    Note over p0: Return HttpResponse(body=””, status=code,<br/>headers=headers)； required cleanup runs before exit
    Note over p0: May leave with checked errors: HttpError
```

### \_aug\_http\_url\_encode {#sequence-_aug_http_url_encode}

::: spec-paragraph specification-paragraph-13
[Source](contracts.md#source-L48)
:::

It is private to its defining scope.

It takes `input` as a string.

It returns `string`. Failures can raise `HttpError`.

Native C implementation; only its declared contract is visible here.

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### urlEncode {#sequence-urlEncode}

::: spec-paragraph specification-paragraph-14
[Source](contracts.md#source-L50)
:::

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters.

It takes `input` as a string.

Failures can raise `HttpError`.

```mermaid
sequenceDiagram
    participant p0 as urlEncode

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _aug_http_url_encode(input=input) · native boundary
    p0-->>p0: _aug_http_url_encode result: string
    Note over p0: Return _aug_http_url_encode(input)； required cleanup<br/>runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HttpError
```

### \_aug\_http\_cookie {#sequence-_aug_http_cookie}

::: spec-paragraph specification-paragraph-15
[Source](contracts.md#source-L54)
:::

It is private to its defining scope.

It takes `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean.

It returns `Headers`. Failures can raise `HttpError`.

Native C implementation; only its declared contract is visible here.

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### cookie {#sequence-cookie}

::: spec-paragraph specification-paragraph-16
[Source](contracts.md#source-L56)
:::

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

It takes `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean.

Failures can raise `HttpError`.

```mermaid
sequenceDiagram
    participant p0 as cookie

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _aug_http_cookie(name=name, value=value, path=path,<br/>maxAge=maxAge, secure=secure) · native boundary
    p0-->>p0: _aug_http_cookie result: Headers
    Note over p0: Return _aug_http_cookie(name, value, path, maxAge,<br/>secure)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HttpError
```

## Called contracts

- [HttpClient](contracts-diagrams.md) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [RequestLogger](contracts-diagrams.md) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_http\_cookie](contracts-diagrams.md#sequence-_aug_http_cookie) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_http\_log](contracts-diagrams.md#sequence-_aug_http_log) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_http\_request](contracts-diagrams.md#sequence-_aug_http_request) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug
- [\_aug\_http\_url\_encode](contracts-diagrams.md#sequence-_aug_http_url_encode) — package/@git/url\_897efafd565158fc4908@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug

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
    n0["Authentication"]
    n1["Authorization"]
    n2["HttpClient"]
    n3["Principal"]
    n4["RequestLogger"]
    n5["WebHttpClient"]
    n6["WebRequestLogger"]
    n7["_aug_http_log"]
    n8["_aug_http_request"]
    n5 -->|"implements"| n2
    n5 -->|"calls"| n8
    n6 -->|"implements"| n4
    n6 -->|"calls"| n7
```

::: details Call relationships

```mermaid
flowchart TD
    n0["WebHttpClient.request"]
    n1["WebRequestLogger.complete"]
    n2["_aug_http_cookie"]
    n3["_aug_http_log"]
    n4["_aug_http_request"]
    n5["_aug_http_url_encode"]
    n6["cookie"]
    n7["urlEncode"]
    n0 -->|"calls"| n4
    n1 -->|"calls"| n3
    n6 -->|"calls"| n2
    n7 -->|"calls"| n5
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Principal constructor {#sequence-Principal-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

Receive fields: subject, permissions. [Explanation](contracts.md).

### Authentication.authenticate {#sequence-Authentication.authenticate}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L7)
:::

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### Authorization.authorize {#sequence-Authorization.authorize}

::: spec-paragraph specification-paragraph-3
[Source](contracts.md#source-L11)
:::

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### RequestLogger.complete {#sequence-RequestLogger.complete}

::: spec-paragraph specification-paragraph-4
[Source](contracts.md#source-L15)
:::

Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### \_aug\_http\_log {#sequence-_aug_http_log}

::: spec-paragraph specification-paragraph-5
[Source](contracts.md#source-L17)
:::

Native implementation; only the declared contract is known. [Explanation](contracts.md).

### WebRequestLogger constructor {#sequence-WebRequestLogger-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](contracts.md#source-L19)
:::

[Explanation](contracts.md).

### WebRequestLogger.complete {#sequence-WebRequestLogger.complete}

::: spec-paragraph specification-paragraph-7
[Source](contracts.md#source-L20)
:::

```mermaid
sequenceDiagram
    participant p0 as WebRequestLogger.complete
    participant p1 as _aug_http_log
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_http_log(method=method, path=path, status=status, milliseconds=milliseconds) · native boundary
    Note over p0: Leave unsafe scope
    end
```

### HttpClient.request {#sequence-HttpClient.request}

::: spec-paragraph specification-paragraph-8
[Source](contracts.md#source-L27)
:::

May leave with checked errors: HttpError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).

### \_aug\_http\_request {#sequence-_aug_http_request}

::: spec-paragraph specification-paragraph-9
[Source](contracts.md#source-L29)
:::

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### WebHttpClient constructor {#sequence-WebHttpClient-20-constructor}

::: spec-paragraph specification-paragraph-10
[Source](contracts.md#source-L32)
:::

[Explanation](contracts.md).

### WebHttpClient.request {#sequence-WebHttpClient.request}

::: spec-paragraph specification-paragraph-11
[Source](contracts.md#source-L33)
:::

```mermaid
sequenceDiagram
    participant p0 as WebHttpClient.request
    participant p1 as _aug_http_request
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_http_request(method=method, url=url, headers=headers, body=body) · native boundary
    p1-->>p0: HttpResponse‹Bytes›
    Note over p0: Return _aug_http_request(method=method, url=url, headers=headers, body=body)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HttpError
```

### redirect {#sequence-redirect}

::: spec-paragraph specification-paragraph-12
[Source](contracts.md#source-L38)
:::

```mermaid
sequenceDiagram
    participant p0 as redirect
    participant p1 as Headers
    participant p2 as Headers().with
    participant p3 as HttpResponse
    alt Match when null:
    else Match when some value:
    end
    p0->>p1: Headers()
    p0->>p2: Headers().with(name=”location”, value=location)
    p0->>p3: HttpResponse(body=””, status=code, headers=headers)
    Note over p0: Return HttpResponse(body=””, status=code, headers=headers)； required cleanup runs before exit
    Note over p0: May leave with checked errors: HttpError
```

### \_aug\_http\_url\_encode {#sequence-_aug_http_url_encode}

::: spec-paragraph specification-paragraph-13
[Source](contracts.md#source-L48)
:::

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### urlEncode {#sequence-urlEncode}

::: spec-paragraph specification-paragraph-14
[Source](contracts.md#source-L50)
:::

```mermaid
sequenceDiagram
    participant p0 as urlEncode
    participant p1 as _aug_http_url_encode
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_http_url_encode(input=input) · native boundary
    p1-->>p0: string
    Note over p0: Return _aug_http_url_encode(input)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HttpError
```

### \_aug\_http\_cookie {#sequence-_aug_http_cookie}

::: spec-paragraph specification-paragraph-15
[Source](contracts.md#source-L54)
:::

May leave with checked errors: HttpError. Native implementation; only the declared contract is known. [Explanation](contracts.md).

### cookie {#sequence-cookie}

::: spec-paragraph specification-paragraph-16
[Source](contracts.md#source-L56)
:::

```mermaid
sequenceDiagram
    participant p0 as cookie
    participant p1 as _aug_http_cookie
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _aug_http_cookie(name=name, value=value, path=path, maxAge=maxAge, secure=secure) · native boundary
    p1-->>p0: Headers
    Note over p0: Return _aug_http_cookie(name, value, path, maxAge, secure)； required cleanup runs before exit
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

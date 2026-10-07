---
title: "packages/@git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug`

[OpenID Connect login application](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDZiMjNiMDY1ZmQ5Y2JlNDE0MjliZjQ5NjMyNTE3OTlmZDMwOWJkYWFmMjE0ODNjYzdhYTVmMjU4OTcyMDBjOCIsImZvcm1hdHRlZFNoYTI1NiI6IjFjODYzY2EzNGQ3MWYxMWJmZDY5ZWNhOWZmYzE2YTcxZTQxYTIyYjNmZjQwZTAwZGE1MmY1NDU3MDNlNzU4MzkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1QcmluY2lwYWwiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0ZSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLUF1dGhvcml6YXRpb24uYXV0aG9yaXplIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjEyLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1SZXF1ZXN0TG9nZ2VyLmNvbXBsZXRlIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01IiwiI3N5bWJvbC1fYXVnX2h0dHBfbG9nIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjE1LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02IiwiI3N5bWJvbC1XZWJSZXF1ZXN0TG9nZ2VyIl19LHsiaWQiOiJzb3VyY2UtTDIwIiwiZmlyc3QiOjE2LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC03IiwiI3N5bWJvbC1XZWJSZXF1ZXN0TG9nZ2VyLmNvbXBsZXRlIl19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjIyLCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC1IdHRwQ2xpZW50LnJlcXVlc3QiXX0seyJpZCI6InNvdXJjZS1MMjkiLCJmaXJzdCI6MjMsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiLCIjc3ltYm9sLV9hdWdfaHR0cF9yZXF1ZXN0Il19LHsiaWQiOiJzb3VyY2UtTDMyIiwiZmlyc3QiOjI1LCJsYXN0IjozMywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMCIsIiNzeW1ib2wtV2ViSHR0cENsaWVudCJdfSx7ImlkIjoic291cmNlLUwzMyIsImZpcnN0IjoyNiwibGFzdCI6MzMsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiLCIjc3ltYm9sLVdlYkh0dHBDbGllbnQucmVxdWVzdCJdfSx7ImlkIjoic291cmNlLUwzOCIsImZpcnN0IjozNSwibGFzdCI6NDMsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiLCIjc3ltYm9sLXJlZGlyZWN0Il19LHsiaWQiOiJzb3VyY2UtTDQ4IiwiZmlyc3QiOjQ0LCJsYXN0Ijo0NCwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMyIsIiNzeW1ib2wtX2F1Z19odHRwX3VybF9lbmNvZGUiXX0seyJpZCI6InNvdXJjZS1MNTAiLCJmaXJzdCI6NDYsImxhc3QiOjQ4LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE0IiwiI3N5bWJvbC11cmxFbmNvZGUiXX0seyJpZCI6InNvdXJjZS1MNTQiLCJmaXJzdCI6NDksImxhc3QiOjQ5LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE1IiwiI3N5bWJvbC1fYXVnX2h0dHBfY29va2llIl19LHsiaWQiOiJzb3VyY2UtTDU2IiwiZmlyc3QiOjUxLCJsYXN0Ijo1MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNiIsIiNzeW1ib2wtY29va2llIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXV0aGVudGljYXRpb24iXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6OCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXV0aG9yaXphdGlvbiJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMSwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcXVlc3RMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MMjEtTDIyIiwiZmlyc3QiOjE3LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjIwLCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSHR0cENsaWVudCJdfSx7ImlkIjoic291cmNlLUwzNC1MMzUiLCJmaXJzdCI6MjcsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMzktTDQ1IiwiZmlyc3QiOjM2LCJsYXN0Ijo0MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDQ2IiwiZmlyc3QiOjQzLCJsYXN0Ijo0MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDUxLUw1MiIsImZpcnN0Ijo0NywibGFzdCI6NDgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfSx7ImlkIjoic291cmNlLUw1Ny1MNTgiLCJmaXJzdCI6NTIsImxhc3QiOjUzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX1dfQ
// Generated by aug spec. This is a copy of the installed dependency source.
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
            return _aug_http_request(
                method=method,
                url=url,
                headers=headers,
                body=body
            )
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDZiMjNiMDY1ZmQ5Y2JlNDE0MjliZjQ5NjMyNTE3OTlmZDMwOWJkYWFmMjE0ODNjYzdhYTVmMjU4OTcyMDBjOCIsImZvcm1hdHRlZFNoYTI1NiI6Ijk1YjUwNDU1ZjYyZmU5YjUzZjM5ZDQ5NzFlYTIwNDAzYjMxYmU4YzI0NzU2YTVjNzRhMjAxNDYyMjBiNTkwNTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1QcmluY2lwYWwiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0ZSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQXV0aG9yaXphdGlvbi5hdXRob3JpemUiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLVJlcXVlc3RMb2dnZXIuY29tcGxldGUiXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTYsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLV9hdWdfaHR0cF9sb2ciXX0seyJpZCI6InNvdXJjZS1MMTkiLCJmaXJzdCI6MTgsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiLCIjc3ltYm9sLVdlYlJlcXVlc3RMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MMjAiLCJmaXJzdCI6MTksImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciLCIjc3ltYm9sLVdlYlJlcXVlc3RMb2dnZXIuY29tcGxldGUiXX0seyJpZCI6InNvdXJjZS1MMjciLCJmaXJzdCI6MjgsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiLCIjc3ltYm9sLUh0dHBDbGllbnQucmVxdWVzdCJdfSx7ImlkIjoic291cmNlLUwyOSIsImZpcnN0IjozMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOSIsIiNzeW1ib2wtX2F1Z19odHRwX3JlcXVlc3QiXX0seyJpZCI6InNvdXJjZS1MMzIiLCJmaXJzdCI6MzIsImxhc3QiOjQzLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEwIiwiI3N5bWJvbC1XZWJIdHRwQ2xpZW50Il19LHsiaWQiOiJzb3VyY2UtTDMzIiwiZmlyc3QiOjMzLCJsYXN0Ijo0MiwiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMSIsIiNzeW1ib2wtV2ViSHR0cENsaWVudC5yZXF1ZXN0Il19LHsiaWQiOiJzb3VyY2UtTDM4IiwiZmlyc3QiOjQ1LCJsYXN0Ijo1NywiYmFja2xpbmtzIjpbImNvbnRyYWN0cy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMiIsIiNzeW1ib2wtcmVkaXJlY3QiXX0seyJpZCI6InNvdXJjZS1MNDgiLCJmaXJzdCI6NTgsImxhc3QiOjU4LCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEzIiwiI3N5bWJvbC1fYXVnX2h0dHBfdXJsX2VuY29kZSJdfSx7ImlkIjoic291cmNlLUw1MCIsImZpcnN0Ijo2MCwibGFzdCI6NjQsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTQiLCIjc3ltYm9sLXVybEVuY29kZSJdfSx7ImlkIjoic291cmNlLUw1NCIsImZpcnN0Ijo2NSwibGFzdCI6NjUsImJhY2tsaW5rcyI6WyJjb250cmFjdHMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiLCIjc3ltYm9sLV9hdWdfaHR0cF9jb29raWUiXX0seyJpZCI6InNvdXJjZS1MNTYiLCJmaXJzdCI6NjcsImxhc3QiOjcxLCJiYWNrbGlua3MiOlsiY29udHJhY3RzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE2IiwiI3N5bWJvbC1jb29raWUiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo1LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BdXRoZW50aWNhdGlvbiJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXV0aG9yaXphdGlvbiJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMywibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcXVlc3RMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MMjEtTDIyIiwiZmlyc3QiOjIwLCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjI2LCJsYXN0IjoyOSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSHR0cENsaWVudCJdfSx7ImlkIjoic291cmNlLUwzNC1MMzUiLCJmaXJzdCI6MzQsImxhc3QiOjQxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMzktTDQ1IiwiZmlyc3QiOjQ2LCJsYXN0Ijo1NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDQ2IiwiZmlyc3QiOjU2LCJsYXN0Ijo1NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDUxLUw1MiIsImZpcnN0Ijo2MSwibGFzdCI6NjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfSx7ImlkIjoic291cmNlLUw1Ny1MNTgiLCJmaXJzdCI6NjgsImxhc3QiOjcwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX1dfQ
// Generated by aug spec. This is a copy of the installed dependency source.
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
            return _aug_http_request(
                method=method,
                url=url,
                headers=headers,
                body=body
            )
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

[Interactions and sequences](contracts-diagrams.md)

### `Principal` · immutable record · [source](contracts.md#source-L3) {#symbol-Principal}

Immutable identity returned by an explicitly injected authentication adapter. It takes `subject` as a string, kept read-only and `permissions` as `List<string>`, kept read-only.

### `Authentication` · capability interface · [source](contracts.md#source-L6) {#symbol-Authentication}

Verify the request's credentials. null means unauthenticated; adapter failures raise HttpError.

#### `Authentication.authenticate` · [source](contracts.md#source-L7) {#symbol-Authentication.authenticate}

It takes `request` as `HttpRequest`. It returns [`optional Principal`](contracts.md#symbol-Principal). It can call [`Authentication.authenticate`](contracts.md#symbol-Authentication.authenticate). Failures can raise `HttpError`.

### `Authorization` · capability interface · [source](contracts.md#source-L10) {#symbol-Authorization}

Decide whether a verified identity has one named permission.

#### `Authorization.authorize` · [source](contracts.md#source-L11) {#symbol-Authorization.authorize}

It takes `identity` as [`Principal`](contracts.md#symbol-Principal) and `permission` as a string. It returns `bool`. It can call [`Authorization.authorize`](contracts.md#symbol-Authorization.authorize). Failures can raise `HttpError`.

### `RequestLogger` · capability interface · [source](contracts.md#source-L14) {#symbol-RequestLogger}

Observe a completed HTTP exchange, including failures and disconnects.

#### `RequestLogger.complete` · [source](contracts.md#source-L15) {#symbol-RequestLogger.complete}

It takes `method` and `path` as strings and `status` and `milliseconds` as integers. It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

### `WebRequestLogger` · class · [source](contracts.md#source-L19) {#symbol-WebRequestLogger}

Emit escaped JSON request metadata to standard error. Credentials and query strings are excluded. It implements [`RequestLogger`](contracts.md#symbol-RequestLogger).

#### `WebRequestLogger.complete` · [source](contracts.md#source-L20) {#symbol-WebRequestLogger.complete}

::: spec-paragraph specification-paragraph-1
It takes `method` and `path` as strings and `status` and `milliseconds` as integers. It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete). Within an unsafe block, it calls [`_aug_http_log`](contracts.md#symbol-_aug_http_log) with `method`, `path`, `status`, and `milliseconds`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L21-L22)
:::

::: details Checked interface

```text
complete(string method, string path, int status, int milliseconds) returns void uses RequestLogger.complete
```

It takes `method` and `path` as strings and `status` and `milliseconds` as integers. It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete).

:::

### `HttpClient` · capability interface · [source](contracts.md#source-L25) {#symbol-HttpClient}

An explicit outbound network capability. TLS verifies the peer and redirects are returned to the caller.

#### `HttpClient.request` · [source](contracts.md#source-L27) {#symbol-HttpClient.request}

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack. It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

It returns `HttpResponse<Bytes>`. It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`.

### `WebHttpClient` · class · [source](contracts.md#source-L32) {#symbol-WebHttpClient}

Native libwebsockets transport. No socket is opened by construction. It implements [`HttpClient`](contracts.md#symbol-HttpClient).

#### `WebHttpClient.request` · [source](contracts.md#source-L33) {#symbol-WebHttpClient.request}

Perform an HTTP request with bounded bytes. Inside a task, waiting suspends the task's C stack. It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

::: spec-paragraph specification-paragraph-2
It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`. Within an unsafe block, it returns [`_aug_http_request`](contracts.md#symbol-_aug_http_request) with `method`, `url`, `headers`, and `body`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L34-L35)
:::

::: details Checked interface

```text
request(string method, string url, optional Headers headers, optional Bytes body) returns HttpResponse<Bytes> unless HttpError uses HttpClient.request
```

It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null. It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`.

:::

### `redirect` · [source](contracts.md#source-L38) {#symbol-redirect}

Return a redirect with an explicit status. Location is checked as a header value. It takes `location` as a string and `status` as `optional int`. Omitted optional inputs are null.

Failures can raise `HttpError`.

::: spec-paragraph specification-paragraph-3
It sets `code` to `303`. If `status` is null, it continues without an operation. If `status` is not null, using `value` for it sets `code` to `value`. It sets `headers` to a `Headers` with the header `"location"` set to `location`. [source](contracts.md#source-L39-L45)
:::

::: spec-paragraph specification-paragraph-4
It returns HTTP code with `""` and `headers` headers. [source](contracts.md#source-L46)
:::

::: details Checked interface

```text
redirect(string location, optional int status) returns HttpResponse<string> unless HttpError
```

It takes `location` as a string and `status` as `optional int`. Omitted optional inputs are null. Failures can raise `HttpError`.

:::

### `urlEncode` · [source](contracts.md#source-L50) {#symbol-urlEncode}

Encode a UTF-8 value as one URL query or form component using RFC 3986 unreserved characters. It takes `input` as a string. Failures can raise `HttpError`.

::: spec-paragraph specification-paragraph-5
Within an unsafe block, it returns [`_aug_http_url_encode`](contracts.md#symbol-_aug_http_url_encode) with `input`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L51-L52)
:::

::: details Checked interface

```text
urlEncode(string input) returns string unless HttpError
```

It takes `input` as a string. Failures can raise `HttpError`.

:::

### `cookie` · [source](contracts.md#source-L56) {#symbol-cookie}

Construct an HttpOnly, SameSite=Lax session cookie. Secure defaults are chosen explicitly at the call site. Values and paths reject delimiters and controls. maxAge=0 clears the cookie.

::: spec-paragraph specification-paragraph-6
It takes `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean. Failures can raise `HttpError`. Within an unsafe block, it returns [`_aug_http_cookie`](contracts.md#symbol-_aug_http_cookie) with `name`, `value`, `path`, `maxAge`, and `secure`. Native operations must satisfy their declared C contracts. [source](contracts.md#source-L57-L58)
:::

::: details Checked interface

```text
cookie(string name, string value, string path, int maxAge, bool secure) returns Headers unless HttpError
```

It takes `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean. Failures can raise `HttpError`.

:::

### `_aug_http_log` · [source](contracts.md#source-L17) {#symbol-_aug_http_log}

It is private to its defining scope. It takes `method` and `path` as strings and `status` and `milliseconds` as integers. It can call [`RequestLogger.complete`](contracts.md#symbol-RequestLogger.complete). Native C implementation; only its declared contract is visible here.

### `_aug_http_request` · [source](contracts.md#source-L29) {#symbol-_aug_http_request}

It is private to its defining scope. It takes `method` and `url` as strings, `headers` as `optional Headers`, and `body` as `optional Bytes`. Omitted optional inputs are null.

It returns `HttpResponse<Bytes>`. It can call [`HttpClient.request`](contracts.md#symbol-HttpClient.request). Failures can raise `HttpError`. Native C implementation; only its declared contract is visible here.

### `_aug_http_url_encode` · [source](contracts.md#source-L48) {#symbol-_aug_http_url_encode}

It is private to its defining scope. It takes `input` as a string. It returns `string`. Failures can raise `HttpError`.

Native C implementation; only its declared contract is visible here.

### `_aug_http_cookie` · [source](contracts.md#source-L54) {#symbol-_aug_http_cookie}

It is private to its defining scope. It takes `name`, `value`, and `path` as strings, `maxAge` as an integer, and `secure` as a boolean. It returns `Headers`. Failures can raise `HttpError`.

Native C implementation; only its declared contract is visible here.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

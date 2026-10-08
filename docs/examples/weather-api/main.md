---
title: "main.aug · Weather API"
generated: true
source: "examples/weather-api/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Weather API](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`forecasts.aug`](forecasts.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjExZDNmOWRkZjAxODAzZTRlN2FlOTFiMDNmZTFhZTQ2MGE1NWVmNTY4MjBkYTFhNmY3ZDA0MjQ4MzkxZWQ4YSIsImZvcm1hdHRlZFNoYTI1NiI6IjQ2OWIzZGM3ZTcxNWQ1MWFkMWUwYTRmYWNhNTI2MjkzMDYxZTMzZDI2MGY3OGUyNjU5NmZmYjJiNjA0ZGM2OTYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import weatherForecast from forecasts
serve weatherForecast on port 8787
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjExZDNmOWRkZjAxODAzZTRlN2FlOTFiMDNmZTFhZTQ2MGE1NWVmNTY4MjBkYTFhNmY3ZDA0MjQ4MzkxZWQ4YSIsImZvcm1hdHRlZFNoYTI1NiI6IjQ2OWIzZGM3ZTcxNWQ1MWFkMWUwYTRmYWNhNTI2MjkzMDYxZTMzZDI2MGY3OGUyNjU5NmZmYjJiNjA0ZGM2OTYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import weatherForecast from forecasts
serve weatherForecast on port 8787
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes. Serve OpenAPI at `/openapi.json` and API docs at `/docs`.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It serves [`weatherForecast`](forecasts.md#symbol-weatherForecast) on port `8787`. [source](main.md#source-L4)
:::

### Dependencies

It uses [`weatherForecast`](forecasts.md#symbol-weatherForecast) from `forecasts`.

::::

:::::

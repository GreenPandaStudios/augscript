---
title: "forecasts.aug · Weather API"
generated: true
source: "examples/weather-api/forecasts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `forecasts.aug`

[Weather API](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`forecasts.aug`](forecasts.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTU2NjU3Y2JkYmM2ZDM4YzEwOGE2MDM0ZjNiMTVlM2JlMWQ4ZGM1ZTA0ZWYyOWRiMTkxY2ZiNmMzMzExNWQ0NiIsImZvcm1hdHRlZFNoYTI1NiI6IjdhZGUxNzkwZjU4NzI3MjhhOGRjMGU0YTEzOTFkOWQ1NTc3MjliNTFjNDcxMzkwYTExYWI3OTEyNDU0MjllMTciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtV2VhdGhlckZvcmVjYXN0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6MzcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXdlYXRoZXJGb3JlY2FzdCJdfSx7ImlkIjoic291cmNlLUw3LUwzOCIsImZpcnN0Ijo2LCJsYXN0IjozNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDQwIiwiZmlyc3QiOjM4LCJsYXN0Ijo0NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC13ZWF0aGVyRm9yZWNhc3QtMjAtY2xpZW50Il19LHsiaWQiOiJzb3VyY2UtTDQyIiwiZmlyc3QiOjQwLCJsYXN0Ijo0MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQzLUw0NCIsImZpcnN0Ijo0MSwibGFzdCI6NDIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw0NSIsImZpcnN0Ijo0MywibGFzdCI6NDUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUw0Ni1MNDciLCJmaXJzdCI6NDQsImxhc3QiOjQ1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX1dfQ
// aug-spec: "forecasts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** The JSON shape returned by the forecast endpoint. Temperatures use whole degrees. */
record WeatherForecast(string date, int temperatureC, int temperatureF, string summary)
/** Return five simulated forecasts. Fixed data keeps the example and its tests reproducible. */
endpoint GET "/weatherforecast" as weatherForecast():
    return [
        WeatherForecast(
            date="2026-01-01",
            temperatureC=0,
            temperatureF=32,
            summary="Freezing"
        ),
        WeatherForecast(
            date="2026-01-02",
            temperatureC=10,
            temperatureF=50,
            summary="Cool"
        ),
        WeatherForecast(
            date="2026-01-03",
            temperatureC=20,
            temperatureF=68,
            summary="Mild"
        ),
        WeatherForecast(
            date="2026-01-04",
            temperatureC=30,
            temperatureF=86,
            summary="Warm"
        ),
        WeatherForecast(
            date="2026-01-05",
            temperatureC=35,
            temperatureF=95,
            summary="Hot"
        )
    ]
test endpoint weatherForecast client:
    when "forecasts":
        it "returns_json":
            response = client.request(method="GET", path="/weatherforecast")
            assert(condition=response.status == 200)
        it "rejects_other_methods":
            response = client.request(method="POST", path="/weatherforecast")
            assert(condition=response.status == 405)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTU2NjU3Y2JkYmM2ZDM4YzEwOGE2MDM0ZjNiMTVlM2JlMWQ4ZGM1ZTA0ZWYyOWRiMTkxY2ZiNmMzMzExNWQ0NiIsImZvcm1hdHRlZFNoYTI1NiI6IjBmZDdmODE1NTE5NzcyYjQ1MDdhOWNkM2I5Mjg4YzczMmU0Njk2NjdlN2JkNzk3NmRlOTUzZTdkMjVhOWU0NTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtV2VhdGhlckZvcmVjYXN0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6MzgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXdlYXRoZXJGb3JlY2FzdCJdfSx7ImlkIjoic291cmNlLUw3LUwzOCIsImZpcnN0Ijo2LCJsYXN0IjozNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDQwIiwiZmlyc3QiOjM5LCJsYXN0Ijo1MCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC13ZWF0aGVyRm9yZWNhc3QtMjAtY2xpZW50Il19LHsiaWQiOiJzb3VyY2UtTDQyIiwiZmlyc3QiOjQxLCJsYXN0Ijo0NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQzLUw0NCIsImZpcnN0Ijo0MiwibGFzdCI6NDMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw0NSIsImZpcnN0Ijo0NSwibGFzdCI6NDgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUw0Ni1MNDciLCJmaXJzdCI6NDYsImxhc3QiOjQ3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX1dfQ
// aug-spec: "forecasts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** The JSON shape returned by the forecast endpoint. Temperatures use whole degrees. */
record WeatherForecast(string date, int temperatureC, int temperatureF, string summary)
/** Return five simulated forecasts. Fixed data keeps the example and its tests reproducible. */
endpoint GET "/weatherforecast" as weatherForecast() {
    return [
        WeatherForecast(
            date="2026-01-01",
            temperatureC=0,
            temperatureF=32,
            summary="Freezing"
        ),
        WeatherForecast(
            date="2026-01-02",
            temperatureC=10,
            temperatureF=50,
            summary="Cool"
        ),
        WeatherForecast(
            date="2026-01-03",
            temperatureC=20,
            temperatureF=68,
            summary="Mild"
        ),
        WeatherForecast(
            date="2026-01-04",
            temperatureC=30,
            temperatureF=86,
            summary="Warm"
        ),
        WeatherForecast(
            date="2026-01-05",
            temperatureC=35,
            temperatureF=95,
            summary="Hot"
        )
    ]
}
test endpoint weatherForecast client {
    when "forecasts" {
        it "returns_json" {
            response = client.request(method="GET", path="/weatherforecast")
            assert(condition=response.status == 200)
        }
        it "rejects_other_methods" {
            response = client.request(method="POST", path="/weatherforecast")
            assert(condition=response.status == 405)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `WeatherForecast` · immutable record · [source](forecasts.md#source-L3) {#symbol-WeatherForecast}

The JSON shape returned by the forecast endpoint. Temperatures use whole degrees. It takes `date` as a string, kept read-only, `temperatureC` and `temperatureF` as integers, kept read-only, and `summary` as a string, kept read-only.

### `weatherForecast` · [source](forecasts.md#source-L6) {#symbol-weatherForecast}

::: spec-paragraph specification-paragraph-1
`weatherForecast` handles `GET /weatherforecast`. Return five simulated forecasts. Fixed data keeps the example and its tests reproducible. It returns a list of 5 [`WeatherForecast`](forecasts.md#symbol-WeatherForecast) records, with `(date, temperatureC, temperatureF, summary)` values of `("2026-01-01", 0, 32, "Freezing")`, `("2026-01-02", 10, 50, "Cool")`, `("2026-01-03", 20, 68, "Mild")`, `("2026-01-04", 30, 86, "Warm")`, and `("2026-01-05", 35, 95, "Hot")`, in that order. [source](forecasts.md#source-L7-L38)
:::

::: details Checked interface

```text
weatherForecast() returns List<WeatherForecast>
```

:::

### `test weatherForecast client` · [source](forecasts.md#source-L40) {#symbol-test-20-weatherForecast-20-client}

Tests [`weatherForecast`](forecasts.md#symbol-weatherForecast). Each case gets fresh setup and dependencies.

#### `forecasts`

::: spec-paragraph specification-paragraph-2
##### `returns_json` · [source](forecasts.md#source-L42)
:::

::: spec-paragraph specification-paragraph-3
It sets `response` to `client.request` with `method` `"GET"` and `path` `"/weatherforecast"`. The test requires `response.status` equals `200`. [source](forecasts.md#source-L43-L44)
:::

::: spec-paragraph specification-paragraph-4
##### `rejects_other_methods` · [source](forecasts.md#source-L45)
:::

::: spec-paragraph specification-paragraph-5
It sets `response` to `client.request` with `method` `"POST"` and `path` `"/weatherforecast"`. The test requires `response.status` equals `405`. [source](forecasts.md#source-L46-L47)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

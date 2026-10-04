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

```aug [Indentation]
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

```aug [Braces]
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

### `WeatherForecast` · immutable record · [source](forecasts.md#code) {#symbol-WeatherForecast}

The JSON shape returned by the forecast endpoint. Temperatures use whole degrees. It takes `date` as a string, kept read-only, `temperatureC` and `temperatureF` as integers, kept read-only, and `summary` as a string, kept read-only.

### `weatherForecast` · [source](forecasts.md#code) {#symbol-weatherForecast}

`weatherForecast` handles `GET /weatherforecast`. Return five simulated forecasts. Fixed data keeps the example and its tests reproducible. It returns a list of 5 [`WeatherForecast`](forecasts.md#symbol-WeatherForecast) records, with `(date, temperatureC, temperatureF, summary)` values of `("2026-01-01", 0, 32, "Freezing")`, `("2026-01-02", 10, 50, "Cool")`, `("2026-01-03", 20, 68, "Mild")`, `("2026-01-04", 30, 86, "Warm")`, and `("2026-01-05", 35, 95, "Hot")`, in that order.

### `test weatherForecast client` · [source](forecasts.md#code) {#symbol-test-20-weatherForecast-20-client}

Tests [`weatherForecast`](forecasts.md#symbol-weatherForecast). Each case gets fresh setup and dependencies.

#### `forecasts`

##### `returns_json` · [source](forecasts.md#code)

It sets `response` to `client.request` with `method` `"GET"` and `path` `"/weatherforecast"`. The test requires `response.status` equals `200`.

##### `rejects_other_methods` · [source](forecasts.md#code)

It sets `response` to `client.request` with `method` `"POST"` and `path` `"/weatherforecast"`. The test requires `response.status` equals `405`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::

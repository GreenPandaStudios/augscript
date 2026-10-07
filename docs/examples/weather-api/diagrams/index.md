---
title: "Weather API diagrams"
generated: true
source: "examples/weather-api/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Weather API diagrams

[Weather API](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes. Serve OpenAPI at `/openapi.json` and API docs at `/docs`.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It serves [`weatherForecast`](../forecasts.md#symbol-weatherForecast) on port `8787`. [source](../main.md#source-L4)
:::

## Data flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["forecasts"]
    n0 -->|"GET /weatherforecast → list of WeatherForecast"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| HTTP requests | forecasts | 1 | [Inputs, results and call sites](index.md#boundary-cd260563d9a4) |

#### Data crossing these boundaries (1 contracts)

#### HTTP requests → forecasts {#boundary-cd260563d9a4}

::: details 1 operation, 1 site

**[GET /weatherforecast](../forecasts.md#symbol-weatherForecast)** · HTTP endpoint

No caller-supplied inputs. Result: List\<WeatherForecast\>.

| Caller or entry | Evidence |
| --- | --- |
| HTTP requests | [Declaration](../forecasts.md#source-L6) · [Caller explanation](../forecasts.md#symbol-weatherForecast) |

:::


## Open a module

| Module | Read |
| --- | --- |
| forecasts.aug | [Flow and sequences](../forecasts-diagrams.md) · [Explanation](../forecasts.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

## HTTP APIs

| API | Operation |
| --- | --- |
| GET /weatherforecast | [weatherForecast](../forecasts-diagrams.md#sequence-weatherForecast) |

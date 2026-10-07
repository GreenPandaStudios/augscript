---
title: "Weather API"
generated: true
source: "examples/weather-api"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Weather API

Serve five simulated forecasts as typed JSON. The record, endpoint, and tests share a file; main.aug starts the listener and main.yaml enables OpenAPI.

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

## Follow the program

Read the explanation of [`main.aug`](main.md#specification). Import the forecast endpoint and serve it on port 8787.

Read the explanation of [`forecasts.aug`](forecasts.md#specification). Read the response record, five fixed forecasts, and cases that exercise the endpoint pipeline.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`forecasts.aug`](forecasts.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/weather-api.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd weather-api
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

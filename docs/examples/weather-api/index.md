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

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Follow the program

Read [`main.aug`](main.md). Import the forecast endpoint and serve it on port 8787.

Read [`forecasts.aug`](forecasts.md). Read the response record, five fixed forecasts, and cases that exercise the endpoint pipeline.

## Project files

- [`main.aug`](main.md)
- [`forecasts.aug`](forecasts.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/weather-api.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd weather-api
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)

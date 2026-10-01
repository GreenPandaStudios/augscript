# weather-api

A simulated weather API in August. Its endpoint, JSON record, and tests live in forecasts.aug.

Run the server:

```sh
aug run
```

Open http://127.0.0.1:8787/weatherforecast for five forecasts, or http://127.0.0.1:8787/docs for the OpenAPI viewer. These are fixed examples, not live weather observations.

```sh
curl http://127.0.0.1:8787/weatherforecast
aug test
aug spec
```

Guide: https://greenpandastudios.github.io/augscript/weather-api

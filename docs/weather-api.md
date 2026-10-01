# Build a weather API

Create a service that returns five simulated weather forecasts as JSON. This example follows the familiar weather API shape from Microsoft's ASP.NET Core starter: a date, Celsius and Fahrenheit temperatures, and a summary. It uses fixed values so you can reproduce its responses and tests. It does not fetch live weather.

You need the [August toolchain](packages.md#npm-registry) and the native HTTP build prerequisites described in the [web guide](web.md). You can also use a [Dev Container](dev-containers.md).

## Start the service

```sh
npx @greenpandastudios/aug-cli@next init weather --template weather
cd weather
npx @greenpandastudios/aug-cli@next run
```

The first run prepares the required native dependencies and starts the server on port 8787. Keep it running, then open another terminal:

```sh
curl http://127.0.0.1:8787/weatherforecast
```

You should receive an array of five forecasts. Its first item is:

```json
{"date":"2026-01-01","temperatureC":0,"temperatureF":32,"summary":"Freezing"}
```

Open `http://127.0.0.1:8787/docs` for the API viewer, or `/openapi.json` for the generated OpenAPI document. The starter also includes `weather.http` with these requests for editors that support HTTP request files. Stop the server with Ctrl+C before starting another instance on the same port.

## Read the two source files

`main.aug` imports the endpoint and starts it:

```text
import weatherForecast from forecasts

serve weatherForecast on port 8787
```

`forecasts.aug` declares the immutable `WeatherForecast` record, the endpoint, and its tests. The endpoint has no inputs and returns a list of records. August infers that result from its body, serializes it as JSON, and describes the same shape in OpenAPI. You do not need a controller class or a library dependency for this service.

A record construction names each field, for example:

```text
WeatherForecast(
    date="2026-01-01",
    temperatureC=0,
    temperatureF=32,
    summary="Freezing"
)
```

The endpoint's route is `GET /weatherforecast`. The test client exercises that route through the HTTP pipeline; it checks the JSON response and the rejection of another HTTP method. `main.yaml` enables OpenAPI and sets the document title and version.

## Make a change and check it

In `forecasts.aug`, change the first summary from `Freezing` to `Cold`. Run the application again and check that the first response changed. Then run:

```sh
npx @greenpandastudios/aug-cli@next test
npx @greenpandastudios/aug-cli@next spec
```

If you installed the CLI globally, the equivalent commands are `aug test` and `aug spec`. Open `forecasts.aug.md` to read the actual compiled explanation. The starter's `AGENTS.md` asks coding agents to read that explanation before changing the code.

[Browse the complete weather project](examples/weather-api/index.md) to see the source beside its generated spec, switch between indentation and braces, or download the files. Continue with the [web guide](web.md) to accept typed inputs, return errors, render HTML, or stream a response. See Microsoft's [first web API tutorial](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api) for the original starter context.

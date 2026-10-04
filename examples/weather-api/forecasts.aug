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
    when forecasts:
        it returns_json:
            response = client.request(method="GET", path="/weatherforecast")
            assert(condition=response.status == 200)
        it rejects_other_methods:
            response = client.request(method="POST", path="/weatherforecast")
            assert(condition=response.status == 405)

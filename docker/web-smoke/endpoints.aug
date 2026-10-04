record Health(string status)

endpoint GET "/health" as health() returns Health:
    return Health(status="ok")

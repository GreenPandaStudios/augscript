record Payload(string name)
record Reply(int id, string greeting)

endpoint POST "/echo/{id}" as echo(int id from path, Payload input from body) returns Reply with status 201:
    return Reply(id=id, greeting="Hello " + input.name)

endpoint GET "/page" as page() returns Html:
    return <main><p>{"<unsafe>&"}</p></main>

test endpoint page client:
    when memory_safety:
        it repeated_requests:
            int index = 0
            while index < 128:
                page_response = client.request(method="GET", path="/page")
                assert(condition=page_response.status == 200)
                assert(condition=page_response.body.text() == "<main><p>&lt;unsafe&gt;&amp;</p></main>")
                absent_response = client.request(method="GET", path="/missing")
                assert(condition=absent_response.status == 404)
                index = index + 1

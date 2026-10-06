import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {prepareLibraryFixtures} from './library-fixtures.mjs';

test('same-file endpoint cases exercise routing, binding, errors, and streaming with fresh DI', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-endpoint-tests-'));
  try {
    writeFileSync(join(root, 'main.aug'), 'import greet and events and empty from endpoints\nserve greet and events and empty on port 0\n');
    writeFileSync(join(root, 'endpoints.aug'), `record Greeting(string name)
record Reply(int id, string greeting)
endpoint POST "/hello/{id}" as greet(int id from path, Greeting input from body) returns Reply with status 201:
    return Reply(id=id, greeting="Hello " + input.name)

test endpoint greet client:
    when binding:
        it valid:
            response = client.request(method="POST", path="/hello/7", headers=Headers().with(name="content-type", value="application/json"), body="{\\"name\\":\\"Ada\\"}".bytes())
            assert(condition=response.status == 201)
            assert(condition=response.body.text() == "{\\"id\\":7,\\"greeting\\":\\"Hello Ada\\"}")
        it invalid:
            response = client.request(method="POST", path="/hello/no", headers=Headers().with(name="content-type", value="application/json"), body="{}".bytes())
            assert(condition=response.status == 400)
        it method:
            response = client.request(method="GET", path="/hello/7")
            assert(condition=response.status == 405)
        it schema:
            response = client.request(method="POST", path="/hello/7", headers=Headers().with(name="content-type", value="application/json"), body="{\\"name\\":7}".bytes())
            assert(condition=response.status == 422)

endpoint GET "/events" as events() streams ServerEvent<string> unless HttpError:
    yield ServerEvent(data="one", id="1")
    yield ServerEvent(data="two", id="2")

test endpoint events client:
    when streaming:
        it items:
            response = client.request(method="GET", path="/events")
            assert(condition=response.status == 200)
            assert(condition=response.body.text() == "id: 1\\ndata: \\\"one\\\"\\n\\nid: 2\\ndata: \\\"two\\\"\\n\\n")

endpoint GET "/empty" as empty() streams ServerEvent<string> unless HttpError:
    pass
test endpoint empty client:
    when streaming:
        it no_items:
            response = client.request(method="GET", path="/empty")
            assert(condition=response.status == 200)
            assert(condition=response.body.length() == 0)
            assert(condition=response.headers.get(name="content-type") == "text/event-stream")

endpoint GET "/broken" as broken() streams ServerEvent<string> unless HttpError:
    yield ServerEvent(data="started")
    throw HttpError()
test endpoint broken client:
    when streaming:
        it fails_after_start:
            bool failed = false
            try:
                client.request(method="GET", path="/broken")
            catch HttpError error:
                failed = true
            assert(condition=failed)

endpoint POST "/form" as submit(Greeting input from form) returns Greeting:
    return input
test endpoint submit client:
    when form_binding:
        it constructs_record:
            response = client.request(method="POST", path="/form", headers=Headers().with(name="content-type", value="application/x-www-form-urlencoded"), body="name=Ada".bytes())
            assert(condition=response.status == 200)
            assert(condition=response.body.text() == "{\\"name\\":\\"Ada\\"}")
        it rejects_unknown_fields:
            response = client.request(method="POST", path="/form", headers=Headers().with(name="content-type", value="application/x-www-form-urlencoded"), body="name=Ada&unknown=1".bytes())
            assert(condition=response.status == 400)
`);
    prepareLibraryFixtures(root);
    const result = spawnSync(process.execPath, [resolve('bin/aug.mjs'), 'test', root, '--json'], {encoding:'utf8', timeout:30000});
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.passed, 9);
    assert.equal(report.failed, 0);
  } finally {rmSync(root, {recursive:true, force:true});}
});

test('same-file HTTP deadlines return 504 after cancellation in both backends', () => {
  const root=mkdtempSync(join(tmpdir(),'aug-endpoint-deadline-'));
  try {
    writeFileSync(join(root,'main.aug'),'import slow and child from endpoints\n');
    writeFileSync(join(root,'endpoints.aug'),`[Timeout(milliseconds=10)]
endpoint GET "/slow" as slow() returns string:
    while true:
        pass
[Timeout(milliseconds=10)]
endpoint GET "/child" as child() returns string:
    scope:
        pending = start spin()
        wait for pending
    return "unreachable"
spin():
    while true:
        pass
test endpoint slow client:
    when deadline:
        it expires:
            response = client.request(method="GET", path="/slow")
            assert(condition=response.status == 504)
            again = client.request(method="GET", path="/slow")
            assert(condition=again.status == 504)
test endpoint child client:
    when deadline:
        it joins_cancelled_child:
            response = client.request(method="GET", path="/child")
            assert(condition=response.status == 504)
`);
    prepareLibraryFixtures(root);
    for(const backend of ['llvm','c'])for(const optimization of ['debug','release']){
      writeFileSync(join(root,'main.yaml'),`backend: ${backend}\noptimization: ${optimization}\n`);
      const result=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'test',root,'--json','--backend',backend],{encoding:'utf8',timeout:30000});
      assert.equal(result.status,0,backend+'/'+optimization+': '+(result.stderr||result.stdout));
      const report=JSON.parse(result.stdout);assert.equal(report.passed,2);assert.equal(report.failed,0);
    }
  }finally{rmSync(root,{recursive:true,force:true});}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const cli = resolve('bin/aug.mjs');
test('OpenAPI uses served endpoints, Javadoc, typed schemas and exact response variants', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-openapi-'));
  try {
    writeFileSync(join(root, 'main.yaml'), 'openapi:\n  enabled: true\n  title: Fruit API\n  version: 1.0.0\nweb:\n  host: 127.0.0.1\n');
    writeFileSync(join(root, 'main.aug'), 'import getFruit from fruit\nserve getFruit on port 0\n');
    writeFileSync(join(root, 'fruit.aug'), `record Fruit(int id, string name, optional string label, string? color)
/** Read a fruit by id.
 * @param id The stable fruit identifier.
 */
endpoint GET "/fruit/{id}" as getFruit(int id from path) returns HttpResponse<Fruit> unless HttpError:
    return HttpResponse(body=Fruit(id, name="apple", color=null), headers=Headers())
endpoint GET "/private" as unserved() returns string:
    return "not served"
`);
    let result = spawnSync(process.execPath, [cli, 'openapi', root], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const document = JSON.parse(result.stdout);
    assert.equal(document.openapi, '3.2.1'); assert.equal(document.info.title, 'Fruit API');
    assert.deepEqual(Object.keys(document.paths), ['/fruit/{id}']);
    const operation = document.paths['/fruit/{id}'].get;
    assert.match(operation.description, /Read a fruit/); assert.match(operation.parameters[0].description, /stable fruit/);
    assert.equal(operation.parameters[0].required, true); assert.ok(operation.responses['200']); assert.ok(operation.responses['400']);
    const schema = Object.values(document.components.schemas).find(schema => schema.properties?.name);
    assert.deepEqual(schema.required, ['id', 'name', 'color']); assert.deepEqual(schema.properties.color.type, ['string', 'null']);
    writeFileSync(join(root, 'fruit.aug'), 'endpoint GET "/fruit/{id}" as getFruit(int id from path) returns Json:\n    return Json(value={"x":"y"})\n');
    result = spawnSync(process.execPath, [cli, 'openapi', root], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
    writeFileSync(join(root, 'fruit.aug'), 'endpoint GET "/fruit/{id}" as getFruit(int id from path, Json input from body) returns Json:\n    return input\n');
    result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
    assert.notEqual(result.status, 0); assert.match(result.stderr, /OPENAPI/);
  } finally {rmSync(root, {recursive:true, force:true});}
});

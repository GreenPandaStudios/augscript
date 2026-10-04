import {createHash} from 'node:crypto';
import {compilerVersion} from './package-manager.ts';

/** Independent checked fixtures. These names are examples, never project declarations. */
export const syntaxIdioms = [
  {id:'bindings-and-comparisons',constructs:['assign','if'],explanation:'Infer a binding with name = value. Use == to compare values in a condition; a field read is an ordinary value.',
    files:{'main.aug':'import accepted from example\nprint(value=accepted(quantity=4))\n',
      'example.aug':'record Request(int quantity)\naccepted(int quantity) { request = Request(quantity); if request.quantity == 4 { return true } return false }\n'},output:'true\n'},
  {id:'labeled-calls',constructs:['call'],explanation:'Every supplied input has a label. A same-name local supplies its own label; inputs may appear in any order.',
    files:{'main.aug':'import greet from example\nname = "Ada"\nprint(value=greet(name))\n',
      'example.aug':'greet(string name, string ending = "!") { return $"Hello, {name}{ending}" }\n'},output:'Hello, Ada!\n'},
  {id:'checked-errors',constructs:['throw','try'],explanation:'A body infers its escaping errors. Catch the named error or explicitly propagate it. This example chooses a fallback; it does not choose one for your application.',
    files:{'main.aug':'import load and MissingName from example\ntry { print(value=load(name="")) } catch MissingName error { print(value="fallback") }\n',
      'example.aug':'error MissingName()\nload(string name) { if name == "" { throw MissingName() } return name }\n'},output:'fallback\n'},
  {id:'owned-results',constructs:['own'],explanation:'A new local inherits ownership from a checked own result. Passing it to an own input transfers it; subsequent uses are rejected.',
    files:{'main.aug':'import make and consume from example\nvalues = make()\nprint(value=consume(values))\n',
      'example.aug':'make() returns own List<int> { return [1,2] }\nconsume(own List<int> values) { return values.length() }\n'},output:'2\n'},
  {id:'bounded-borrow',constructs:['borrow'],explanation:'A borrow permits mutation only inside its block. Other aliases and active tasks must not conflict with that exclusive access.',
    files:{'main.aug':'values = [1]\nborrow values { values.append(value=2) }\nprint(value=values.length())\n'},output:'2\n'},
  {id:'joined-tasks',constructs:['start','wait','scope'],explanation:'Start child work inside a scope. Wait for the result before conflicting access. Leaving the scope joins children and preserves checked failures.',
    files:{'main.aug':'import double from example\nscope { task = start double(value=4); wait for task as result; print(value=result) }\n',
      'example.aug':'double(int value) { return value * 2 }\n'},output:'8\n'},
] as const;

export function idiomsFor(constructs:ReadonlySet<string>) {
  return syntaxIdioms.filter(idiom=>idiom.id==='bindings-and-comparisons'||idiom.constructs.some(construct=>constructs.has(construct))).map(idiom=>({
    id:idiom.id,origin:'independent-example' as const,explanation:idiom.explanation,files:idiom.files,
    sha256:createHash('sha256').update(JSON.stringify(idiom.files)).digest('hex'),
    verification:{kind:'compiler-regression-fixture' as const,compilerVersion:compilerVersion(),test:'tests/syntax-idioms.test.mjs'},
  }));
}

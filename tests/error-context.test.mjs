import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from './compiler-process.mjs';
import {installPackages,compilerVersion} from '../src/package-manager.ts';
import {SemanticWorkspace} from '../src/semantic.ts';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {generateC} from '../src/codegen.ts';
import {lowerToIR} from '../src/ir.ts';
import {generateLLVM} from '../src/llvm.ts';

function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-error-context-'));try{for(const [name,source] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),source);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const command=(root,args)=>spawnSync(process.execPath,['bin/aug.mjs',...args,root,'--offline'],{encoding:'utf8',timeout:30000});

for(const backend of ['c','llvm'])test('deliberate error context retains concrete causes and the authored call site ('+backend+')',()=>fixture({
    'main.aug':`import load and ReadFailure from loading
import ContextError from august.errors
try:
    load()
catch ContextError<ReadFailure> failure:
    print(value=failure.operation)
    print(value=failure.cause.path)
    (file, line, column) = failure.location
    print(value=file)
    print(value=line)
    print(value=column)
`,
    'loading.aug':`import errorContext from august.errors
error ReadFailure(string path)
load():
    try:
        throw ReadFailure(path="config.json")
    catch ReadFailure failure:
        throw errorContext(cause=failure, operation="load configuration", location=sourceLocation())
`,
},root=>{
    const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'load configuration\nconfig.json\nloading.aug\n8\n84\n');
    const checked=command(root,['check','--json']);assert.equal(checked.status,0,checked.stderr);
    const spec=command(root,['spec']);assert.equal(spec.status,0,spec.stderr);assert.match(readFileSync(join(root,'loading.aug.md'),'utf8'),/source location|source file|sourceLocation/);
    const source=readFileSync(join(root,'loading.aug'),'utf8'),view=new SemanticWorkspace(root).document(join(root,'loading.aug'),undefined,true);
    assert.match(view.hover(source.indexOf('sourceLocation')).detail,/Tuple<string, int, int>/);
}));

test('context conversion is a chosen checked error rather than implicit Error widening',()=>fixture({
    'main.aug':'import load from loading\nload()\n',
    'loading.aug':'import errorContext from august.errors\nerror ReadFailure(string path)\nload():\n    throw errorContext(cause=ReadFailure(path="config"), operation="read", location=sourceLocation())\n',
},root=>{const result=command(root,['check']);assert.notEqual(result.status,0);assert.match(result.stderr,/ContextError<ReadFailure>/);}));

for(const backend of ['c','llvm'])test('source locations remain relative and are safe copied worker data ('+backend+')',()=>fixture({
    'main.aug':`import locate from nested
try:
    scope:
        pending = start worker locate()
        (file, line, column) = wait for pending
        print(value=file)
        print(value=line)
        print(value=column)
catch ConcurrencyError failure:
    print(value="unexpected")
`,
    'nested/export.aug':'export locate from source\n',
    'nested/source.aug':'locate():\n    return sourceLocation()\n',
},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'nested/source.aug\n3\n12\n');}));

test('source location rejects supplied values and generic arguments',()=>{
    for(const call of ['sourceLocation(value=1)','sourceLocation<int>()'])fixture({'main.aug':call+'\n'},root=>{const result=command(root,['check']);assert.notEqual(result.status,0);assert.match(result.stderr,/sourceLocation/);});
});


for(const backend of ['c','llvm'])test('package locations retain public identities through normal aliases ('+backend+')',()=>fixture({
    'library/aug-package.json':JSON.stringify({format:1,name:'@example/location',version:'1.2.3',compiler:compilerVersion(),source:'src',dependencies:{}}),
    'library/src/export.aug':'export locate from api\n',
    'library/src/api.aug':'locate():\n    return sourceLocation()\n',
    'app/main.yaml':'packages:\n  location: "../library"\n',
    'app/main.aug':'import locate from location\n(file, line, column) = locate()\nprint(value=file)\nprint(value=line)\nprint(value=column)\n',
},root=>{const app=join(root,'app');installPackages(app,false,true);const result=command(app,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'@example/location@1.2.3/api.aug\n2\n12\n');}));

for(const backend of ['c','llvm'])test('copied worker errors preserve nested concrete context ('+backend+')',()=>fixture({
    'main.aug':`import fail and Problem from operation
import ContextError from august.errors
try:
    scope:
        pending = start worker fail()
        wait for pending
catch ContextError<ContextError<Problem>> failure:
    print(value=failure.operation)
    print(value=failure.cause.operation)
    print(value=failure.cause.cause.code)
catch ConcurrencyError failure:
    print(value="unexpected")
`,
    'operation.aug':`import errorContext from august.errors
error Problem(int code)
fail():
    inner = errorContext(cause=Problem(code=42), operation="calculate", location=sourceLocation())
    throw errorContext(cause=inner, operation="worker", location=sourceLocation())
`,
},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'worker\ncalculate\n42\n');}));

test('context rejects non-errors, missing locations and incorrect concrete catches',()=>{
    for(const [main,pattern] of [
        ['errorContext(cause=7, operation="read", location=sourceLocation())',/Error|cause/],
        ['errorContext(cause=FileError(), operation="read")',/location/],
        ['errorContext(cause=FileError(), operation="read", location=("file", "row", 1))',/location|Tuple/],
        ['try { throw errorContext(cause=FileError(), operation="read", location=sourceLocation()) } catch ContextError<IndexError> failure { pass }',/ContextError<FileError>/],
    ])fixture({'main.aug':'import ContextError and errorContext from august.errors\n'+main+'\n'},root=>{const result=command(root,['check']);assert.notEqual(result.status,0);assert.match(result.stderr,pattern);});
});

for (const backend of ['c', 'llvm']) for (const cleanup of [false, true]) test('distinct and nested stored causes select the correct catch ('+backend+', always='+cleanup+')', () => fixture({
    'failure.aug': `import errorContext from august.errors
error A(int code)
error B(string message)
fail(bool second, bool nested):
    if second:
        failure = errorContext(cause=B(message="actual B"), operation="second", location=sourceLocation())
        if nested:
            throw errorContext(cause=failure, operation="outer", location=sourceLocation())
        throw failure
    failure = errorContext(cause=A(code=1), operation="first", location=sourceLocation())
    if nested:
        throw errorContext(cause=failure, operation="outer", location=sourceLocation())
    throw failure
`,
    'main.aug': `import fail and A and B from failure
import ContextError from august.errors
for second in [false, true]:
    for nested in [false, true]:
        try:
            fail(second, nested)
        catch ContextError<A> failure:
            print(value="A")
            print(value=failure.cause.code)
        catch ContextError<B> failure:
            print(value="B")
            print(value=failure.cause.message)
        catch ContextError<ContextError<A>> failure:
            print(value=failure.cause.cause.code)
        catch ContextError<ContextError<B>> failure:
            print(value=failure.cause.cause.message)
${cleanup ? '        always:\n            print(value="cleaned")\n' : ''}`,
}, root => {
    const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout, cleanup ? 'A\n1\ncleaned\n1\ncleaned\nB\nactual B\ncleaned\nactual B\ncleaned\n' : 'A\n1\n1\nB\nactual B\nactual B\n');
}));

for(const backend of ['c','llvm'])test('catch checks every witness after widening and copied worker errors ('+backend+')',()=>fixture({
    'failure.aug': `error A(int code)
error B(string message)
error Pair<E implements Error>(E first, E second)
workerFail():
    throw Pair<B>(first=B(message="first B"), second=B(message="second B"))
fail():
    throw Pair<Error>(first=A(code=7), second=B(message="mixed B"))
`,
    'main.aug': `import fail and workerFail and A and B and Pair from failure
for worker in [false, true]:
    try:
        if worker:
            scope:
                task = start worker workerFail()
                wait for task
        else:
            fail()
    catch Pair<A> failure:
        print(value="wrong pair")
    catch Pair<B> failure:
        print(value=failure.second.message)
    catch Pair<Error> failure:
        print(value="mixed")
    catch ConcurrencyError failure:
        print(value="worker failed")
`,
},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'mixed\nsecond B\n');}));

test('generic catch rejects erased, optional, container and behavioral witnesses',()=>{
    for(const declaration of [
        'error Wrapped<E implements Error>(string message)',
        'error Wrapped<E implements Error>(optional E cause)',
        'error Wrapped<E implements Error>(List<E> causes)',
        'Wrapped<E implements Error>(E cause) implements Error { }',
        'error Wrapped<E implements Error>(E cause, Tuple<E, int> extra)',
    ])fixture({'errors.aug':declaration+'\n','main.aug':'import Wrapped from errors\ntry { pass } catch Wrapped<FileError> failure { pass }\n'},root=>{
        const result=command(root,['check','--json']);assert.notEqual(result.status,0);assert.match(result.stdout,/ERROR_MATCH/);
    });
    fixture({'errors.aug':'import ContextError from august.errors\nread<E implements Error>(E cause) { try { pass } catch ContextError<E> failure { pass } }\n','main.aug':'import read from errors\nread(cause=FileError())\n'},root=>{
        const result=command(root,['check','--json']);assert.notEqual(result.status,0);assert.match(result.stdout,/ERROR_MATCH/);
    });
});

for(const backend of ['c','llvm'])test('same-spelled foreign causes retain their definition identity ('+backend+')',()=>fixture({
    'left.aug': 'error Problem(int code)\n',
    'right.aug': 'import errorContext from august.errors\nerror Problem(string message)\nfail() { throw errorContext(cause=Problem(message="right"), operation="foreign", location=sourceLocation()) }\n',
    'main.aug': 'import Problem from left\nimport fail from right\nimport ContextError from august.errors\ntry { fail() } catch ContextError<Problem> failure { print(value="wrong identity") } catch Error failure { print(value="foreign") }\n',
},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'foreign\n');}));

test('generic HTTP status maps reject erased instantiations',()=>fixture({
    'main.aug':'',
    'endpoint.aug':'import ContextError from august.errors\nendpoint GET "/" as read() returns string unless ContextError<FileError> with status 404 { return "ready" }\n',
},root=>{const result=command(root,['check','--json']);assert.notEqual(result.status,0);assert.match(result.stdout,/Generic errors need an explicit non-generic HTTP/);}));

test('generic stored witnesses require errors, not arbitrary records or error interfaces',()=>{
    for(const [declaration,argument] of [
        ['record Payload(int value)', 'Payload'],
        ['interface Failure extends Error { }', 'Failure'],
    ])fixture({'errors.aug':declaration+'\nerror Wrapped<E>(E cause)\n','main.aug':'import Wrapped and '+argument+' from errors\ntry { pass } catch Wrapped<'+argument+'> failure { pass }\n'},root=>{
        const result=command(root,['check','--json']);assert.notEqual(result.status,0);assert.match(result.stdout,/ERROR_MATCH/);
    });
});

test('nested catch limits are checked consistently before either backend',()=>{
    for(const depth of [128,129]){
        const type='Wrapped<'.repeat(depth)+'FileError'+'>'.repeat(depth);
        fixture({'errors.aug':'error Wrapped<E implements Error>(E cause)\n','main.aug':'import Wrapped from errors\ntry { pass } catch '+type+' failure { pass }\n'},root=>{
            const checked=checkProject(loadProject(root));
            if(depth===129){assert.ok(checked.diagnostics.some(issue=>issue.code==='ERROR_MATCH'&&issue.message.includes('128')));assert.throws(()=>generateC(checked));assert.throws(()=>lowerToIR(checked));}
            else{assert.deepEqual(checked.diagnostics,[]);assert.doesNotThrow(()=>generateC(checked));assert.doesNotThrow(()=>generateLLVM(lowerToIR(checked)));}
        });
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {lowerToIR} from '../src/ir.ts';
import {verifyIR,IRVerificationError} from '../src/ir-verify.ts';
import {generateLLVM} from '../src/llvm.ts';

function fixture(callback){
  const root=mkdtempSync(join(tmpdir(),'aug-ir-check-'));
  try {
    writeFileSync(join(root,'main.aug'),'import choose from math\nprint(value=choose(left=true))\n');
    writeFileSync(join(root,'math.aug'),'choose(bool left) returns int:\n    int answer = 7\n    if left:\n        return answer\n    return 9\n');
    const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);callback(lowerToIR(checked,{coverage:true}),root);
  } finally {rmSync(root,{recursive:true,force:true});}
}
test('checked IR carries typed root cells, public labels, source locations and zero-count coverage points',()=>fixture(ir=>{
  assert.doesNotThrow(()=>verifyIR(ir));
  const fn=ir.functions.find(fn=>fn.variables.some(variable=>variable.name==='answer'));
  assert.equal(fn.variables.find(variable=>variable.name==='left').argument,1);
  assert.equal(fn.variables.find(variable=>variable.name==='left').type.name,'bool');
  assert.equal(fn.variables.find(variable=>variable.name==='answer').type.name,'int');
  assert.equal(fn.values.length,fn.slots);assert.ok(fn.values.every(value=>['rooted-value','scalar-value'].includes(value.storage)));
  assert.equal(fn.values[fn.variables.find(variable=>variable.name==='answer').slot].storage,'scalar-value');
  assert.ok(ir.coverage.some(point=>point.file.endsWith('/math.aug')&&point.line===5));
  const llvm=generateLLVM(ir);
  assert.match(llvm,/DICompileUnit\(language: DW_LANG_C99/);assert.match(llvm,/producer: "August LLVM"/);assert.match(llvm,/DILocalVariable\(name: "answer"/);
  assert.match(llvm,/#dbg_declare\(ptr %slot_/);assert.match(llvm,/call void @aug_coverage_register/);
}));
test('IR verification rejects malformed slots, cleanup edges, callbacks and private ABI operations before LLVM emission',()=>fixture(original=>{
  const mutations=[
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'copy',out:0,input:999,span:ir.functions[0].span});},
    ir=>{ir.functions[0].values[0].storage='unrooted';},
    ir=>{ir.functions[0].values[0].storage='scalar-value';},
    ir=>{ir.functions[0].blocks[0].terminator={op:'jump',target:'missing'};},
    ir=>{ir.functions[0].blocks[0].terminator={op:'return'};},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'call',out:0,function:ir.main,args:[0],span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'runtime',out:0,operation:'BINARY',args:[0],span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'runtime',out:0,operation:'UNKNOWN',args:[],span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'runtime',out:0,operation:'IS_TYPE',args:[0],span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'runtime',out:0,operation:'BINARY',args:[0,0],text:'???',span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'runtime',out:0,operation:'UNARY',args:[0],span:ir.functions[0].span});},
    ir=>{ir.functions[0].scopes.push({name:'invalid',parent:'missing',span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'debug-variable',variable:99,span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'adapter',out:0,name:'untrusted_adapter',args:[],span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'binding-get',out:0,index:99,span:ir.functions[0].span});},
    ir=>{ir.functions[0].blocks[0].instructions.push({op:'decode',out:0,input:0,schema:'missing',format:'json',span:ir.functions[0].span});},
    ir=>{ir.functions[0].owned.push(0);},
  ];
  for(const mutate of mutations){const ir=structuredClone(original);mutate(ir);assert.throws(()=>generateLLVM(ir),IRVerificationError);}
}));

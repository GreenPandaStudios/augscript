#!/usr/bin/env node
// Cache tests exercise the released, source-pinned compiler tool closure.
// Contributor LLVM inputs remain available for building the candidate pack.
import assert from 'node:assert/strict';
import {mkdirSync,existsSync,lstatSync,rmSync,symlinkSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {prepareLLVMCompiler,compilerPackSelection} from '../src/compiler-packs.ts';
import {ensureVerifiedArchive} from '../src/native-artifacts.ts';
import {llvmPlatform} from '../src/llvm-platform.ts';

const root=resolve(import.meta.dirname,'..');
delete process.env.AUG_LLVM_HOME;
const {pack}=compilerPackSelection();
const tools=await ensureVerifiedArchive(pack.archive,{executables:llvmPlatform().tools.map(tool=>'bin/'+tool)});
// Use the current contributor runtime, independently checked by the compiler.
// A released tool archive can contain an older runtime operation table.
process.env.AUG_LLVM_HOME=tools;
process.env.AUG_RUNTIME_PACK??=join(root,'.aug-native/llvm/runtime');
const toolchain=await prepareLLVMCompiler();
assert.ok(toolchain.compilationIdentity,'Cache qualification needs a complete authenticated compiler pack');
const link=join(root,'.aug-build/qualified-test-tools');
mkdirSync(resolve(link,'..'),{recursive:true});
if(existsSync(link)||(()=>{try{return lstatSync(link).isSymbolicLink();}catch{return false;}})()){
  assert.ok(lstatSync(link).isSymbolicLink(),'Refusing to replace a real test-tool directory');
  rmSync(link);
}
symlinkSync(toolchain.tools,link,'dir');
console.log('Qualified compiler test tools: '+link);

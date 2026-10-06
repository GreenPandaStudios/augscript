#!/usr/bin/env node
// Cache tests exercise the exact source-pinned compiler tool closure.
// Contributor LLVM inputs remain available for building the candidate pack.
import assert from 'node:assert/strict';
import {mkdirSync,existsSync,lstatSync,rmSync,symlinkSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {prepareLLVMCompiler,compilerPackSelection} from '../src/compiler-packs.ts';
import {ensureVerifiedArchive} from '../src/native-artifacts.ts';
import {llvmPlatform} from '../src/llvm-platform.ts';
import {compilerCandidateArchive,withLocalCompilerArchive} from './compiler-candidate-transport.mjs';

const root=resolve(import.meta.dirname,'..');
delete process.env.AUG_LLVM_HOME;
const {pack}=compilerPackSelection();
const local=compilerCandidateArchive(root,pack.archive,process.argv.slice(2));
const prepare=()=>ensureVerifiedArchive(pack.archive,{executables:llvmPlatform().tools.map(tool=>'bin/'+tool)});
const tools=local?await withLocalCompilerArchive(pack.archive,local,prepare):await prepare();
// Use the current contributor runtime, independently checked by the compiler.
// The complete sealed compiler closure still authenticates every selected tool.
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
console.log('Qualified compiler test tools ('+(local?'verified-local-candidate':'public-download')+'): '+link);

#!/usr/bin/env node
// Migration gate: run the existing source/runtime expectations through LLVM.
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
if(process.platform!=='darwin'||process.arch!=='arm64'||!process.env.AUG_LLVM_HOME)
  throw new Error('LLVM parity requires the qualified macOS ARM64 maintainer tool pack in AUG_LLVM_HOME');
const suites=[
  'llvm-ir','llvm-backend','approved-design','compiler','language-conformance','language-evolution',
  'robustness','runtime-optimization','oidc-login','documentation','concurrency','interceptors',
  'web-foundation','web-actions','web-http','web-testing','web-policies','web-streams','web-tls',
];
const result=spawnSync(process.execPath,['--test','--test-concurrency=2',...suites.map(name=>'tests/'+name+'.test.mjs')],
  {cwd:root,stdio:'inherit',env:{...process.env,AUG_TEST_BACKEND:'llvm'}});
if(result.error)throw result.error;
process.exitCode=result.status??1;

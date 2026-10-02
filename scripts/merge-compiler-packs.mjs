#!/usr/bin/env node
// Release assembly happens before npm/VSIX packaging. Every platform supplies
// its exact archive pin; the assembler never rebuilds a qualified archive.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {basename,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const releaseHosts=['darwin-arm64','linux-arm64','linux-x64'];
export function mergeCompilerPacks(input,root=resolve(import.meta.dirname,'..'),required=releaseHosts){
  const version=JSON.parse(readFileSync(join(root,'package.json'))).version;
  const manifests=[];
  const walk=directory=>{for(const entry of readdirSync(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);if(entry.isDirectory())walk(path);
    else if(/^compiler-pack-(darwin-arm64|linux-arm64|linux-x64)\.json$/.test(entry.name))manifests.push(path);
  }};walk(input);
  const packs=new Map(),copies=[];
  for(const file of manifests){
    const manifest=JSON.parse(readFileSync(file));
    assert.equal(manifest.format,1);assert.equal(manifest.compiler,version);assert.equal(manifest.llvm,'23.1.2');
    assert.equal(manifest.packs.length,1,'Each producer supplies one host pack');
    const pack=manifest.packs[0];assert.ok(required.includes(pack.host),'Unexpected compiler host');
    assert.ok(!packs.has(pack.host),'Duplicate compiler host');
    const url=new URL(pack.archive.url),filename=basename(url.pathname);
    const artifact=pack.host==='darwin-arm64'?'macos-arm64':pack.host;
    assert.equal(pack.target,{ 'darwin-arm64':'aarch64-apple-darwin','linux-arm64':'aarch64-unknown-linux-gnu','linux-x64':'x86_64-unknown-linux-gnu'}[pack.host]);
    assert.equal(url.href,`https://github.com/GreenPandaStudios/augscript/releases/download/v${version}/aug-llvm-${artifact}.tar.gz`,'Compiler URL must belong to this release');
    assert.equal(pack.archive.fileManifest,'files.json');
    assert.match(pack.archive.sha256,/^[0-9a-f]{64}$/);
    assert.ok(Number.isSafeInteger(pack.archive.maximumUnpackedBytes)&&pack.archive.maximumUnpackedBytes>0);
    assert.equal(pack.host==='darwin-arm64'?pack.minimumOS:pack.minimumLibc,pack.host==='darwin-arm64'?'14.0':'2.36');
    const path=join(resolve(file,'..'),filename),bytes=readFileSync(path);
    assert.equal(bytes.length,pack.archive.maximumDownloadBytes,'Compiler archive size differs from its pin');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),pack.archive.sha256,'Compiler archive digest differs from its pin');
    packs.set(pack.host,pack);copies.push({path,filename});
  }
  assert.deepEqual([...packs.keys()].sort(),[...required].sort(),'A required compiler host is missing');
  // Reject the complete input set before replacing any accepted metadata.
  mkdirSync(join(root,'.aug-build'),{recursive:true});mkdirSync(join(root,'native'),{recursive:true});
  for(const {path,filename} of copies)if(resolve(path)!==join(root,'.aug-build',filename))copyFileSync(path,join(root,'.aug-build',filename));
  const result={format:1,compiler:version,llvm:'23.1.2',packs:[...packs.values()].sort((a,b)=>a.host.localeCompare(b.host))};
  writeFileSync(join(root,'native/compiler-packs.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  assert.ok(process.argv[2]&&existsSync(process.argv[2]),'Provide the downloaded compiler-pack artifact directory');
  console.log(JSON.stringify(mergeCompilerPacks(resolve(process.argv[2]))));
}

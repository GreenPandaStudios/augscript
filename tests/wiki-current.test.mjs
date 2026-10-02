import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {captureQualificationInputs} from '../scripts/qualification-identity.mjs';
import {homepageExample} from '../scripts/homepage-docs.mjs';
import {nativePackageExamples} from '../scripts/native-package-docs.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {generateSpecs} from '../src/spec.ts';

test('homepage publishes the checked program’s actual spec and fully verified measurement',()=>{
  const root=resolve('.'),page=homepageExample(root);
  const checked=checkProject(loadProject(resolve('benchmarks/greetings')));
  const spec=generateSpecs(checked,{manifest:false}).find(output=>output.path.endsWith('/main.aug.md')).text;
  const paragraph=spec.split('## Startup\n\n')[1].split('\n\nBuilt-in operations')[0];
  assert.ok(page.includes(paragraph));
  const report=JSON.parse(readFileSync('docs/greeting-results.json'));
  assert.equal(report.expected.lines,1000000);
  assert.equal(report.expected.bytes,20000000);
  const hash=createHash('sha256');for(let i=0;i<1000000;i++)hash.update('Hello, August! 👋\n');
  assert.equal(report.expected.sha256,hash.digest('hex'));
  assert.ok(report.compilerPack.archiveSha256&&report.compilerPack.runtimeSha256);
  for(const result of report.results)assert.equal(result.milliseconds.samples.length,report.methodology.iterations);
});

test('native package guide uses real canonical projects and current distribution contracts',()=>{
  const page=nativePackageExamples(resolve('.'));
  for(const name of ['pytorch','sqlite','zlib','blake3']) {
    const source=readFileSync('examples/native-'+name+'/main.aug','utf8').replace(/^\/\/ aug-spec:.*\n/,'').trim();
    assert.ok(page.includes(source));
  }
  assert.doesNotMatch(page,/proposed|not published|pending release/i);
});

test('benchmark snapshots reject source changes during preparation or compilation',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-measurement-inputs-'));
  try {
    for(const folder of ['src','runtime','benchmarks','gyms','scripts','native','tests','.github'])mkdirSync(join(root,folder));
    writeFileSync(join(root,'package.json'),JSON.stringify({version:'0.21.0'}));
    for(const file of ['package-lock.json','tsconfig.json'])writeFileSync(join(root,file),'{}');
    writeFileSync(join(root,'benchmarks/program.aug'),'print(value=1)\n');
    writeFileSync(join(root,'benchmarks/reference.c'),'int main(void) { return 0; }\n');
    const snapshot=captureQualificationInputs(root,{august:'benchmarks/program.aug',c:'benchmarks/reference.c'});
    snapshot.verify();
    writeFileSync(join(root,'benchmarks/program.aug'),'print(value=2)\n');
    assert.equal(snapshot.sources.august,'print(value=1)\n');
    assert.throws(snapshot.verify,/Sources changed during preparation, compilation, or measurement/);
    writeFileSync(join(root,'benchmarks/program.aug'),snapshot.sources.august);
    snapshot.verify();
    writeFileSync(join(root,'benchmarks/reference.c'),'int main(void) { return 1; }\n');
    assert.throws(snapshot.verify,/Sources changed/);
  } finally {rmSync(root,{recursive:true,force:true});}
});

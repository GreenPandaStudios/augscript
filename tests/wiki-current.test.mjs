import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
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
